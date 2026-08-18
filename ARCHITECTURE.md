# Deallead — Architecture

Audit + technical proposal, and the record of what Phase 1 actually built.
See the original brief for full context; this document is the executable
version of it.

## 1. Repository audit

The repository was **empty** at the start of this work (no commits, no
files besides `.git/`) — a from-scratch build, not a migration. Nothing to
preserve, nothing to break. Phase 0 is therefore trivial and Phase 1 starts
immediately, per the brief's own instruction ("commencer ensuite
l'implémentation de la PHASE 1 sauf si une décision critique est réellement
bloquante").

## 2. What Phase 1 delivered

- Vite + React 19 + TypeScript (strict) + Tailwind CSS v4, path-aliased (`@/*`).
- Feature-based `src/` structure (see §9) mirrored by `functions/src/`.
- Firebase client init (Auth/Firestore/Storage/Functions/Messaging/App
  Check) wired to the Emulator Suite in dev.
- A small design system (`components/ui`) on the brand's black/white,
  Bebas Neue + Inter palette.
- Core domain types as Zod schemas (`src/types`) — the single source of
  truth every Firestore read/write is validated against.
- Full router with three shells (fan bottom-nav, artist-dashboard sidebar,
  admin sidebar) and permission-aware route guards.
- Every MVP screen from the brief is routed. Auth, home, search, artist
  profile, account/settings, and now-playing are fully implemented; the
  remaining fan/artist/admin screens are typed, routed placeholders ready
  to be filled in Phases 3–8.
- The audio player: a Zustand store + `PlayerService` abstraction over
  HTML5 `<audio>` and the Media Session API, with significant-event-only
  listening analytics.
- i18next (fr/en), namespaced.
- Firebase Auth (email/password + Google), onboarding skeleton.
- Firestore Security Rules + Storage Rules + composite indexes, enforcing
  every role in §4.
- Cloud Functions scaffold: idempotent Stripe webhook router, checkout
  session creation, Connect onboarding links, artist-owner bootstrap
  trigger, team invites, push notifications — plus the pure, unit-tested
  revenue-split math.
- `firebase.json` / `.firebaserc` / emulator ports.
- Capacitor: `android/` and `ios/` native projects generated and committed.
- Vitest set up on both the app and Functions; lint/typecheck/test/build
  all pass clean.
- GitHub Actions CI for both codebases, gated on `main`.

Everything below Phase 1 in the brief's roadmap (deep music-upload
pipeline, full merch/checkout flow, events/ticketing, the financial
dashboards, admin back-office, mobile builds, SEO, a11y polish) is
**scaffolded and typed but not implemented** — that's the honest state,
not a gap to paper over. §12 lists it explicitly.

## 3. Firestore data model

Access/query-first, not a relational port. Collections are top-level
(sub-collections used only where genuinely 1:1 with a parent, e.g. product
variants) so security rules and indexes stay simple.

```
users/{userId}
artists/{artistId}
artistMembers/{artistId}_{userId}        ← composite ID, O(1) role lookup
artistInvites/{inviteId}
follows/{userId}_{artistId}              ← composite ID
tracks/{trackId}
albums/{albumId}
playlists/{playlistId}
favorites/{userId}_{trackId}             ← composite ID
exclusiveContents/{contentId}
listeningEvents/{eventId}                ← significant events only, never per-tick
listeningSessions/{sessionId}
products/{productId}
  /variants/{variantId}                  ← sub-collection
promoCodes/{codeId}
orders/{orderId}
  /items/{itemId}                        ← sub-collection
subscriptions/{userId}_{artistId}        ← composite ID
subscriptionEvents/{eventId}
plans/{planId}
events/{eventId}
ticketOrders/{ticketOrderId}
revenueTransactions/{transactionId}      ← immutable, Admin SDK only
revenueSplits/{splitId}                  ← immutable, Admin SDK only
payouts/{payoutId}                       ← Admin SDK only
processedStripeEvents/{stripeEventId}    ← idempotency ledger, Admin SDK only
notifications/{notificationId}
fcmTokens/{userId}_{deviceId}
advertisements/{adId}
adImpressions/{impressionId}
```

