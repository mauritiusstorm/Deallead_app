/**
 * Pure revenue-split arithmetic — no I/O, fully unit-testable, and the
 * ONLY place split percentages are turned into cent amounts. Every
 * transaction is computed against the artist's `activeRevenueSplitConfig`
 * *snapshot* passed in by the caller, never re-read live, so a later
 * config edit can never retroactively change a past transaction.
 *
 * All amounts are integer cents — never floats (spec §12).
 */

export interface RevenueSplitConfigSnapshot {
  version: number
  advertisingArtistPct: number
  merchPlatformCommissionPct: number
  subscriptionArtistPct: number
}

export type RevenueSource = 'advertising' | 'subscription' | 'merchandise' | 'ticketing'

export interface SplitResult {
  netBeforeSplitCents: number
  artistShareCents: number
  teamShareCents: number
  platformShareCents: number
  finalNetCents: number
}

function roundCents(value: number): number {
  return Math.round(value)
}

/**
 * `advertising`/`subscription` are expressed as an artist share percentage;
 * `merchandise` is expressed as a platform commission percentage instead
 * (matching the spec's default config), everything else falls to the
 * artist. `ticketing` currently follows the same commission model as
 * merchandise until a dedicated config field is introduced.
 */
export function calculateRevenueSplit(
  grossAmountCents: number,
  feesCents: number,
  source: RevenueSource,
  config: RevenueSplitConfigSnapshot,
): SplitResult {
  const netBeforeSplitCents = grossAmountCents - feesCents

  let artistShareCents: number
  if (source === 'advertising') {
    artistShareCents = roundCents((netBeforeSplitCents * config.advertisingArtistPct) / 100)
  } else if (source === 'subscription') {
    artistShareCents = roundCents((netBeforeSplitCents * config.subscriptionArtistPct) / 100)
  } else {
    // merchandise / ticketing: platform takes a commission, artist keeps the rest.
    const platformCommission = roundCents((netBeforeSplitCents * config.merchPlatformCommissionPct) / 100)
    artistShareCents = netBeforeSplitCents - platformCommission
  }

  const platformShareCents = netBeforeSplitCents - artistShareCents
  const teamShareCents = 0 // team-member splits are applied downstream from the artist's share, not the platform's.

  return {
    netBeforeSplitCents,
    artistShareCents,
    teamShareCents,
    platformShareCents,
    finalNetCents: artistShareCents,
  }
}
