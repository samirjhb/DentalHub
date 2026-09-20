import { isValidRut } from './is-valid-rut.validator';

describe('isValidRut', () => {
  it('accepts a RUT with a correct check digit', () => {
    expect(isValidRut('12.345.678-5')).toBe(true);
  });

  it('accepts a RUT whose check digit is K', () => {
    expect(isValidRut('11.111.112-K')).toBe(true);
  });

  it('rejects a RUT with an incorrect check digit', () => {
    expect(isValidRut('11.111.111-2')).toBe(false);
  });

  it('rejects a malformed RUT (missing dash)', () => {
    expect(isValidRut('123456785')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidRut('')).toBe(false);
  });
});
