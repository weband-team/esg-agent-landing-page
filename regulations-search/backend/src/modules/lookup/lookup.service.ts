import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { validateNip, NipValidationResult } from './nip-validator';
import { PrismaService } from '../../database/prisma.service';

export interface CompanyAddress {
  street: string;
  city: string;
  postal_code: string;
  country: string;
}

export interface CompanyProfile {
  nip: string;
  name: string;
  legal_form: string;
  krs: string;
  regon: string;
  registration_date: string;
  address: CompanyAddress;
  pkd: string[];
  is_registered_in_poland: boolean;
  is_vat_taxpayer: boolean;
  revenue_pln: number;
  assets_pln: number;
  employee_count: number;
  has_contractors: boolean;
  is_sole_trader: boolean;
  has_cross_border_payments: boolean;
  has_related_party_transactions: boolean;
  processes_personal_data: boolean;
  processes_sensitive_data_large_scale: boolean;
  monitors_subjects_large_scale: boolean;
  has_combustion: boolean;
  has_company_vehicles: boolean;
  has_boilers: boolean;
  has_process_emissions: boolean;
  has_energy_activities: boolean;
  has_telecom_activities: boolean;
  has_payment_services: boolean;
  has_foreign_workers: boolean;
  introduces_packaged_goods: boolean;
  generates_hazardous_waste: boolean;
}

@Injectable()
export class LookupService {
  private mockCompanies: CompanyProfile[] = [];

  constructor(private readonly prisma: PrismaService) {
    this.loadMockCompanies();
  }

