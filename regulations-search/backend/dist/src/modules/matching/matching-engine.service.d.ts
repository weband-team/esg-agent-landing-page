import { OnModuleInit } from '@nestjs/common';
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
export declare class MatchingEngineService implements OnModuleInit {
    private readonly prisma;
    private regulations;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private loadRegulations;
    loadRegulationsFromDb(): Promise<void>;
    private ensureRegulationsLoaded;
    matchCompany(company: CompanyProfile): MatchingResult;
}
