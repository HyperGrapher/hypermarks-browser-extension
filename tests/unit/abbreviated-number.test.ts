import { describe, expect, it } from 'vitest';
import { parseAbbrTwitterNumber } from '../../packages/shared/lib/utils/abbreviated-string-parser';

describe('parseAbbrTwitterNumber', () => {
  it('parses plain numbers', () => {
    expect(parseAbbrTwitterNumber('7')).toBe(7);
    expect(parseAbbrTwitterNumber('999')).toBe(999);
  });

  it('parses the K, M and B suffixes', () => {
    expect(parseAbbrTwitterNumber('1K')).toBe(1_000);
    expect(parseAbbrTwitterNumber('38K')).toBe(38_000);
    expect(parseAbbrTwitterNumber('380M')).toBe(380_000_000);
    expect(parseAbbrTwitterNumber('1B')).toBe(1_000_000_000);
  });

  it('parses decimals before a suffix', () => {
    expect(parseAbbrTwitterNumber('3.4K')).toBe(3_400);
    expect(parseAbbrTwitterNumber('3.3M')).toBe(3_300_000);
    expect(parseAbbrTwitterNumber('1.7B')).toBe(1_700_000_000);
  });

  it('throws on anything else', () => {
    expect(() => parseAbbrTwitterNumber('abc')).toThrow('Invalid number format');
    expect(() => parseAbbrTwitterNumber('5X')).toThrow('Invalid number format');
    expect(() => parseAbbrTwitterNumber('1k')).toThrow('Invalid number format');
  });
});
