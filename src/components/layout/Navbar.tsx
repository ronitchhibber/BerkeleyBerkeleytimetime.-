import { NavLink } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import SyncStatus from '@/components/SyncStatus'
import SignInButton from '@/components/auth/SignInButton'
import UserMenu from '@/components/auth/UserMenu'

const navLinks = [
  { to: '/catalog', label: 'Catalog' },
  { to: '/scheduler', label: 'Scheduler' },
  { to: '/gradtrak', label: 'Gradtrak' },
  { to: '/grades', label: 'Grades' },
  { to: '/enrollment', label: 'Enrollment' },
]

export default function Navbar() {
  const user = useAuthStore((s) => s.user)
  return (
    <nav className="relative sticky top-0 z-50 border-b border-cal-gold/15 bg-gradient-to-b from-berkeley-blue-deep/70 to-berkeley-blue/20 backdrop-blur-xl">
      {/* Hairline gold rule on top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cal-gold/40 to-transparent" />

      <div className="flex h-[64px] items-center justify-between px-5 md:px-8">
        <NavLink to="/catalog" className="group flex items-center gap-3 no-underline">
          {/* Berkeley seal mark */}
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
            <svg viewBox="0 0 36 36" className="absolute inset-0 h-full w-full text-cal-gold/80 transition-transform duration-700 group-hover:rotate-180">
              <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 2" />
              <circle cx="18" cy="18" r="11" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </svg>
            <span className="serif text-[15px] font-semibold italic text-cal-gold">Bt</span>
          </span>

          <div className="flex flex-col leading-none">
            <span className="serif font-semibold tracking-tight text-text-primary text-[18px] lg:text-[19px]">
              <span className="hidden lg:inline">Berkeley<span className="text-cal-gold">time</span>Berkeley<span className="text-cal-gold">time</span></span>
              <span className="lg:hidden">BB<span className="text-cal-gold">tt</span></span>
            </span>
            <span className="mono mt-1 hidden text-[8.5px] font-semibold uppercase tracking-[0.2em] text-text-muted md:block">
              Est. <span className="text-cal-gold/70">2026</span> · UC Berkeley
            </span>
          </div>
        </NavLink>

        <div className="flex items-center gap-2 md:gap-5">
          <div className="hidden items-center md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `group relative px-3.5 py-2 text-[13px] font-medium tracking-wide transition-colors ${
                    isActive
                      ? 'text-cal-gold'
                      : 'text-text-secondary hover:text-text-primary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative z-10">{link.label}</span>
                    {isActive && (
                      <>
                        <span className="absolute -bottom-[21px] left-1/2 h-[2px] w-6 -translate-x-1/2 bg-cal-gold shadow-[0_0_10px_rgba(253,181,21,0.7)]" />
                        <span className="absolute -bottom-[21px] left-1/2 h-[2px] w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-cal-gold/30 to-transparent" />
                      </>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Mobile menu */}
          <details className="relative md:hidden">
            <summary className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-bg-hover hover:text-cal-gold list-none [&::-webkit-details-marker]:hidden">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </summary>
            <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-lg border border-cal-gold/20 bg-bg-elevated/95 shadow-2xl backdrop-blur-xl">
              <div className="border-b border-border px-4 py-2">
                <span className="eyebrow-plain">Navigate</span>
              </div>
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 text-[13px] font-medium transition-colors ${
                      isActive ? 'bg-cal-gold/10 text-cal-gold' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="border-t border-border px-4 py-2 mt-1 flex items-center gap-3 mono text-[10px] uppercase tracking-[0.16em] text-text-muted/70">
                <NavLink to="/privacy" className="hover:text-cal-gold">Privacy</NavLink>
                <span>·</span>
                <NavLink to="/terms" className="hover:text-cal-gold">Terms</NavLink>
              </div>
            </div>
          </details>

          {/* Hairline divider before utility cluster */}
          <span className="hidden h-6 w-px bg-border md:block" />

          <SyncStatus />

          {user ? <UserMenu /> : <SignInButton />}
        </div>
      </div>
    </nav>
  )
}

