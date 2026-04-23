/**
 * Google OAuth auth state.
 *
 * The Google Identity Services script (loaded in index.html) hands us a
 * JWT id_token after the user signs in. We POST it to the Worker's
 * /api/auth/google endpoint, which verifies the token via Google's
 * tokeninfo endpoint and returns the canonical userId + profile.
 *
 * We persist the resulting profile (NOT the id_token) in localStorage so
 * the user stays signed in across reloads. The id_token expires in ~1h
 * but our userId is stable for the user's lifetime — so we never need to
 * refresh tokens or hit Google again until the user explicitly signs out.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  userId: string
  email: string
  name: string
  picture: string | null
  givenName: string | null
}

interface AuthState {
  user: AuthUser | null
  /** True while the Worker exchange is in flight. */
  isVerifying: boolean
  /** Last error string (e.g. token rejected, network failure). */
  error: string | null
  /** Exchange a Google id_token for our session profile. */
  signInWithGoogleToken: (idToken: string) => Promise<void>
  signOut: () => void
  /** Permanently purge all KV records for the current user, then sign out. */
  deleteAccount: () => Promise<{ ok: boolean; error?: string }>
}

const API = (import.meta.env.VITE_SYNC_API_URL as string | undefined) || ''

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isVerifying: false,
      error: null,

      signInWithGoogleToken: async (idToken: string) => {
        if (!API) {
          set({ error: 'Sync backend not configured' })
          return
        }
        set({ isVerifying: true, error: null })
        try {
          const res = await fetch(`${API}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          })
          if (!res.ok) {
            const err = (await res.json().catch(() => ({}))) as { error?: string }
            throw new Error(err.error || `Sign-in failed: ${res.status}`)
          }
          const user = (await res.json()) as AuthUser
          set({ user, isVerifying: false })
          // Reuse the same userId for sync — replace any anonymous one.
          localStorage.setItem('berkeleytime-userId', user.userId)
          // Push current local state to the cloud immediately so the new
          // user's account is populated on first sign-in.
          void import('@/services/sync').then(({ syncToCloud }) => syncToCloud())
        } catch (e) {
          set({ error: e instanceof Error ? e.message : 'Sign-in failed', isVerifying: false })
        }
      },

      signOut: () => {
        // Disable Google's auto-select for the next visit so the user
        // gets a fresh sign-in choice instead of being signed back in.
        const g = (window as Window & { google?: { accounts?: { id?: { disableAutoSelect: () => void } } } }).google
        try { g?.accounts?.id?.disableAutoSelect() } catch { /* ignore */ }
        set({ user: null, error: null })
        localStorage.removeItem('berkeleytime-userId')
      },

      deleteAccount: async () => {
        const userId = localStorage.getItem('berkeleytime-userId')
        if (!userId) return { ok: false, error: 'Not signed in' }
        if (!API) return { ok: false, error: 'Sync backend not configured' }
        try {
          const res = await fetch(`${API}/api/account/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          })
          if (!res.ok) {
            const err = (await res.json().catch(() => ({}))) as { error?: string }
            return { ok: false, error: err.error || `Delete failed: ${res.status}` }
          }
          // Server purged successfully. Clean up local state too.
          const g = (window as Window & { google?: { accounts?: { id?: { disableAutoSelect: () => void } } } }).google
          try { g?.accounts?.id?.disableAutoSelect() } catch { /* ignore */ }
          localStorage.removeItem('berkeleytime-userId')
          localStorage.removeItem('berkeleytime-schedule')
          localStorage.removeItem('berkeleytime-gradtrak')
          set({ user: null, error: null })
          return { ok: true }
        } catch (e) {
          return { ok: false, error: e instanceof Error ? e.message : 'Delete failed' }
        }
      },
    }),
    {
      name: 'berkeleytime-auth',
      partialize: (s) => ({ user: s.user }),
    }
  )
)
