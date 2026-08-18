import { describe, expect, it } from 'vitest'
import { calculateRevenueSplit, type RevenueSplitConfigSnapshot } from './money.js'

const config: RevenueSplitConfigSnapshot = {
  version: 1,
  advertisingArtistPct: 70,
  merchPlatformCommissionPct: 10,
  subscriptionArtistPct: 70,
}

describe('calculateRevenueSplit', () => {
  it('splits advertising revenue 70/30 artist/platform', () => {
    const result = calculateRevenueSplit(1000, 0, 'advertising', config)
    expect(result.netBeforeSplitCents).toBe(1000)
    expect(result.artistShareCents).toBe(700)
    expect(result.platformShareCents).toBe(300)
    expect(result.finalNetCents).toBe(700)
  })

  it('splits subscription revenue 70/30 artist/platform', () => {
    const result = calculateRevenueSplit(2000, 100, 'subscription', config)
    expect(result.netBeforeSplitCents).toBe(1900)
    expect(result.artistShareCents).toBe(1330)
    expect(result.platformShareCents).toBe(570)
  })

  it('takes a 10% platform commission on merchandise, artist keeps the rest', () => {
    const result = calculateRevenueSplit(5000, 0, 'merchandise', config)
    expect(result.platformShareCents).toBe(500)
    expect(result.artistShareCents).toBe(4500)
  })

  it('never produces fractional cents', () => {
    const result = calculateRevenueSplit(999, 1, 'advertising', config)
    expect(Number.isInteger(result.artistShareCents)).toBe(true)
    expect(Number.isInteger(result.platformShareCents)).toBe(true)
  })

  it('artist and platform shares always sum to the net amount', () => {
    for (const gross of [1, 99, 1000, 123456]) {
      const result = calculateRevenueSplit(gross, 0, 'merchandise', config)
      expect(result.artistShareCents + result.platformShareCents).toBe(result.netBeforeSplitCents)
    }
  })

  it('is unaffected by editing the config object after the call (no shared mutable state)', () => {
    const localConfig = { ...config }
    const result = calculateRevenueSplit(1000, 0, 'advertising', localConfig)
    localConfig.advertisingArtistPct = 10
    expect(result.artistShareCents).toBe(700)
  })
})
