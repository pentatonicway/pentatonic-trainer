// ─── Types ───────────────────────────────────────────────────────────────────

export type ToolbarProps = {
  // Neck position (global shape index for all boxes)
  neckPosition: number
  onNeckUp: () => void
  onNeckDown: () => void
  // Cards count
  cardCount: number
  onSetCardCount: (n: number) => void
  // Popular presets
  onOpenPopular: () => void
  // Library
  onToggleLibrary?: () => void
  libraryOpen?: boolean
  // Scale degree controls
  onOpenScaleDegrees?: () => void
  // Theme
  onToggleTheme?: () => void
  themeKey?: 'dark' | 'light'
}

const CARD_OPTIONS = [2, 4, 8, 12, 16]

// ─── Component ───────────────────────────────────────────────────────────────

export function Toolbar({
  neckPosition,
  onNeckUp,
  onNeckDown,
  cardCount,
  onSetCardCount,
  onOpenPopular,
  onToggleLibrary,
  libraryOpen = false,
  onOpenScaleDegrees,
  onToggleTheme,
  themeKey = 'dark',
}: ToolbarProps) {
  const isLight = themeKey === 'light'

  // Theme-aware color tokens
  const bg = isLight ? '#FFFFFF' : '#1A202C'
  const border = isLight ? '#E2E8F0' : 'rgba(255,255,255,0.07)'
  const textMuted = isLight ? '#718096' : '#718096'
  const labelColor = isLight ? '#4A5568' : '#718096'

  const toolbarStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    background: bg,
    borderBottom: `1px solid ${border}`,
    flexShrink: 0,
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    flexWrap: 'wrap' as const,
  }

  // Pill button (Popular, Library, Scale Degrees)
  const pillBtn = (active = false) => ({
    background: active
      ? '#F6A623'
      : (isLight ? '#F7FAFC' : 'rgba(255,255,255,0.08)'),
    border: `1px solid ${active
      ? '#F6A623'
      : (isLight ? '#E2E8F0' : 'rgba(255,255,255,0.12)')}`,
    borderRadius: 20,
    color: active ? '#000' : (isLight ? '#2D3748' : '#CBD5E0'),
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    padding: '7px 16px',
    letterSpacing: '0.01em',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  })

  // Small round nav button (◀ ▶)
  const navBtn = {
    background: isLight ? '#F7FAFC' : 'rgba(255,255,255,0.08)',
    border: `1px solid ${isLight ? '#E2E8F0' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: '50%',
    color: isLight ? '#4A5568' : '#A0AEC0',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.12s',
    padding: 0,
    flexShrink: 0,
  }

  // Neck position badge
  const neckBadge = {
    background: isLight ? '#EDF2F7' : 'rgba(255,255,255,0.06)',
    border: `1px solid ${isLight ? '#CBD5E0' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 8,
    color: isLight ? '#2D3748' : '#E2E8F0',
    fontSize: 14,
    fontWeight: 700,
    minWidth: 34,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 8px',
  }

  // Cards option button
  const cardBtn = (active: boolean) => ({
    background: active
      ? '#F6A623'
      : (isLight ? '#F7FAFC' : 'rgba(255,255,255,0.06)'),
    border: `1px solid ${active
      ? '#F6A623'
      : (isLight ? '#E2E8F0' : 'rgba(255,255,255,0.1)')}`,
    borderRadius: 8,
    color: active ? '#000' : (isLight ? '#718096' : '#718096'),
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: active ? 700 : 500,
    padding: '5px 10px',
    transition: 'all 0.12s',
    minWidth: 36,
  })

  const divider = {
    width: 1,
    height: 22,
    background: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
    margin: '0 4px',
    flexShrink: 0,
  }

  const label = {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.07em',
    textTransform: 'uppercase' as const,
    color: labelColor,
    whiteSpace: 'nowrap' as const,
  }

  return (
    <div style={toolbarStyle} data-testid="toolbar">

      {/* ── Popular ─────────────────────────────────────────── */}
      <button
        style={pillBtn()}
        onClick={onOpenPopular}
        data-testid="open-presets-btn"
        aria-label="Open popular progressions"
      >
        ⭐ Popular
      </button>

      {/* ── Library ─────────────────────────────────────────── */}
      {onToggleLibrary && (
        <button
          style={pillBtn(libraryOpen)}
          onClick={onToggleLibrary}
          data-testid="toggle-library-btn"
          aria-label={libraryOpen ? 'Close library' : 'Open library'}
        >
          📚 Library
        </button>
      )}

      <div style={divider} />

      {/* ── Scale Degree Controls ───────────────────────────── */}
      {onOpenScaleDegrees && (
        <>
          <button
            style={{
              ...pillBtn(),
              background: '#F6A623',
              border: '1px solid #F6A623',
              color: '#000',
            }}
            onClick={onOpenScaleDegrees}
            data-testid="scale-degrees-btn"
            aria-label="Open scale degree controls"
          >
            🎚 Scale Degree Controls
          </button>
          <div style={divider} />
        </>
      )}

      {/* ── Neck Position ───────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={label}>Neck Position</span>
        <button
          style={navBtn}
          onClick={onNeckDown}
          data-testid="neck-down-btn"
          aria-label="Previous neck position"
        >
          ◀
        </button>
        <div style={neckBadge} data-testid="neck-position">
          {neckPosition}
        </div>
        <button
          style={navBtn}
          onClick={onNeckUp}
          data-testid="neck-up-btn"
          aria-label="Next neck position"
        >
          ▶
        </button>
      </div>

      <div style={divider} />

      {/* ── Cards ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={label}>Cards</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {CARD_OPTIONS.map(n => (
            <button
              key={n}
              style={cardBtn(cardCount === n)}
              onClick={() => onSetCardCount(n)}
              aria-label={`Show ${n} cards`}
              aria-pressed={cardCount === n}
              data-testid={`card-count-${n}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* ── Theme toggle ────────────────────────────────────── */}
      {onToggleTheme && (
        <>
          <div style={{ ...divider, marginLeft: 'auto' }} />
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 18,
              padding: '2px 6px',
              borderRadius: 6,
              transition: 'transform 0.2s',
              color: textMuted,
            }}
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