const PREFIXES: Array<{ prefix: string; exponent: number }> = [
  { prefix: 'T', exponent: 12 },
  { prefix: 'G', exponent: 9 },
  { prefix: 'M', exponent: 6 },
  { prefix: 'k', exponent: 3 },
  { prefix: '', exponent: 0 },
  { prefix: 'm', exponent: -3 },
  { prefix: 'µ', exponent: -6 },
  { prefix: 'n', exponent: -9 },
  { prefix: 'p', exponent: -12 },
];

export function formatSI(value: number, unit: string): string {
  if (!isFinite(value)) return `${value} ${unit}`;
  if (value === 0) return `0 ${unit}`;

  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  for (const { prefix, exponent } of PREFIXES) {
    const factor = Math.pow(10, exponent);
    if (abs >= factor || exponent === -12) {
      const scaled = abs / factor;
      const formatted = scaled < 100 ? scaled.toPrecision(3) : Math.round(scaled).toString();
      return `${sign}${formatted} ${prefix}${unit}`;
    }
  }

  return `${value} ${unit}`;
}
