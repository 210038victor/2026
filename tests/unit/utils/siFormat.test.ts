import { describe, it, expect } from 'vitest';
import { formatSI } from '../../../src/utils/siFormat';

describe('formatSI', () => {
  it('formats zero correctly', () => {
    expect(formatSI(0, 'V')).toBe('0 V');
  });

  it('formats values in base units', () => {
    const result = formatSI(5, 'V');
    expect(result).toContain('V');
    expect(result).toContain('5');
  });

  it('formats milliamps correctly', () => {
    const result = formatSI(5e-3, 'A');
    expect(result).toContain('m');
    expect(result).toContain('A');
  });

  it('formats kilohms correctly', () => {
    const result = formatSI(1000, 'Ω');
    expect(result).toContain('k');
    expect(result).toContain('Ω');
  });

  it('formats microfarads correctly', () => {
    const result = formatSI(1e-6, 'F');
    expect(result).toContain('µ');
    expect(result).toContain('F');
  });

  it('formats nanofarads correctly', () => {
    const result = formatSI(1e-9, 'F');
    expect(result).toContain('n');
    expect(result).toContain('F');
  });

  it('formats megaohms correctly', () => {
    const result = formatSI(1e6, 'Ω');
    expect(result).toContain('M');
    expect(result).toContain('Ω');
  });

  it('handles negative values', () => {
    const result = formatSI(-5, 'V');
    expect(result).toContain('-');
    expect(result).toContain('V');
  });

  it('handles infinity', () => {
    const result = formatSI(Infinity, 'V');
    expect(result).toContain('Infinity');
  });
});
