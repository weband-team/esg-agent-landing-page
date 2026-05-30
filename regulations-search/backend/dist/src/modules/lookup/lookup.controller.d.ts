import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { LookupService } from './lookup.service';
import { MatchingEngineService } from '../matching/matching-engine.service';
export declare class LookupController {
    private readonly lookupService;
    private readonly matchingEngineService;
    constructor(lookupService: LookupService, matchingEngineService: MatchingEngineService);
    validateNip(nip: string): import("./nip-validator").NipValidationResult;
    directLookup(nip: string, employees?: string, revenue?: string, assets?: string): Promise<import("../matching/matching-engine.service").MatchingResult>;
    streamProgress(nip: string, employees?: string, revenue?: string, assets?: string): Observable<MessageEvent>;
}
