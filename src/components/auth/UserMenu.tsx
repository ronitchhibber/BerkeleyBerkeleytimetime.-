/**
 * Signed-in user dropdown for the navbar.
 *
 * Shows avatar (Google profile picture, falls back to initial) plus the
 * user's first name. Click opens a small dropdown with profile info and
 * Sign out.
 */
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore, type AuthUser } from '@/stores/authStore'

function Avatar({ user, size = 24 }: { user: AuthUser; size?: number }) {
  const [imgError, setImgError] = useState(false)
  const initial = (user.givenName || user.name || user.email || '?').charAt(0).toUpperCase()
  if (user.picture && !imgError) {
    return (
      <img
        src={user.picture}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className="rounded-full ring-1 ring-cal-gold/40"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-cal-gold/15 ring-1 ring-cal-gold/40 mono text-[11px] font-bold text-cal-gold"
      style={{ width: size, height: size }}
    >
      {initial}
    </div>
  )
}

export default function UserMenu() {
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const deleteAccount = useAuthStore((s) => s.deleteAccount)
  const [open, setOpen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  if (!user) return null
  const firstName = user.givenName || user.name?.split(' ')[0] || user.email.split('@')[0]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 items-center gap-2 rounded-md border border-cal-gold/25 bg-berkeley-blue/30 px-2.5 text-[12.5px] font-medium tracking-wide text-text-primary transition-all hover:border-cal-gold/55 hover:bg-berkeley-blue/55"
        aria-label={`Signed in as ${user.name}`}
      >
        <Avatar user={user} size={22} />
        <span className="hidden sm:inline">{firstName}</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-cal-gold/70 transition-transform ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-lg border border-cal-gold/20 bg-bg-elevated shadow-2xl shadow-black/60 animate-slide-down">
          <div className="border-b border-border bg-berkeley-blue/20 px-4 py-3.5 parchment">
            <div className="flex items-center gap-3">
              <Avatar user={user} size={36} />
              <div className="min-w-0 flex-1">
                <div className="truncate serif text-[14px] font-semibold text-text-primary">{user.name}</div>
                <div className="truncate mono text-[10.5px] text-text-muted">{user.email}</div>
              </div>
            </div>
          </div>
          <div className="px-2 py-2">
            <a
              href="https://myaccount.google.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-md px-2.5 py-2 text-[12px] text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
            >
              Manage Google account
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
            <button
              onClick={() => { signOut(); setOpen(false) }}
              className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-[12px] text-text-secondary transition-colors hover:bg-wellman/10 hover:text-wellman"
            >
              Sign out
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>

            {/* Delete account — two-step inline confirm */}
            {confirmingDelete ? (
              <div className="mt-1 rounded-md border border-wellman/40 bg-wellman/5 px-2.5 py-2.5 space-y-2">
                <p className="text-[11.5px] leading-snug text-wellman">
                  This permanently erases your synced plans, schedule, and account.
                  Cannot be undone.
                </p>
                {deleteError && (
                  <p className="mono text-[10px] text-wellman/90">{deleteError}</p>
                )}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={async () => {
                      setDeleting(true); setDeleteError(null)
                      const result = await deleteAccount()
                      setDeleting(false)
                      if (result.ok) { window.location.href = '/' }
                      else { setDeleteError(result.error || 'Delete failed') }
                    }}
                    disabled={deleting}
                    className="mono flex-1 rounded bg-wellman px-2 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-bg-primary transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {deleting ? 'Deleting…' : 'Delete forever'}
                  </button>
                  <button
                    onClick={() => { setConfirmingDelete(false); setDeleteError(null) }}
                    disabled={deleting}
                    className="mono rounded px-2 py-1 text-[10.5px] text-text-muted hover:text-text-primary disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-[12px] text-text-muted transition-colors hover:bg-wellman/10 hover:text-wellman"
                title="Permanently erase your account and all synced data"
              >
                Delete account
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            )}
          </div>
          <div className="border-t border-border bg-bg-card/40 px-4 py-2.5 flex items-center justify-center gap-3 mono text-[10px] uppercase tracking-[0.16em] text-text-muted/70">
            <Link to="/privacy" onClick={() => setOpen(false)} className="hover:text-cal-gold">Privacy</Link>
            <span>·</span>
            <Link to="/terms" onClick={() => setOpen(false)} className="hover:text-cal-gold">Terms</Link>
          </div>
        </div>
      )}
    </div>
  )
}
