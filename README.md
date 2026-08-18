# Deallead

Music. Culture. Ambition.

The platform that lets artists own their audience and monetize their fans
directly — music, fan subscriptions, merchandise, and events on one stack.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full technical proposal
(data model, security rules, player/Stripe/PWA/Capacitor architecture,
roadmap, and risks).

## Stack

React + Vite + TypeScript + Tailwind CSS + Zustand + React Router +
i18next · Firebase (Auth, Firestore, Storage, Functions, Hosting, FCM, App
Check) · Stripe (Checkout, Billing, Connect) · Capacitor (iOS/Android).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Firebase project's client config
npm run dev
```

### Local backend (Firebase Emulator Suite)

The app defaults to the emulators (`VITE_USE_FIREBASE_EMULATORS=true` in
`.env.example`) so you never need production credentials for local dev.

```bash
npm install -g firebase-tools   # or use the local devDependency via npx
firebase emulators:start
```

This starts Auth (9099), Firestore (8080), Storage (9199), Functions
(5001), Hosting (5000), and the Emulator UI (4000).

Cloud Functions secrets (Stripe keys) are never read from `.env` — set
them for the emulator via `functions/.secret.local` (gitignored):

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run typecheck` | `tsc -b`, no emit |
| `npm run lint` | oxlint |
| `npm test` | Vitest (unit tests) |
| `npm run preview` | Preview the production build |

Cloud Functions have the same scripts under `functions/` (`npm run build`,
`lint`, `typecheck`, `test`, plus `serve`/`shell`/`deploy`).

## Mobile (Capacitor)

Native projects already exist under `android/` and `ios/`.

```bash
npm run build
npx cap sync
npx cap open android   # Android Studio
npx cap open ios       # Xcode (macOS only)
```

See `ARCHITECTURE.md` §Capacitor for the manual native configuration steps
(Firebase `google-services.json` / `GoogleService-Info.plist`, push
notification entitlements, associated domains for deep links).

## Project structure

```
src/
  app/         router + native bootstrap
  components/  design system (ui/) + shared components
  features/    one folder per domain (auth, music, player, merch, ...)
  layouts/     fan / artist-dashboard / admin shells
  lib/         firebase, stripe, permissions, analytics, ads, audio
  stores/      cross-feature Zustand stores
  types/       Zod schemas + inferred types (source of truth for Firestore docs)
  i18n/        fr/en translation namespaces

functions/src/ Cloud Functions, mirroring the same domain folders
```
