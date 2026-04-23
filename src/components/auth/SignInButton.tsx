/**
 * Google Sign-In trigger.
 *
 * Uses Google Identity Services (loaded via <script> in index.html). On click,
 * we initialize a one-tap-style prompt with our client ID and pass the
 * resulting JWT to the auth store, which exchanges it with our Worker for
 * a session.
 *
 * GIS exposes two callback paths:
 *   - `prompt()` — shows the One Tap UI (top-right card). Lightweight but
 *     can be silently dismissed by browsers / extensions.
 *   - `renderButton()` — embeds a Google-styled button. We avoid that here
 *     to keep our editorial design coherent; instead we render our own
 *     button and call `prompt()` on click.
 */
import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'

const CLIENT_ID = '504561987858-hgdk20iv7am2173vipo653mf41vs2kkv.apps.googleusercontent.com'

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string
    callback: (response: { credential: string }) => void
    auto_select?: boolean
    cancel_on_tap_outside?: boolean
  }) => void
  prompt: (cb?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean; getNotDisplayedReason: () => string; getSkippedReason: () => string }) => void) => void
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
  disableAutoSelect: () => void
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } }
  }
}

export default function SignInButton() {
  const signIn = useAuthStore((s) => s.signInWithGoogleToken)
  const isVerifying = useAuthStore((s) => s.isVerifying)
  const error = useAuthStore((s) => s.error)
  const [scriptReady, setScriptReady] = useState(false)
  const initializedRef = useRef(false)

  // Wait for the GIS script to be present, then initialize.
  useEffect(() => {
    let cancelled = false
    const tryInit = () => {
      const id = window.google?.accounts?.id
      if (!id) return false
      if (initializedRef.current) return true
      id.initialize({
        client_id: CLIENT_ID,
        callback: (response) => { void signIn(response.credential) },
        auto_select: false,
        cancel_on_tap_outside: true,
      })
      initializedRef.current = true
      if (!cancelled) setScriptReady(true)
      return true
    }
    if (tryInit()) return
    const t = setInterval(() => { if (tryInit()) clearInterval(t) }, 100)
    setTimeout(() => clearInterval(t), 8000)
    return () => { cancelled = true; clearInterval(t) }
  }, [signIn])

  const handleClick = () => {
    const id = window.google?.accounts?.id
    if (!id) return
    id.prompt((notification) => {
      // If One Tap is suppressed (cookies blocked, dismissed cooldown, etc.),
      // fall back to the popup flow by re-initializing for a click.
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Use the OAuth2 popup as a fallback.
        const w = 480, h = 640
        const left = window.screenX + (window.outerWidth - w) / 2
        const top = window.screenY + (window.outerHeight - h) / 2
        const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
        url.searchParams.set('client_id', CLIENT_ID)
        url.searchParams.set('redirect_uri', window.location.origin)
        url.searchParams.set('response_type', 'id_token')
        url.searchParams.set('scope', 'openid email profile')
        url.searchParams.set('nonce', crypto.randomUUID())
        url.searchParams.set('prompt', 'select_account')
        window.open(url.toString(), 'google-signin', `width=${w},height=${h},left=${left},top=${top}`)
      }
    })
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={!scriptReady || isVerifying}
        className="group flex h-9 items-center gap-2 rounded-md border border-cal-gold/30 bg-berkeley-blue/30 px-3 text-[12.5px] font-medium tracking-wide text-text-primary transition-all hover:border-cal-gold/60 hover:bg-berkeley-blue/55 hover:shadow-[0_0_18px_-6px_rgba(253,181,21,0.45)] disabled:opacity-50"
        aria-label="Sign in with Google"
        title={isVerifying ? 'Signing in…' : 'Sign in with Google'}
      >
        {/* Google "G" mark */}
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <span className="serif italic text-cal-gold/90">Sign in</span>
        <span className="hidden xl:inline">with Google</span>
      </button>
      {error && (
        <div className="absolute right-0 top-full mt-1 w-64 rounded-md border border-wellman/40 bg-bg-elevated px-3 py-2 text-[11px] text-wellman shadow-lg">
          {error}
        </div>
      )}
    </div>
  )
}
