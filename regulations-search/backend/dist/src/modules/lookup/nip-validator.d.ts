export interface NipValidationResult {
    isValid: boolean;
    errorType?: 'FOREIGN_PREFIX' | 'INVALID_FORMAT' | 'INVALID_CHECKSUM';
    prefix?: string;
    cleanNip?: string;
}
export declare function validateNip(nipInput: string): NipValidationResult;
