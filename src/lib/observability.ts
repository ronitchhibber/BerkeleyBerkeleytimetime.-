/**
 * Sentry (errors + perf) + PostHog (product analytics) wiring.
 * Both initialize ONLY if their env vars are set, so dev runs are silent
 * by default and the production app behaves identically without keys.
 *
 * Setup:
 *   VITE_SENTRY_DSN=https://...@sentry.io/...
 *   VITE_POSTHOG_KEY=phc_...
 */

let sentryReady = false
let posthogReady = false

export async function initObservability() {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string | undefined
  const posthogKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined

  if (sentryDsn) {
    try {
      const Sentry = await import('@sentry/react')
      Sentry.init({
        dsn: sentryDsn,
        integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 1.0,
      })
      sentryReady = true
    } catch (e) {
      console.warn('[observability] Sentry init failed', e)
    }
  }

  if (posthogKey) {
    try {
      const posthogModule = await import('posthog-js')
      const posthog = posthogModule.default
      posthog.init(posthogKey, {
        api_host: 'https://us.i.posthog.com',
        autocapture: true,
        capture_pageview: false, // we capture manually for SPA route changes
      })
      posthogReady = true
    } catch (e) {
      console.warn('[observability] PostHog init failed', e)
    }
  }
}

export async function track(eventName: string, props?: Record<string, unknown>) {
  if (!posthogReady) return
  const { default: posthog } = await import('posthog-js')
  posthog.capture(eventName, props)
}

export async function setUser(id: string, props?: Record<string, unknown>) {
  if (sentryReady) {
    const Sentry = await import('@sentry/react')
    Sentry.setUser({ id, ...props })
  }
  if (posthogReady) {
    const { default: posthog } = await import('posthog-js')
    posthog.identify(id, props)
  }
}

export async function reportError(error: unknown, context?: Record<string, unknown>) {
  if (sentryReady) {
    const Sentry = await import('@sentry/react')
    Sentry.captureException(error, { extra: context })
  } else {
    console.error('[reportError]', error, context)
  }
}
