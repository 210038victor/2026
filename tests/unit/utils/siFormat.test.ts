import { describe, it, expect } from 'vitest'
import { siFormat, parseSI } from '../../../src/utils/siFormat'

describe('siFormat', () => {
  it('formats zero', () => {
    expect(siFormat(0, 'Ω')).toBe('0 Ω')
  })
  it('formats kilo', () => {
    expect(siFormat(1500, 'Ω')).toBe('1.5 kΩ')
  })
  it('formats mega', () => {
    expect(siFormat(1_000_000, 'Ω')).toBe('1 MΩ')
  })
  it('formats milli', () => {
    expect(siFormat(0.001, 'A')).toBe('1 mA')
  })
  it('formats micro', () => {
    expect(siFormat(0.000001, 'F')).toBe('1 µF')
  })
  it('formats nano', () => {
    expect(siFormat(1e-9, 'F')).toBe('1 nF')
  })
  it('formats pico', () => {
    expect(siFormat(1e-12, 'F')).toBe('1 pF')
  })
  it('formats plain value', () => {
    expect(siFormat(100, 'Ω')).toBe('100 Ω')
  })
  it('formats negative value', () => {
    expect(siFormat(-5000, 'V')).toBe('-5 kV')
  })
})

describe('parseSI', () => {
  it('parses kilo', () => {
    expect(parseSI('1.5 k')).toBeCloseTo(1500)
  })
  it('parses milli', () => {
    expect(parseSI('1 m')).toBeCloseTo(0.001)
  })
  it('parses plain', () => {
    expect(parseSI('100')).toBeCloseTo(100)
  })
})