Composite IDs (`artistId_userId`, `userId_trackId`, `userId_artistId`) are
the load-bearing decision here: they turn "does this user have permission"
from a query into a single `get()`, which is the only way Firestore
Security Rules can check a relationship without a Cloud Function proxy.
Every rule in `firestore.rules` that checks membership, favorites, follows,
or subscription status relies on this.

Every domain document carries `id` (implicit), `createdAt`, `updatedAt`,
and where relevant `createdBy`/`status` — see `src/types/common.ts`
(`baseDocSchema`) and each entity's Zod schema for the exact shape.

### Indexes

`firestore.indexes.json` covers the compound queries actually used by the
code shipped so far: published-artist ranking/search, artist-scoped
tracks/albums/products/events ordered by recency, user-scoped orders and
listening events, and artist-scoped revenue/payouts. Extend this file as
new dashboard queries are added — Firestore will also emit a direct
console link on any missing-index error during development.

## 4. Roles & permissions

- **Platform**: `platform_admin`, `moderator` — Firebase **custom claims**
  (global, rare to change, cheap to check in rules via
  `request.auth.token.platform_admin`).
- **Per-artist**: `owner > admin > manager > editor|finance > viewer` —
  Firestore **membership documents** (`artistMembers/{artistId}_{userId}`),
  because a user can belong to many artists and claims aren't a good fit
  for that cardinality. `src/types/roles.ts` defines the permission matrix;
  `src/lib/permissions` re-exports it for UI-level gating.

**Enforcement is server-side, always.** `RequireAuth` /
`RequirePlatformAdmin` / `RequireArtistPermission` in
`src/features/auth/RouteGuards.tsx` only hide UI — the real boundary is
`firestore.rules` / `storage.rules`, and anything that moves money is
written exclusively by Cloud Functions using the Admin SDK (which bypasses
rules entirely and is therefore the only trusted writer).

## 5. Storage layout

```
artists/{artistId}/tracks/{trackId}/...
artists/{artistId}/albums/{albumId}/...
artists/{artistId}/products/{productId}/...
artists/{artistId}/branding/...
users/{userId}/avatar/...
exclusive/{artistId}/{contentId}/...
```

Everything is publicly readable **except** `exclusive/**`, which is gated
in `storage.rules` by the same `hasActiveSubscription()` /
`isArtistMember()` checks used in Firestore rules — a public download URL
is never treated as an authorization boundary on its own. Upload rules cap
size and `contentType` server-side (200 MB audio, 15 MB images) so the
client-side validation in the future upload UI is a UX nicety, not the
real gate.

## 6. Audio player architecture

`src/features/player/`:

- **`PlayerService`** — an interface abstracting the actual playback
  engine. `Html5PlayerService` is the current (web) implementation over
  `<audio>` + the Media Session API. Swapping in a Capacitor background-audio
  plugin later means writing one new class, not touching the store or UI.
- **`usePlayerStore`** (Zustand) — queue, index, play state, time,
  volume, repeat/shuffle, loading/error. Created once at module scope so
  it survives route changes; every screen reads/dispatches through it,
  never touching the service directly.
- Listening analytics are emitted from the store at state-transition
  boundaries only (`track_play`, `_pause`, `_resume`, `_skip`,
  `_complete`, `_seek`) — never on a timer — keeping Firestore write
  volume bounded regardless of session length (brief §14/§29).
- `MockAdProvider` (`src/lib/ads`) stands in for a real ad SDK; nothing
  else in the app depends on which provider is active.
- `AudioProcessingProvider` (`src/lib/audio`) is a deliberately-empty seam
  for transcoding/waveform/loudness/HLS work later — the MVP's
  `PassthroughAudioProcessingProvider` just accepts the original upload.

## 7. Stripe & Stripe Connect

**Model: destination-charge-style, platform-owned PaymentIntents.** The
platform Stripe account is the merchant of record for merch checkout and
subscriptions; artist payouts are computed by the revenue ledger (§8) and
transferred to the artist's **Express** Connect account on a schedule,
rather than splitting each charge at charge-time via `transfer_data`. This
was chosen over "separate charges and transfers" because it keeps the
per-charge Stripe flow simple (one `checkout.sessions.create` call, no
per-line-item destination routing) while still giving artists their own
Connect account for KYC/payouts/tax docs — the reconciliation complexity
moves into the ledger, which needs to exist anyway for the "revenu total
généré pour l'artiste" reporting requirement.

