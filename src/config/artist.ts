/**
 * This build is single-artist: the whole app is one artist's storefront,
 * not a multi-artist marketplace. Every "which artist" lookup in the app
 * goes through this one constant instead of a browse/search flow.
 *
 * Override via VITE_ARTIST_SLUG once the real artist profile is created
 * in Firestore (see functions/scripts/seed.ts for the demo doc's slug).
 */
export const THE_ARTIST_SLUG = import.meta.env.VITE_ARTIST_SLUG || 'deallead'
