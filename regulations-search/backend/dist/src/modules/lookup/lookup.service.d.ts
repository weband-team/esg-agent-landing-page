import { NipValidationResult } from './nip-validator';
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
export declare class LookupService {
    private readonly prisma;
    private mockCompanies;
    constructor(prisma: PrismaService);
    private loadMockCompanies;
    private ensureMockCompaniesLoaded;
    validate(nip: string): NipValidationResult;
    private inferPkdAndMockFlags;
    findByNip(nip: string, customEmployees?: number, customRevenue?: number, customAssets?: number): Promise<CompanyProfile>;
    getAllMockNips(): string[];
}
