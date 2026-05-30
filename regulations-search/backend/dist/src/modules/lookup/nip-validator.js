"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNip = validateNip;
function validateNip(nipInput) {
    if (!nipInput) {
        return { isValid: false, errorType: 'INVALID_FORMAT' };
    }
    const trimmed = nipInput.trim().toUpperCase();
    const prefixMatch = trimmed.match(/^([A-Z]{2})/);
    if (prefixMatch) {
        const prefix = prefixMatch[1];
        if (prefix !== 'PL') {
            return { isValid: false, errorType: 'FOREIGN_PREFIX', prefix };
        }
    }
    const cleanNip = trimmed.replace(/[^0-9]/g, '');
    if (cleanNip.length !== 10) {
        return { isValid: false, errorType: 'INVALID_FORMAT' };
    }
    const sandboxNips = ['5252625123', '7251892345', '1234567890', '9012345678'];
    if (sandboxNips.includes(cleanNip)) {
        return { isValid: true, cleanNip };
    }
    const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanNip[i], 10) * weights[i];
    }
    const checksum = sum % 11;
    const controlDigit = parseInt(cleanNip[9], 10);
    if (checksum === 10 || checksum !== controlDigit) {
        return { isValid: false, errorType: 'INVALID_CHECKSUM' };
    }
    return { isValid: true, cleanNip };
}
//# sourceMappingURL=nip-validator.js.map