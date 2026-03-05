export type ToolbarProps = {
  transposeOffset: number
  onTransposeUp: () => void
  onTransposeDown: () => void
  onOpenPresets: () => void
  onLockAll: () => void
  onUnlockAll: () => void
  onToggleLibrary?: () => void
  libraryOpen?: boolean
  onToggleTheme?: () => void
  themeKey?: 'dark' | 'light'
}

const S = {
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    flexShrink: 0,
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    flexWrap: 'wrap' as const,
  },
  group: { display: 'flex', alignItems: 'center', gap: 4 },
  divider: { width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 6px' },
  btn: (variant: 'default' | 'accent' | 'ghost' | 'active' = 'default') => ({
    background:
      variant === 'accent' ? 'rgba(99,179,237,0.12)' :
      variant === 'active' ? 'rgba(255,255,255,0.12)' :
      variant === 'ghost' ? 'none' : 'rgba(255,255,255,0.06)',
    border: `1px solid ${
      variant === 'accent' ? 'rgba(99,179,237,0.35)' :
      variant === 'active' ? 'rgba(255,255,255,0.25)' :
      variant === 'ghost' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.1)'
    }`,
    borderRadius: 7,
    color: variant === 'accent' ? '#90CDF4' : '#A0AEC0',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    padding: '6px 12px',
    letterSpacing: '0.03em',
    transition: 'all 0.12s',
    whiteSpace: 'nowrap' as const,
  }),
  transposeLabel: {
    fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
    textTransform: 'uppercase' as const, color: '#4A5568', marginRight: 2,
  },
  transposeBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6, color: '#A0AEC0', cursor: 'pointer',
    fontSize: 14, fontWeight: 700, width: 28, height: 28,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.12s', padding: 0,
  },
  offsetBadge: (offset: number) => ({
    background: offset !== 0 ? 'rgba(99,179,237,0.15)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${offset !== 0 ? 'rgba(99,179,237,0.3)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 6,
    color: offset !== 0 ? '#90CDF4' : '#4A5568',
    fontSize: 12, fontWeight: 700, minWidth: 34, height: 28,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    letterSpacing: '0.04em', padding: '0 6px',
  }),
}

export function Toolbar({
  transposeOffset, onTransposeUp, onTransposeDown,
  onOpenPresets, onLockAll, onUnlockAll,
  onToggleLibrary, libraryOpen = false,
  onToggleTheme, themeKey = 'dark',
}: ToolbarProps) {
  const offsetLabel = transposeOffset === 0 ? '0' : transposeOffset > 0 ? `+${transposeOffset}` : `${transposeOffset}`

  return (
    <div style={S.toolbar} data-testid="toolbar">
      <button style={S.btn('accent')} onClick={onOpenPresets}
        data-testid="open-presets-btn" aria-label="Open presets">
        🎼 Presets
      </button>

      {onToggleLibrary && (
        <button style={S.btn(libraryOpen ? 'active' : 'default')}
          onClick={onToggleLibrary}
          data-testid="toggle-library-btn"
          aria-label={libraryOpen ? 'Close library' : 'Open library'}>
          📚 Library
        </button>
      )}

      <div style={S.divider} />

      <div style={S.group}>
        <span style={S.transposeLabel}>Transpose</span>
        <button style={S.transposeBtn} onClick={onTransposeDown}
          data-testid="transpose-down-btn" aria-label="Transpose down">−</button>
        <div style={S.offsetBadge(transposeOffset)}
          data-testid="transpose-offset"
          aria-label={`Transpose offset: ${offsetLabel}`}>
          {offsetLabel}
        </div>
        <button style={S.transposeBtn} onClick={onTransposeUp}
          data-testid="transpose-up-btn" aria-label="Transpose up">+</button>
      </div>

      <div style={S.divider} />

      <div style={S.group}>
        <button style={S.btn('ghost')} onClick={onLockAll}
          data-testid="lock-all-btn" aria-label="Lock all boxes">🔒 Lock All</button>
        <button style={S.btn('ghost')} onClick={onUnlockAll}
          data-testid="unlock-all-btn" aria-label="Unlock all boxes">🔓 Unlock All</button>
      </div>
      {onToggleTheme && (
        <>
          <div style={S.divider} />
          <button
            style={S.btn('ghost')}
            onClick={onToggleTheme}
            data-testid="theme-toggle-btn"
            aria-label={themeKey === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={themeKey === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {themeKey === 'dark' ? '☀️' : '🌙'}
          </button>
        </>
      )}
    </div>
  )
}

export default Toolbar
