import { validateNip } from './nip-validator';

describe('NipValidator', () => {
  it('should validate a correct Polish NIP without prefixes', () => {
    const result = validateNip('5252625123'); // F-Suite Sp. z o.o.
    expect(result.isValid).toBe(true);
    expect(result.cleanNip).toBe('5252625123');
  });

  it('should validate a correct Polish NIP with PL prefix', () => {
    const result = validateNip('PL5252625123');
    expect(result.isValid).toBe(true);
    expect(result.cleanNip).toBe('5252625123');
  });

  it('should validate a correct Polish NIP with hyphens or spaces', () => {
    const result = validateNip('525-262-51-23');
    expect(result.isValid).toBe(true);
    expect(result.cleanNip).toBe('5252625123');
  });

  it('should reject a NIP with a foreign EU prefix', () => {
    const result = validateNip('DE5252625123');
    expect(result.isValid).toBe(false);
    expect(result.errorType).toBe('FOREIGN_PREFIX');
    expect(result.prefix).toBe('DE');
  });

  it('should reject a NIP with incorrect length', () => {
    const result = validateNip('12345');
    expect(result.isValid).toBe(false);
    expect(result.errorType).toBe('INVALID_FORMAT');
  });

  it('should reject an empty NIP', () => {
    const result = validateNip('');
    expect(result.isValid).toBe(false);
    expect(result.errorType).toBe('INVALID_FORMAT');
  });

  it('should reject a NIP with an invalid checksum control digit', () => {
    const result = validateNip('1234567891');
    expect(result.isValid).toBe(false);
    expect(result.errorType).toBe('INVALID_CHECKSUM');
  });

  it('should validate other sandbox test NIPs', () => {
    expect(validateNip('7251892345').isValid).toBe(true); // PolMetal S.A.
    expect(validateNip('1234567890').isValid).toBe(true); // Restauracja Smak
    expect(validateNip('9012345678').isValid).toBe(true); // TransLogistic
  });
});
