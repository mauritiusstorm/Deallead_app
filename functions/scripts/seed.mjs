// Demo/dev seed data — populates the LOCAL FIREBASE EMULATOR ONLY.
// Never run this against a real (production or staging) Firebase project.
//
// Usage (from functions/, with `firebase emulators:start` already running
// in another terminal):
//   npm run seed
//
// Creates: one fan test account, one artist (you), two albums, eight
// tracks (pointing at public royalty-free demo audio), and four merch
// products with variants — enough to click through Home/Music/Shop.

process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= '127.0.0.1:9099'
process.env.GCLOUD_PROJECT ??= 'deallead-dev'

import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

const app = initializeApp({ projectId: process.env.GCLOUD_PROJECT })
const db = getFirestore(app)
const auth = getAuth(app)

// Single-artist app: the artist document's ID *is* its slug — see
// src/features/artists/hooks/useArtistBySlug.ts for why (a Firestore
// `list` rule can't see fields outside the query's own filters, so we
// fetch by ID instead of querying by a `slug` field).
const ARTIST_SLUG = 'deallead'
const ARTIST_ID = ARTIST_SLUG
const DEMO_FAN_EMAIL = 'fan@deallead.test'
const DEMO_FAN_PASSWORD = 'password123';

const SAMPLE_AUDIO = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
]

function image(seed, size = 800) {
  return `https://picsum.photos/seed/${seed}/${size}/${size}`
}

async function ensureDemoFan() {
  try {
    const existing = await auth.getUserByEmail(DEMO_FAN_EMAIL)
    return existing.uid
  } catch {
    const user = await auth.createUser({
      email: DEMO_FAN_EMAIL,
      password: DEMO_FAN_PASSWORD,
      displayName: 'Fan Démo',
      emailVerified: true,
    })
    return user.uid
  }
}

async function seed() {
  const ownerId = await ensureDemoFan()
  console.log(`Demo fan account ready: ${DEMO_FAN_EMAIL} / ${DEMO_FAN_PASSWORD}`)

  await db.doc(`users/${ownerId}`).set(
    {
      displayName: 'Fan Démo',
      email: DEMO_FAN_EMAIL,
      emailVerified: true,
      photoUrl: null,
      locale: 'fr',
      notificationPreferences: { global: true, music: true, merch: true, events: true, account: true },
      onboardingCompleted: true,
      deletedAt: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )

  await db.doc(`artists/${ARTIST_ID}`).set({
    slug: ARTIST_SLUG,
    name: 'DEALLEADx',
    nameLower: 'deallead',
    bio: 'Artiste indépendant. Rappeur. Ambitieux. Visionnaire. Depuis mes débuts, je construis mon univers morceau après morceau, sans filtre, sans compromis — pour ceux qui suivent le vrai depuis le premier jour.',
    avatarUrl: image('deallead-avatar', 400),
    coverUrl: image('deallead-cover', 1200),
    socialLinks: {},
    status: 'published',
    ownerUserId: ownerId,
    stripeConnectAccountId: null,
    stripeConnectOnboardingStatus: 'not_started',
    activeRevenueSplitConfig: {
      version: 1,
      advertisingArtistPct: 70,
      merchPlatformCommissionPct: 10,
      subscriptionArtistPct: 70,
      effectiveFrom: FieldValue.serverTimestamp(),
    },
    followerCount: 128000,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    createdBy: ownerId,
  })

  await db.doc(`artistMembers/${ARTIST_ID}_${ownerId}`).set({
    artistId: ARTIST_ID,
    userId: ownerId,
    role: 'owner',
    invitedBy: null,
    status: 'active',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  const albums = [
    { id: 'album-reussir', title: 'Réussir ou Mourir', type: 'album', trackCount: 4 },
    { id: 'album-trap-life', title: 'Trap Life', type: 'ep', trackCount: 4 },
  ]
  for (const album of albums) {
    await db.doc(`albums/${album.id}`).set({
      artistId: ARTIST_ID,
      title: album.title,
      type: album.type,
      artworkUrl: image(album.id, 600),
      status: 'published',
      releaseDate: FieldValue.serverTimestamp(),
      trackCount: album.trackCount,
      createdBy: ownerId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
  }

  const trackTitles = [
    'Réussir ou Mourir',
    'No Sleep',
    'Dark Days',
    'Sur la Route',
    'Trap Life',
    'Ambition',
    'Liberté',
    'Esprit Street',
  ]
  for (let i = 0; i < trackTitles.length; i++) {
    const albumId = i < 4 ? 'album-reussir' : 'album-trap-life'
    await db.doc(`tracks/track-${i + 1}`).set({
      artistId: ARTIST_ID,
      albumId,
      title: trackTitles[i],
      durationSeconds: 180 + i * 7,
      trackNumber: (i % 4) + 1,
      artworkUrl: image(albumId, 600),
      audioStoragePath: SAMPLE_AUDIO[i % SAMPLE_AUDIO.length],
      audioProcessingStatus: 'ready',
      status: 'published',
      releaseDate: FieldValue.serverTimestamp(),
      playCount: Math.round(450000 / (i + 1)),
      rightsDeclared: true,
      createdBy: ownerId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
  }

  const products = [
    { id: 'product-hoodie', title: 'Hoodie DEALLEADx', priceCents: 6900, category: 'apparel', sizes: ['S', 'M', 'L', 'XL'] },
    { id: 'product-tee', title: 'Tee DEALLEADx', priceCents: 3490, category: 'apparel', sizes: ['S', 'M', 'L', 'XL'] },
    { id: 'product-cap', title: 'Casquette DEALLEADx', priceCents: 2900, category: 'accessories', sizes: [null] },
    { id: 'product-chain', title: 'Chaîne DEALLEADx', priceCents: 4900, category: 'accessories', sizes: [null] },
  ]
  for (const product of products) {
    await db.doc(`products/${product.id}`).set({
      artistId: ARTIST_ID,
      title: product.title,
      description: `${product.title} — édition officielle DEALLEADx.`,
      category: product.category,
      images: [image(product.id, 800)],
      minPriceCents: product.priceCents,
      currency: 'EUR',
      status: 'active',
      createdBy: ownerId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    for (const size of product.sizes) {
      const variantId = size ?? 'default'
      await db.doc(`products/${product.id}/variants/${variantId}`).set({
        productId: product.id,
        label: size ?? 'Taille unique',
        size,
        color: null,
        priceCents: product.priceCents,
        stockQuantity: 25,
        sku: `${product.id}-${variantId}`.toUpperCase(),
      })
    }
  }

  console.log('Seed complete.')
  console.log(`Artist: ${ARTIST_SLUG} (${ARTIST_ID})`)
  console.log(`Sign in as: ${DEMO_FAN_EMAIL} / ${DEMO_FAN_PASSWORD}`)
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
