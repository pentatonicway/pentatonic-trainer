import { useState, useEffect, useRef } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

export type ToolbarProps = {
  // Neck position (global shape index for all boxes)
  neckPosition: number
  onNeckUp: () => void
  onNeckDown: () => void
  // Transpose
  currentKey: string
  onTransposeUp: () => void
  onTransposeDown: () => void
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
const COLLAPSE_WIDTH = 700

// ─── Component ───────────────────────────────────────────────────────────────

export function Toolbar({
  neckPosition,
  onNeckUp,
  onNeckDown,
  currentKey,
  onTransposeUp,
  onTransposeDown,
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Track window width for hamburger collapse
  useEffect(() => {
    const check = () => setCollapsed(window.innerWidth < COLLAPSE_WIDTH)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  // Theme-aware color tokens
  const bg = isLight ? '#202020' : '#452647'
  const border = isLight ? '#222222' : 'rgba(255,255,255,0.07)'
  const textMuted = isLight ? '#A0AEC0' : '#718096'
  const labelColor = isLight ? '#FFFFFF' : '#FFFFFF'

  const toolbarStyle = {
    display: 'flex',
    alignItems: 'flex-end',
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
    background: '#F6A623',
    border: `2px solid ${isLight ? '#F6A623' : '#000000'}`,
    borderRadius: 5,
    color: '#000',
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
    opacity: active ? 1 : 0.85,
  })

  // Small round nav button (◀ ▶)
  const navBtn = {
    background: '#F6A623',
    border: `2px solid ${isLight ? '#F6A623' : '#000000'}`,
    borderRadius: 5,
    color: '#000',
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
    background: '#000000',
    border: '1px solid #F6A623',
    borderRadius: 5,
    color: '#FFFFFF',
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
    background: active ? '#F6A623' : '#000000',
    border: `${active && !isLight ? '2px' : '1px'} solid ${active && !isLight ? '#000000' : '#F6A623'}`,
    borderRadius: 5,
    color: active ? '#000' : '#FFFFFF',
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
    background: 'rgba(246,166,35,0.3)',
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

  // All the toolbar controls as a fragment — used in both full and menu views
  const controls = (inMenu = false) => {
    const wrap = inMenu
      ? { display: 'flex', flexDirection: 'column' as const, gap: 8, padding: '12px 0' }
      : { display: 'contents' }
    return (
      <div style={wrap}>
        <button style={pillBtn()} onClick={() => { onOpenPopular(); setMenuOpen(false) }} data-testid="open-popular-btn" aria-label="Open popular progressions">Popular</button>
        {onToggleLibrary && <button style={pillBtn(libraryOpen)} onClick={() => { onToggleLibrary!(); setMenuOpen(false) }} data-testid="toggle-library-btn" aria-label={libraryOpen ? 'Close library' : 'Open library'}>Library</button>}
        {!inMenu && <div style={divider} />}
        {onOpenScaleDegrees && <button style={{ ...pillBtn(), background: '#F6A623', border: `2px solid ${isLight ? '#F6A623' : '#000000'}`, color: '#000' }} onClick={() => { onOpenScaleDegrees!(); setMenuOpen(false) }} data-testid="open-scale-degrees-btn" aria-label="Open scale degree controls">Scale Degrees</button>}
        {!inMenu && <div style={divider} />}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <span style={label}>Key</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button style={navBtn} onClick={onTransposeDown} data-testid="transpose-down-btn" aria-label="Transpose down">◀</button>
            <div style={neckBadge} data-testid="current-key-display">{currentKey}</div>
            <button style={navBtn} onClick={onTransposeUp} data-testid="transpose-up-btn" aria-label="Transpose up">▶</button>
          </div>
        </div>
        {!inMenu && <div style={divider} />}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <span style={label}>Neck</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button style={navBtn} onClick={onNeckDown} data-testid="neck-down-btn" aria-label="Previous neck position">◀</button>
            <div style={neckBadge} data-testid="neck-position-display">{neckPosition}</div>
            <button style={navBtn} onClick={onNeckUp} data-testid="neck-up-btn" aria-label="Next neck position">▶</button>
          </div>
        </div>
        {!inMenu && <div style={divider} />}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={label}>Cards</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {CARD_OPTIONS.map(n => (
              <button key={n} style={cardBtn(cardCount === n)} onClick={() => { onSetCardCount(n); setMenuOpen(false) }} aria-label={`Show ${n} cards`} aria-pressed={cardCount === n} data-testid={`card-count-${n}`}>{n}</button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={toolbarStyle} data-testid="toolbar">
      {collapsed ? (
        // ── Hamburger mode ──────────────────────────────────
        <>
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Open menu"
              style={{
                background: '#F6A623',
                border: `2px solid ${isLight ? '#F6A623' : '#000000'}`,
                borderRadius: 5,
                color: '#000',
                cursor: 'pointer',
                fontSize: 18,
                padding: '6px 12px',
                lineHeight: 1,
              }}
            >
              ☰
            </button>
            {menuOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: 6,
                background: bg,
                border: `1px solid ${isLight ? '#E2E8F0' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: 5,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                padding: '8px 16px',
                zIndex: 1000,
                minWidth: 240,
              }}>
                {controls(true)}
              </div>
            )}
          </div>

          {/* ── Key + Neck controls — always visible on mobile ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, marginLeft: 8 }}>
            <span style={label}>Key</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button style={navBtn} onClick={onTransposeDown} data-testid="transpose-down-btn" aria-label="Transpose down">◀</button>
              <div style={neckBadge} data-testid="current-key-display">{currentKey}</div>
              <button style={navBtn} onClick={onTransposeUp} data-testid="transpose-up-btn" aria-label="Transpose up">▶</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, marginLeft: 8 }}>
            <span style={label}>Neck</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button style={navBtn} onClick={onNeckDown} data-testid="neck-down-btn" aria-label="Previous neck position">◀</button>
              <div style={neckBadge} data-testid="neck-position-display">{neckPosition}</div>
              <button style={navBtn} onClick={onNeckUp} data-testid="neck-up-btn" aria-label="Next neck position">▶</button>
            </div>
          </div>
        </>
      ) : (
        // ── Full toolbar mode ────────────────────────────────
        <>
          {controls(false)}
        </>
      )}

      {/* ── Theme toggle — always visible ───────────────────── */}
      {onToggleTheme && (
        <div style={{ marginLeft: 'auto' }}>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '2px 6px', borderRadius: 5, transition: 'transform 0.2s', color: textMuted }}
            onClick={onToggleTheme}
            data-testid="theme-toggle-btn"
            aria-label={themeKey === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={themeKey === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {themeKey === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      )}
    </div>
  )
}