  private loadMockCompanies() {
    try {
      let filePath = path.join(__dirname, '..', '..', 'database', 'mock_companies.json');
      if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, '..', '..', '..', 'database', 'mock_companies.json');
      }
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      this.mockCompanies = JSON.parse(fileContent);
    } catch (error) {
      console.error('Failed to load mock companies database:', error);
      this.mockCompanies = [];
    }
  }

  private ensureMockCompaniesLoaded() {
    if (this.mockCompanies.length === 0) {
      this.loadMockCompanies();
    }
  }

  public validate(nip: string): NipValidationResult {
    return validateNip(nip);
  }

  private inferPkdAndMockFlags(name: string, legalForm: string) {
    const cleanName = name.toUpperCase();
    let pkd = ['62.01.Z']; // default SaaS/software
    let employees = 12;
    let revenue = 3500000;
    let assets = 1500000;
    let flags = {
      has_contractors: true,
      processes_personal_data: true,
      processes_sensitive_data_large_scale: false,
      monitors_subjects_large_scale: false,
      has_combustion: false,
      has_company_vehicles: true,
      has_boilers: false,
      has_process_emissions: false,
      has_energy_activities: false,
      has_telecom_activities: false,
      has_payment_services: false,
      has_foreign_workers: false,
      introduces_packaged_goods: false,
      generates_hazardous_waste: false,
      has_cross_border_payments: false,
      has_related_party_transactions: false,
    };

    if (
      cleanName.includes('METAL') ||
      cleanName.includes('PRODUKC') ||
      cleanName.includes('HUTA') ||
      cleanName.includes('FABRYK') ||
      cleanName.includes('STAL') ||
      cleanName.includes('BUDOW')
    ) {
      pkd = ['24.10.Z', '25.11.Z'];
      employees = 150;
      revenue = 45000000;
      assets = 20000000;
      flags.has_combustion = true;
      flags.has_boilers = true;
      flags.has_process_emissions = true;
      flags.introduces_packaged_goods = true;
      flags.generates_hazardous_waste = true;
      flags.has_cross_border_payments = true;
      flags.has_related_party_transactions = true;
    } else if (
      cleanName.includes('RESTAUR') ||
      cleanName.includes('CAFE') ||
      cleanName.includes('BAR') ||
      cleanName.includes('SMAK') ||
      cleanName.includes('JEDZENIE') ||
      cleanName.includes('GASTRON') ||
      cleanName.includes('SPOŻYW')
    ) {
      pkd = ['56.10.A'];
      employees = 6;
      revenue = 950000;
      assets = 300000;
    } else if (
      cleanName.includes('TRANSPORT') ||
      cleanName.includes('LOGISTY') ||
      cleanName.includes('CARGO') ||
      cleanName.includes('SPEDY') ||
      cleanName.includes('SHIPPING') ||
      cleanName.includes('AUTO')
    ) {
      pkd = ['49.41.Z'];
      employees = 45;
      revenue = 18000000;
      assets = 8000000;
      flags.has_company_vehicles = true;
      flags.has_foreign_workers = true;
      flags.has_cross_border_payments = true;
    } else if (legalForm === 'sa') {
      employees = 180;
      revenue = 65000000;
      assets = 35000000;
    } else if (legalForm === 'sole_trader') {
      employees = 1;
      revenue = 180000;
      assets = 50000;
      flags.has_contractors = false;
      flags.has_company_vehicles = false;
    }

    return { pkd, employees, revenue, assets, flags };
  }

  public async findByNip(
    nip: string,
    customEmployees?: number,
    customRevenue?: number,
    customAssets?: number,
  ): Promise<CompanyProfile> {
    this.ensureMockCompaniesLoaded();
    const validation = this.validate(nip);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Invalid NIP format or foreign prefix',
        validation,
      });
    }

    const cleanNip = validation.cleanNip!;
    let company: any = null;

    try {
      const dbComp = await this.prisma.company.findUnique({
        where: { nip: cleanNip },
      });
      if (dbComp) {
        const localMock = this.mockCompanies.find((c) => c.nip === cleanNip);
        if (localMock) {
          company = localMock;
        } else {
          const inferred = this.inferPkdAndMockFlags(dbComp.name, dbComp.legal_form);
          company = {
            nip: dbComp.nip,
            name: dbComp.name,
            legal_form: dbComp.legal_form,
            krs: dbComp.krs || '',
            regon: dbComp.regon || '',
            registration_date: '2015-01-01',
            address: dbComp.address as any,
            pkd: dbComp.pkd_codes as string[],
            is_registered_in_poland: true,
            is_vat_taxpayer: true,
            revenue_pln: dbComp.revenue_pln,
            assets_pln: dbComp.assets_pln,
            employee_count: dbComp.employee_count,
            is_sole_trader: dbComp.legal_form === 'sole_trader',
            ...inferred.flags,
          };
        }
      }
    } catch (err) {
      console.warn('Database query failed in LookupService, falling back to JSON storage:', err.message);
    }

    if (!company) {
      company = this.mockCompanies.find((c) => c.nip === cleanNip);
    }

    let companyObj: CompanyProfile;

    if (!company) {
      try {
        // Query the live public KAS White List API
        // To be safe with global server timezones and avoid future-date exceptions, use yesterday's date
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const dateStr = yesterday.toISOString().split('T')[0];

        const url = `https://wl-api.mf.gov.pl/api/search/nip/${cleanNip}?date=${dateStr}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Government API responded with status ${response.status}`);
        }

        const data: any = await response.json();

        if (!data || !data.result || !data.result.subject) {
          throw new NotFoundException({
            message: 'Podmiot o podanym numerze NIP nie został odnaleziony w oficjalnym wykazie podatników Ministerstwa Finansów.',
            enMessage: 'The company with the provided NIP was not found in the official registry of the Ministry of Finance.',
          });
        }

        const subject = data.result.subject;

        // 1. Infer Legal Form from name
        const name = subject.name || 'Unknown Company';
        const nameUpper = name.toUpperCase();
        let legalForm = 'sole_trader';

        if (nameUpper.includes('SPÓŁKA Z OGRANICZONĄ') || nameUpper.includes('SP. Z O.O.')) {
          legalForm = 'sp_z_o_o';
        } else if (nameUpper.includes('SPÓŁKA AKCYJNA') || nameUpper.includes('S.A.')) {
          legalForm = 'sa';
        } else if (nameUpper.includes('SPÓŁKA JAWNA') || nameUpper.includes('SP. J.')) {
          legalForm = 'sp_j';
        } else if (nameUpper.includes('SPÓŁKA KOMANDYTOWA') || nameUpper.includes('SP. K.')) {
          legalForm = 'sp_k';
        }

        // 2. Parse working or residence address from KAS format
        const addrStr = subject.workingAddress || subject.residenceAddress || '';
        let address = {
          street: 'Brak adresu / Street not found',
          city: 'Warszawa',
          postal_code: '00-001',
          country: 'Polska',
        };

        if (addrStr) {
          const parts = addrStr.split(',');
          if (parts.length >= 2) {
            const street = parts[0].trim();
            const rest = parts[1].trim();
            const zipCityMatch = rest.match(/^(\d{2}-\d{3})\s+(.+)$/);
            if (zipCityMatch) {
              address = {
                street,
                postal_code: zipCityMatch[1],
                city: zipCityMatch[2].trim(),
                country: 'Polska',
              };
            } else {
              address = {
                street,
                city: rest,
                postal_code: '00-001',
                country: 'Polska',
              };
            }
          } else {
            address.street = addrStr;
          }
        }

        // 3. Dynamic PKD, employee, revenue, and EHS triggers inference
        const inferred = this.inferPkdAndMockFlags(name, legalForm);

        companyObj = {
          nip: cleanNip,
          name,
          legal_form: legalForm,
          krs: subject.krs || '',
          regon: subject.regon || '',
          registration_date: subject.registrationLegalDate || '2015-01-01',
          address,
          pkd: inferred.pkd,
          is_registered_in_poland: true,
          is_vat_taxpayer: subject.statusVat === 'Czynny',
          revenue_pln: inferred.revenue,
          assets_pln: inferred.assets,
          employee_count: inferred.employees,
          is_sole_trader: legalForm === 'sole_trader',
          ...inferred.flags,
        };
      } catch (err) {
        console.error('Error querying wl-api.mf.gov.pl:', err);
        if (err instanceof NotFoundException) {
          throw err;
        }
        throw new BadRequestException({
          message: `Wyszukiwanie NIP nie powiodło się: ${err.message}`,
          enMessage: `NIP lookup failed: ${err.message}`,
        });
      }
    } else {
      // Deep copy to prevent modifying shared mock companies state in memory
      companyObj = JSON.parse(JSON.stringify(company));
    }

    // Apply manual overrides if they are provided as valid numbers
    if (customEmployees !== undefined && !isNaN(customEmployees)) {
      companyObj.employee_count = customEmployees;
    }
    if (customRevenue !== undefined && !isNaN(customRevenue)) {
      companyObj.revenue_pln = customRevenue;
    }
    if (customAssets !== undefined && !isNaN(customAssets)) {
      companyObj.assets_pln = customAssets;
    }

    return companyObj;
  }

  public getAllMockNips(): string[] {
    this.ensureMockCompaniesLoaded();
    return this.mockCompanies.map((c) => c.nip);
  }
}
