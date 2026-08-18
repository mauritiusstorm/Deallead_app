import { Capacitor } from '@capacitor/core'

/**
 * Native-only bootstrap (status bar, splash screen dismissal, deep links).
 * Every import here is dynamic so this module is a no-op — and adds zero
 * bytes — on the web/PWA build.
 */
export async function initNativeApp(onDeepLink: (path: string) => void): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  const [{ StatusBar, Style }, { SplashScreen }, { App }] = await Promise.all([
    import('@capacitor/status-bar'),
    import('@capacitor/splash-screen'),
    import('@capacitor/app'),
  ])

  await StatusBar.setStyle({ style: Style.Light })
  await StatusBar.setBackgroundColor({ color: '#ffffff' })
  await SplashScreen.hide()

  App.addListener('appUrlOpen', ({ url }) => {
    try {
      const path = new URL(url).pathname
      onDeepLink(path)
    } catch {
      // malformed deep link — ignore.
    }
  })
}