Implemented (`functions/src/`):

- `stripe/webhook.ts` — single HTTPS endpoint, verifies the signature,
  claims the event id (`stripe/idempotency.ts`) before doing anything
  else, then dispatches. Handles `checkout.session.completed`,
  `invoice.paid`, `customer.subscription.{updated,deleted}`.
- `payments/createCheckoutSession.ts` — callable; validates stock,
  creates a `pending_payment` order doc, creates the Checkout Session.
- `stripe/connect.ts` — callable `createConnectOnboardingLink`; creates
  the Express account on first call, returns an onboarding Account Link.
- Every write to `orders`/`subscriptions`/the ledger happens **only**
  inside these functions — `firestore.rules` denies client writes to all
  of them outright.

Deferred to Phase 4/5/6: fee reconciliation from the Stripe balance
transaction (currently `feesCents: 0` — a placeholder, not a design
choice), the scheduled payout job, promo-code redemption in checkout, and
ticketing payments.

## 8. Revenue ledger

`functions/src/shared/money.ts` — **pure, unit-tested** arithmetic
(`money.test.ts`), the only place a split percentage becomes a cent
amount. `functions/src/revenue/ledger.ts` wraps it with idempotent
Firestore writes (`recordRevenueTransaction`, keyed by a caller-supplied
`idempotencyKey`, batch-writes the transaction + artist/platform splits).

