const SI_PREFIXES: { factor: number; symbol: string }[] = [
  { factor: 1e12, symbol: 'T' },
  { factor: 1e9, symbol: 'G' },
  { factor: 1e6, symbol: 'M' },
  { factor: 1e3, symbol: 'k' },
  { factor: 1, symbol: '' },
  { factor: 1e-3, symbol: 'm' },
  { factor: 1e-6, symbol: 'µ' },
  { factor: 1e-9, symbol: 'n' },
  { factor: 1e-12, symbol: 'p' },
]

/**
 * Format a number with SI prefix and unit.
 * e.g. siFormat(1500, 'Ω') => '1.5 kΩ'
 */
export function siFormat(value: number, unit: string, decimals = 3): string {
  if (value === 0) return `0 ${unit}`
  const abs = Math.abs(value)
  const prefix = SI_PREFIXES.find((p) => abs >= p.factor) ?? SI_PREFIXES[SI_PREFIXES.length - 1]
  const scaled = value / prefix.factor
  const formatted = parseFloat(scaled.toPrecision(decimals))
  return `${formatted} ${prefix.symbol}${unit}`
}

/**
 * Parse a string with SI prefix back to number.
 * e.g. parseSI('1.5 kΩ') => 1500
 */
export function parseSI(str: string): number {
  const symbolMap: Record<string, number> = {
    T: 1e12,
    G: 1e9,
    M: 1e6,
    k: 1e3,
    '': 1,
    m: 1e-3,
    µ: 1e-6,
    n: 1e-9,
    p: 1e-12,
  }
  const match = str.trim().match(/^([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*([TGMkmµnp]?)/)
  if (!match) return NaN
  const num = parseFloat(match[1])
  const sym = match[2] ?? ''
  return num * (symbolMap[sym] ?? 1)
}
