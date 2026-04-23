import { create } from 'zustand'

export type ThemeMode = 'dark' | 'light' | 'system'

function resolveSystem(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return
  const effective = mode === 'system' ? resolveSystem() : mode
  document.documentElement.classList.toggle('light', effective === 'light')
  // expose for media queries / debugging
  document.documentElement.dataset.theme = effective
}

interface ThemeState {
  mode: ThemeMode
  effective: 'dark' | 'light'
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
}

const initialMode: ThemeMode = ((): ThemeMode => {
  if (typeof localStorage === 'undefined') return 'dark'
  const v = localStorage.getItem('theme')
  return v === 'light' || v === 'system' ? v : 'dark'
})()

export const useThemeStore = create<ThemeState>((set) => {
  applyTheme(initialMode)

  // Listen for system pref changes when in system mode
  if (typeof window !== 'undefined') {
    const mql = window.matchMedia('(prefers-color-scheme: light)')
    mql.addEventListener('change', () => {
      const current = (localStorage.getItem('theme') || 'dark') as ThemeMode
      if (current === 'system') {
        const eff = resolveSystem()
        applyTheme('system')
        set({ effective: eff })
      }
    })
  }

  return {
    mode: initialMode,
    effective: initialMode === 'system' ? resolveSystem() : initialMode,
    setMode: (mode) => {
      localStorage.setItem('theme', mode)
      applyTheme(mode)
      set({ mode, effective: mode === 'system' ? resolveSystem() : mode })
    },
    toggleMode: () =>
      set((s) => {
        const order: ThemeMode[] = ['dark', 'light', 'system']
        const next = order[(order.indexOf(s.mode) + 1) % order.length]
        localStorage.setItem('theme', next)
        applyTheme(next)
        return { mode: next, effective: next === 'system' ? resolveSystem() : next }
      }),
  }
})
