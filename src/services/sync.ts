/**
 * Frontend sync layer. Talks to the Cloudflare Worker backend defined by
 * VITE_SYNC_API_URL. With that env var empty, the entire sync system is
 * a no-op and the app behaves identically to today (localStorage only).
 */
import { useEffect } from 'react'
import { useGradtrakStore } from '@/stores/gradtrakStore'
import { useScheduleStore } from '@/stores/scheduleStore'

const API = (import.meta.env.VITE_SYNC_API_URL as string | undefined) || ''
const USER_KEY = 'berkeleytime-userId'

export type SyncStatus = 'disabled' | 'idle' | 'syncing' | 'synced' | 'offline' | 'error'

let lastSyncedAt: string | null = null
let currentStatus: SyncStatus = API ? 'idle' : 'disabled'
const listeners = new Set<(s: SyncStatus, when: string | null) => void>()

function setStatus(next: SyncStatus, when: string | null = lastSyncedAt) {
  currentStatus = next
  lastSyncedAt = when
  listeners.forEach((l) => l(next, when))
}

export function getSyncStatus() {
  return { status: currentStatus, lastSyncedAt }
}

export function subscribeSync(fn: (s: SyncStatus, when: string | null) => void): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

export async function getOrCreateUserId(): Promise<string | null> {
  if (!API) return null
  const existing = localStorage.getItem(USER_KEY)
  if (existing) return existing
  try {
    const res = await fetch(`${API}/api/user`, { method: 'POST' })
    if (!res.ok) throw new Error(`user create failed: ${res.status}`)
    const { userId } = (await res.json()) as { userId: string }
    localStorage.setItem(USER_KEY, userId)
    return userId
  } catch (e) {
    console.warn('[sync] user creation failed', e)
    setStatus('offline')
    return null
  }
}

export async function syncToCloud() {
  if (!API) return
  const userId = await getOrCreateUserId()
  if (!userId) return
  setStatus('syncing')
  try {
    const plans = useGradtrakStore.getState().plans
    const schedule = {
      classes: useScheduleStore.getState().classes,
      events: useScheduleStore.getState().events,
      scheduleName: useScheduleStore.getState().scheduleName,
    }
    const res = await fetch(`${API}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plans, schedule }),
    })
    if (!res.ok) throw new Error(`sync failed: ${res.status}`)
    const { syncedAt } = (await res.json()) as { syncedAt: string }
    setStatus('synced', syncedAt)
  } catch (e) {
    console.warn('[sync] push failed', e)
    setStatus('error')
  }
}

export async function pullFromCloud(): Promise<{ plans?: unknown; schedule?: unknown; syncedAt?: string } | null> {
  if (!API) return null
  const userId = localStorage.getItem(USER_KEY)
  if (!userId) return null
  try {
    const res = await fetch(`${API}/api/sync/${userId}`)
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`pull failed: ${res.status}`)
    return (await res.json()) as { plans?: unknown; schedule?: unknown; syncedAt?: string }
  } catch (e) {
    console.warn('[sync] pull failed', e)
    setStatus('error')
    return null
  }
}

/**
 * React hook: subscribe to gradtrak + schedule store changes, debounce 5s,
 * push to cloud. No-op if VITE_SYNC_API_URL is unset.
 */
export function useAutoSync() {
  useEffect(() => {
    if (!API) return
    let timer: ReturnType<typeof setTimeout> | null = null
    const schedule = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => { void syncToCloud() }, 5000)
    }
    const unsub1 = useGradtrakStore.subscribe(schedule)
    const unsub2 = useScheduleStore.subscribe(schedule)
    return () => {
      if (timer) clearTimeout(timer)
      unsub1()
      unsub2()
    }
  }, [])
}
