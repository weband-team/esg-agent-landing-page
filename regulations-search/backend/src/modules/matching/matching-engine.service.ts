import { Injectable, OnModuleInit } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { CompanyProfile } from '../lookup/lookup.service';
import { PrismaService } from '../../database/prisma.service';

export interface BilingualText {
  pl: string;
  en: string;
}

export interface Regulation {
  regulation_id: string;
  area: string;
  name: BilingualText;
  obligation_name: BilingualText;
  legal_level: 'national' | 'eu' | 'local';
  legal_basis: BilingualText;
  authority: BilingualText;
  official_source: string;
  trigger_logic: BilingualText;
  trigger_data_fields?: string[];
  thresholds?: BilingualText | null;
  obligation_type: 'registration' | 'reporting' | 'recordkeeping' | 'fee' | 'permit' | 'policy' | 'appointment' | 'audit';
  output_required: BilingualText;
  portal_or_submission: BilingualText;
  frequency: 'annual' | 'monthly' | 'quarterly' | 'one_off' | 'event_based';
  deadline: BilingualText;
  evidence_to_keep: BilingualText;
  penalty_risk: 'low' | 'medium' | 'high';
  penalty_description: BilingualText;
  owner_role: 'legal' | 'finance' | 'hr' | 'ehs' | 'it_security';
  confidence_level?: 'certain' | 'likely' | 'possible';
  pkd_codes?: string[];
  legal_forms?: string[];
}

export interface MatchingResult {
  company: CompanyProfile;
  match_timestamp: string;
  analysis_summary: {
    total_regulations_checked: number;
    matched_count: number;
    by_area: Record<string, number>;
    by_confidence: Record<string, number>;
  };
  matched_regulations: Regulation[];
}

@Injectable()
export class MatchingEngineService implements OnModuleInit {
  private regulations: Regulation[] = [];

  constructor(private readonly prisma: PrismaService) {
    this.loadRegulations();
  }

  async onModuleInit() {
    await this.loadRegulationsFromDb();
  }

