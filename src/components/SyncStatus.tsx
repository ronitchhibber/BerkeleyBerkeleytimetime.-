import { useEffect, useState } from 'react'
import { getSyncStatus, subscribeSync, type SyncStatus as Status } from '@/services/sync'

function timeAgo(iso: string | null): string {
  if (!iso) return ''
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  return `${Math.floor(seconds / 3600)}h ago`
}

const COLOR: Record<Status, string> = {
  disabled: 'text-text-muted/40',
  idle: 'text-text-muted',
  syncing: 'text-cal-gold animate-pulse',
  synced: 'text-soybean',
  offline: 'text-text-muted',
  error: 'text-wellman',
}

const TITLE: Record<Status, (when: string | null) => string> = {
  disabled: () => 'Sync disabled (no backend configured)',
  idle: () => 'Sync ready',
  syncing: () => 'Syncing…',
  synced: (w) => `Synced ${timeAgo(w)}`,
  offline: () => 'Offline — will retry',
  error: () => 'Sync error — will retry',
}

export default function SyncStatus() {
  const [{ status, lastSyncedAt }, setState] = useState(getSyncStatus())
  useEffect(() => subscribeSync((status, lastSyncedAt) => setState({ status, lastSyncedAt })), [])
  if (status === 'disabled') return null
  return (
    <div
      className={`flex h-9 w-9 items-center justify-center ${COLOR[status]}`}
      title={TITLE[status](lastSyncedAt)}
      aria-label={TITLE[status](lastSyncedAt)}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      </svg>
    </div>
  )
}
