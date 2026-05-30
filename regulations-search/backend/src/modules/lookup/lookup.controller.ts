import { Controller, Get, Param, Sse, MessageEvent, BadRequestException, Query } from '@nestjs/common';
import { Observable, interval, of, concat, from } from 'rxjs';
import { map, take, switchMap, catchError, delay, mergeMap } from 'rxjs/operators';
import { LookupService } from './lookup.service';
import { MatchingEngineService } from '../matching/matching-engine.service';

@Controller('lookup')
export class LookupController {
  constructor(
    private readonly lookupService: LookupService,
    private readonly matchingEngineService: MatchingEngineService,
  ) {}

  @Get('validate/:nip')
  validateNip(@Param('nip') nip: string) {
    return this.lookupService.validate(nip);
  }

  @Get('direct/:nip')
  async directLookup(
    @Param('nip') nip: string,
    @Query('employees') employees?: string,
    @Query('revenue') revenue?: string,
    @Query('assets') assets?: string,
  ) {
    const customEmployees = employees ? parseInt(employees, 10) : undefined;
    const customRevenue = revenue ? parseInt(revenue, 10) : undefined;
    const customAssets = assets ? parseInt(assets, 10) : undefined;

    const company = await this.lookupService.findByNip(nip, customEmployees, customRevenue, customAssets);
    return this.matchingEngineService.matchCompany(company);
  }

  @Sse('progress/:nip')
  streamProgress(
    @Param('nip') nip: string,
    @Query('employees') employees?: string,
    @Query('revenue') revenue?: string,
    @Query('assets') assets?: string,
  ): Observable<MessageEvent> {
    const customEmployees = employees ? parseInt(employees, 10) : undefined;
    const customRevenue = revenue ? parseInt(revenue, 10) : undefined;
    const customAssets = assets ? parseInt(assets, 10) : undefined;

    // Validate first. If invalid, emit error event immediately
    const validation = this.lookupService.validate(nip);
    if (!validation.isValid) {
      return of({
        type: 'error',
        data: {
          message: 'Invalid NIP format or foreign prefix',
          errorType: validation.errorType,
          prefix: validation.prefix,
        },
      } as MessageEvent);
    }

    // Step 1: NIP Verification starts immediately
    const step1$ = of({
      type: 'step',
      data: {
        step: 1,
        title: {
          pl: 'Rozpoczynanie weryfikacji NIP...',
          en: 'Starting NIP validation...',
        },
        status: 'success',
      },
    } as MessageEvent);

    // We do the async lookup in a deferred stream so that the connection establishes instantly first
    const lookupAndRemainingSteps$ = from(this.lookupService.findByNip(nip, customEmployees, customRevenue, customAssets)).pipe(
      mergeMap((company) => {
        const matchingResult = this.matchingEngineService.matchCompany(company);

        // Define remaining steps that require the loaded company details
        const remainingSteps = [
          {
            step: 2,
            title: {
              pl: 'Pobieranie danych rejestrowych CEIDG/KRS...',
              en: 'Retrieving CEIDG/KRS registry data...',
            },
            status: 'success',
            meta: {
              name: company.name,
              krs: company.krs,
              regon: company.regon,
              address: `${company.address.street}, ${company.address.city}`,
            },
          },
          {
            step: 3,
            title: {
              pl: 'Uruchamianie 7-stopniowego silnika dopasowania PKD...',
              en: 'Running 7-step PKD matching engine...',
            },
            status: 'success',
          },
          {
            step: 4,
            title: {
              pl: 'Sprawdzanie progów wielkościowych, finansowych i zatrudnienia...',
              en: 'Checking size, financial, and employment thresholds...',
            },
            status: 'success',
            meta: {
              employees: company.employee_count,
              revenue: company.revenue_pln,
            },
          },
          {
            step: 5,
            title: {
              pl: 'Nakładanie unijnych regulacji sektorowych (ESG/CSRD/GDPR)...',
              en: 'Applying EU sector-specific overlays (ESG/CSRD/GDPR)...',
            },
            status: 'success',
          },
          {
            step: 6,
            title: {
              pl: 'Kategoryzacja obowiązków i generowanie rejestru...',
              en: 'Categorizing obligations and generating registry...',
            },
            status: 'success',
          },
        ];

        // Map steps to sequential observables with delay
        const stepObservables = remainingSteps.map((stepData, index) => {
          return of({
            type: 'step',
            data: stepData,
          } as MessageEvent).pipe(delay((index + 1) * 600));
        });

        // The final result event is emitted after all steps complete
        const resultObservable = of({
          type: 'result',
          data: matchingResult,
        } as MessageEvent).pipe(delay((remainingSteps.length + 1) * 600));

        return concat(...stepObservables, resultObservable);
      }),
      catchError((err) => {
        console.error('SSE Lookup or Matching Error:', err);
        return of({
          type: 'error',
          data: { message: err.message || 'Analysis error occurred.' },
        } as MessageEvent);
      })
    );

    return concat(step1$, lookupAndRemainingSteps$);
  }
}
