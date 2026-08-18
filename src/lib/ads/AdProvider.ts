export interface AdProvider {
  initialize(): Promise<void>
  requestDisplayAd(slotId: string): Promise<{ adId: string; imageUrl: string; clickUrl: string } | null>
  requestAudioAd(): Promise<{ adId: string; audioUrl: string; durationSeconds: number } | null>
  trackImpression(adId: string): void
  trackClick(adId: string): void
  destroy(): void
}

export class MockAdProvider implements AdProvider {
  async initialize() {
    // no-op — nothing to warm up for the mock provider
  }

  async requestDisplayAd() {
    return {
      adId: `mock-display-${crypto.randomUUID()}`,
      imageUrl: '/icons/icon-512.png',
      clickUrl: 'https://example.com',
    }
  }

  async requestAudioAd() {
    return null
  }

  trackImpression(adId: string) {
    console.debug('[ads] impression', adId)
  }

  trackClick(adId: string) {
    console.debug('[ads] click', adId)
  }

  destroy() {
    // no-op
  }
}

let provider: AdProvider = new MockAdProvider()

export function getAdProvider(): AdProvider {
  return provider
}

/** Swap in a real Web/iOS/Android ad SDK later without touching call sites. */
export function setAdProvider(next: AdProvider): void {
  provider = next
}
