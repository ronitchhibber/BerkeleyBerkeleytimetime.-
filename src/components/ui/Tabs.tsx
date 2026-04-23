interface TabsProps {
  tabs: string[]
  activeTab: string
  onChange: (tab: string) => void
  badges?: Record<string, number>
}

export default function Tabs({ tabs, activeTab, onChange, badges }: TabsProps) {
  return (
    <div className="flex shrink-0 items-center gap-1 border-b border-border bg-bg-primary px-8">
      {tabs.map((tab) => {
        const isActive = activeTab === tab
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`relative flex items-center gap-1.5 px-3.5 py-3 mono text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
              isActive ? 'text-cal-gold' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tab}
            {badges?.[tab] !== undefined && badges[tab] > 0 && (
              <span className="mono flex h-[18px] min-w-[18px] items-center justify-center rounded bg-cal-gold px-1 text-[10px] font-semibold text-bg-primary">
                {badges[tab]}
              </span>
            )}
            {isActive && (
              <>
                <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-cal-gold shadow-[0_0_8px_rgba(253,181,21,0.5)]" />
                <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-gradient-to-r from-cal-gold/0 via-cal-gold to-cal-gold/0 blur-sm" />
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}