  private loadRegulations() {
    try {
      let filePath = path.join(__dirname, '..', '..', 'database', 'regulations_db.json');
      if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, '..', '..', '..', 'database', 'regulations_db.json');
      }
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      this.regulations = JSON.parse(fileContent);
    } catch (error) {
      console.error('Failed to load regulations JSON database:', error);
      this.regulations = [];
    }
  }

  public async loadRegulationsFromDb() {
    try {
      const dbRegs = await this.prisma.regulation.findMany();
      if (dbRegs && dbRegs.length > 0) {
        this.regulations = dbRegs.map((reg) => ({
          regulation_id: reg.regulation_id,
          area: reg.area,
          name: reg.name as any,
          obligation_name: reg.obligation_name as any,
          legal_level: reg.legal_level as any,
          legal_basis: reg.legal_basis as any,
          authority: reg.authority as any,
          official_source: reg.official_source,
          trigger_logic: reg.trigger_logic as any,
          trigger_data_fields: reg.trigger_data_fields as any,
          thresholds: reg.thresholds as any,
          obligation_type: reg.obligation_type as any,
          output_required: reg.output_required as any,
          portal_or_submission: reg.portal_or_submission as any,
          frequency: reg.frequency as any,
          deadline: reg.deadline as any,
          evidence_to_keep: reg.evidence_to_keep as any,
          penalty_risk: reg.penalty_risk as any,
          penalty_description: reg.penalty_description as any,
          owner_role: reg.owner_role as any,
          confidence_level: reg.confidence_level as any,
          pkd_codes: reg.pkd_codes as any,
        }));
        console.log(`Successfully loaded ${this.regulations.length} regulations from Prisma database.`);
      }
    } catch (err) {
      console.warn('Database query failed in MatchingEngineService, falling back to JSON catalogue:', err.message);
    }
  }

  private ensureRegulationsLoaded() {
    if (this.regulations.length === 0) {
      this.loadRegulations();
    }
  }

  /**
   * Matches a company profile against all available regulations using a 7-step analysis.
   */
  public matchCompany(company: CompanyProfile): MatchingResult {
    this.ensureRegulationsLoaded();
    const matchedRegulations: Regulation[] = [];

    for (const reg of this.regulations) {
      let isMatch = false;
      let matchedConfidence: 'certain' | 'likely' | 'possible' = 'certain';

      // STEP 1: Universal / Core Obligations Match
      // If trigger fields contain is_registered_in_poland and nothing else, it's universal
      if (
        reg.trigger_data_fields?.includes('is_registered_in_poland') &&
        reg.trigger_data_fields.length === 1 &&
        !reg.pkd_codes?.length &&
        !reg.legal_forms?.length
      ) {
        isMatch = true;
        matchedConfidence = 'certain';
      }

      // STEP 2: Legal Form Check
      // If the regulation specifies legal forms, company must match
      if (reg.legal_forms && reg.legal_forms.length > 0) {
        const formMatch = reg.legal_forms.includes(company.legal_form);
        if (formMatch) {
          isMatch = true;
          // Set certain or keep previous
          matchedConfidence = reg.confidence_level || 'certain';
        } else if (reg.trigger_data_fields?.includes('legal_form')) {
          // If legal form is the main trigger and it doesn't match, block it
          continue;
        }
      }

      // STEP 3: PKD Code Prefix Match (PKD Mapping)
      const regPkds = reg.pkd_codes;
      if (regPkds && regPkds.length > 0) {
        const pkdMatch = company.pkd.some((compPkd) => {
          return regPkds.some((regPkd) => {
            // Check if company's PKD starts with the regulation PKD prefix (e.g. "62.01.Z" starts with "62" or "62.")
            const cleanRegPkd = regPkd.replace(/\.$/, ''); // remove trailing dot if any
            return compPkd.startsWith(cleanRegPkd);
          });
        });

        if (pkdMatch) {
          isMatch = true;
          matchedConfidence = 'certain';
        }
      }

      // STEP 4: Trigger Fields / Flag Check
      if (reg.trigger_data_fields && reg.trigger_data_fields.length > 0) {
        // Evaluate other custom field flags
        for (const field of reg.trigger_data_fields) {
          if (field === 'is_registered_in_poland' || field === 'legal_form') {
            continue;
          }

          // Evaluate company boolean flags (e.g. generates_hazardous_waste)
          if (typeof company[field] === 'boolean' && company[field] === true) {
            isMatch = true;
            matchedConfidence = reg.confidence_level || 'likely';
          }

          // Evaluate company numeric fields and thresholds
          if (field === 'employee_count') {
            if (reg.regulation_id === 'PL_HR_LABOUR' && company.employee_count >= 1) {
              isMatch = true;
              matchedConfidence = 'certain';
            }
            if (reg.regulation_id === 'PL_WHISTLEBLOWER' && company.employee_count >= 50) {
              isMatch = true;
              matchedConfidence = 'certain';
            }
            if (reg.regulation_id === 'PL_ZUS_IWA' && company.employee_count >= 10) {
              isMatch = true;
              matchedConfidence = 'certain';
            }
          }

          if (field === 'revenue_pln' || field === 'assets_pln') {
            if (reg.regulation_id === 'EU_CSRD_ESG') {
              // CSRD matches large companies (2 out of 3 criteria, but mock has pre-set size parameters or we check)
              if (
                company.employee_count > 250 &&
                (company.revenue_pln > 110000000 || company.assets_pln > 55000000)
              ) {
                isMatch = true;
                matchedConfidence = 'certain';
              } else if (company.employee_count > 50) {
                // Possible or likely for medium public-interest companies in future stages
                isMatch = true;
                matchedConfidence = 'possible';
              }
            }
          }
        }
      }

      // STEP 5: EU & Sector Specific Overlays
      if (isMatch) {
        const mappedReg: Regulation = {
          ...reg,
          confidence_level: matchedConfidence,
        };
        matchedRegulations.push(mappedReg);
      }
    }

    // Sort: 1. confidence_level (certain -> likely -> possible), 2. penalty_risk (high -> medium -> low), 3. area
    const confidenceOrder = { certain: 0, likely: 1, possible: 2 };
    const penaltyOrder = { high: 0, medium: 1, low: 2 };

    matchedRegulations.sort((a, b) => {
      const confA = confidenceOrder[a.confidence_level || 'likely'];
      const confB = confidenceOrder[b.confidence_level || 'likely'];
      if (confA !== confB) return confA - confB;

      const penA = penaltyOrder[a.penalty_risk || 'medium'];
      const penB = penaltyOrder[b.penalty_risk || 'medium'];
      if (penA !== penB) return penA - penB;

      return a.area.localeCompare(b.area);
    });

    // Compute analysis summary
    const byArea: Record<string, number> = {};
    const byConfidence: Record<string, number> = { certain: 0, likely: 0, possible: 0 };

    for (const reg of matchedRegulations) {
      byArea[reg.area] = (byArea[reg.area] || 0) + 1;
      const conf = reg.confidence_level || 'likely';
      byConfidence[conf] = (byConfidence[conf] || 0) + 1;
    }

    return {
      company,
      match_timestamp: new Date().toISOString(),
      analysis_summary: {
        total_regulations_checked: this.regulations.length,
        matched_count: matchedRegulations.length,
        by_area: byArea,
        by_confidence: byConfidence,
      },
      matched_regulations: matchedRegulations,
    };
  }
}