Every `revenueTransaction` snapshots the `splitConfigVersion` it was
computed against; editing `Artist.activeRevenueSplitConfig` later changes
future transactions only, never past ones (brief §11's "une transaction
passée ne doit pas changer" is a hard invariant here, not a guideline).
Default splits — 70/30 artist/platform on advertising and subscriptions,
10% platform commission on merch — live in that config document, never in
function/component code.

Not yet built: per-team-member split distribution (the `teamShareCents`
field exists and is wired to `0` today), the payout scheduler, and Stripe
fee reconciliation.

## 9. PWA architecture

`vite-plugin-pwa`, `generateSW` strategy. Manifest: standalone, portrait,
white theme/background (black text/icons — the brand identity is light, not dark), brand icons (placeholder assets — see §12).
Caching is deliberately narrow:

- **Cached**: the built app shell (JS/CSS/HTML), static assets, Google
  Fonts (stylesheet stale-while-revalidate, font files cache-first/1yr).
- **Never cached by the service worker**: Firestore/Storage/Functions/Auth
  traffic, checkout, anything private or paid — `navigateFallbackDenylist`
  plus simply not listing API-shaped patterns in `runtimeCaching` keeps
  the SW out of that traffic entirely, per the brief's explicit
  instruction not to cache private content or sensitive URLs permanently.
- No offline music download mode (not requested for the MVP).

## 10. Capacitor architecture

`capacitor.config.ts` at the repo root; `android/` and `ios/` native
projects are already generated and committed (`npx cap add android|ios`
was run as part of this work). Plugins installed: `@capacitor/app`,
`status-bar`, `splash-screen`, `push-notifications`, `network`.

`src/lib/capacitor/native.ts` is the single native-only bootstrap point —
every plugin import inside it is dynamic, so none of it adds bytes to the
web bundle. It currently: sets the status bar style/color, hides the
splash screen once React has mounted, and forwards `appUrlOpen` deep links
into the React Router history via `src/app/NativeBootstrap.tsx`.

**Manual steps still required before a real native build** (none of these
can be guessed or safely generated by this session):

- Drop `google-services.json` into `android/app/` and
  `GoogleService-Info.plist` into `ios/App/App/` from the real Firebase
  console project.
- iOS: enable Push Notifications + Background Modes → Audio capability in
  Xcode; add APNs auth key in the Firebase console for FCM-over-APNs.
- Configure Associated Domains (iOS) / App Links intent filters (Android)
  for deep links once the production domain is known.
- Android adaptive icon / splash screen resources
  (`android/app/src/main/res/**`) — currently defaults.
- Real app icons — see §12.

## 11. Environment variables

See `.env.example` (frontend) — every `VITE_*` var is public by
construction, so nothing secret goes there. Cloud Functions secrets
(`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`STRIPE_CONNECT_WEBHOOK_SECRET`) are declared via
`firebase-functions/params` `defineSecret` in `functions/src/stripe/client.ts`
and set with `firebase functions:secrets:set` in each environment — never
committed, never read from `.env`.

## 12. Deferred / risks / explicitly out of scope

**Deferred to a later phase (by design, not oversight):**
- Merch cart/checkout UI, order history, event/ticketing UI, exclusive
  content UI, subscription upsell UI — routed placeholders today.
- Artist dashboard analytics/upload/content/team/revenue screens —
  placeholders; the data model and functions they'll call already exist.
- Admin back-office screens — placeholders; role gate (`platform_admin`)
  already enforced.
- Per-route SEO (meta/OG/JSON-LD per artist/album/product page), sitemap,
  robots.txt — the brief flags this as a known SPA/PWA pain point; the
  pragmatic fix (inject meta tags per-route on the client, or a small
  prerender/edge-function step for the public artist/album/product/event
  routes specifically) should be scoped once those pages exist for real
  data, not against placeholders.
- Stripe fee reconciliation, payout scheduler, team-member split payout.
- Algolia/Typesense/Meilisearch migration — MVP search is a Firestore
  `nameLower` prefix-range query (`src/features/search/api.ts`); swapping
  providers later doesn't change `searchArtists()`'s signature.
- Firestore Security Rules emulator test suite (brief §31 asks for it;
  Phase 1 shipped the rules and unit tests for the ledger/permission
  logic they encode, not yet the emulator-based rules tests themselves).

**Known placeholders that need real assets before launch:**
- `public/icons/icon-*.png` and `public/favicon.svg` are programmatically
  generated black-square/X placeholders, not the real Deallead brand mark
  from the moodboard. Swap before shipping an installable PWA/app icon.
- `.firebaserc` project ids (`deallead-dev` / `deallead-prod`) are
  placeholders — replace with the real Firebase project ids once created.

**Risks worth flagging explicitly:**
- The webhook's Stripe fee handling is a stub (`feesCents: 0`) — until fee
  reconciliation lands, `finalNetCents` in the ledger overstates artist
  payouts by the Stripe processing fee. Do not wire real payouts from this
  ledger until §7/§8's deferred items are closed.
- The main JS bundle is ~1 MB pre-gzip (Firebase SDK + Zod + i18next +
  Router), flagged by the Vite build. Fine for an MVP pilot, but Phase 10
  should split Firebase's Auth/Firestore/Storage/Functions/Messaging
  imports behind route-level dynamic imports rather than the current
  eager `main.tsx` init.
- No production Firebase project exists yet — nothing in this repo has
  been deployed. `firebase deploy` / CI's `deploy-production` jobs will
  fail until real project ids + `FIREBASE_SERVICE_ACCOUNT` /
  `FIREBASE_TOKEN` secrets are configured in GitHub.

## 13. Roadmap from here

Phase 1 (foundation) is done. Recommended next slice, in order, matching
the brief's own phase numbering and priority list (§46: security → financial
integrity → player stability → fan UX → artist simplicity → performance →
cost → mobile → analytics → polish):

1. **Phase 2 completion** — Firestore emulator rules tests; artist
   creation flow UI (the `onArtistCreated` trigger exists, the "create an
   artist" screen doesn't yet).
2. **Phase 3** — real track/album upload UI wired to Storage + the
   `tracks`/`albums` collections; artist-page discography using real data
   instead of the featured-artists stub.
3. **Phase 4/5** — merch cart → checkout → order confirmation end-to-end;
   FAN subscription upsell + Stripe Billing UI.
4. **Phase 6** — artist dashboard analytics/revenue screens reading the
   ledger that already exists.
5. **Phase 7/8** — events/ticketing UI, admin back-office UI.
6. **Phase 9/10** — native build validation on real devices, SEO,
   accessibility pass, bundle-size work, Firestore Security Rules
   emulator test suite.
