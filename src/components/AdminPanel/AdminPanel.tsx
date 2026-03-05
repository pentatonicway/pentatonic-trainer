import { useState } from 'react'
import { useToastStore } from '../../store/toastStore'
import { serializeOverrides } from '../../utils/overrides'
import type { OverrideRule } from '../../types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AdminPanelProps = {
  overrides: OverrideRule[]
  onClearAll: () => void
  onRemoveOverride: (key: string) => void
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  panel: {
    position: 'fixed' as const,
    bottom: 16,
    right: 16,
    width: 320,
    maxHeight: '60vh',
    background: 'linear-gradient(160deg, #1a1030 0%, #120d22 100%)',
    border: '1px solid rgba(159,122,234,0.35)',
    borderRadius: 12,
    boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(159,122,234,0.1)',
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    zIndex: 8888,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    borderBottom: '1px solid rgba(159,122,234,0.2)',
    flexShrink: 0,
  },
  adminBadge: {
    background: 'rgba(159,122,234,0.25)',
    border: '1px solid rgba(159,122,234,0.5)',
    borderRadius: 4,
    color: '#B794F4',
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: '0.12em',
    padding: '2px 6px',
    textTransform: 'uppercase' as const,
  },
  headerText: {
    flex: 1,
    fontSize: 11,
    fontWeight: 600,
    color: '#B794F4',
    letterSpacing: '0.04em',
  },
  overrideCount: {
    fontSize: 10,
    color: '#805AD5',
    fontWeight: 600,
  },
  actions: {
    display: 'flex',
    gap: 6,
    padding: '8px 14px',
    borderBottom: '1px solid rgba(159,122,234,0.1)',
    flexShrink: 0,
  },
  copyBtn: (copied: boolean) => ({
    flex: 1,
    background: copied ? 'rgba(72,187,120,0.15)' : 'rgba(159,122,234,0.12)',
    border: `1px solid ${copied ? 'rgba(72,187,120,0.4)' : 'rgba(159,122,234,0.3)'}`,
    borderRadius: 7,
    color: copied ? '#9AE6B4' : '#B794F4',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 600,
    padding: '6px 10px',
    transition: 'all 0.15s',
    letterSpacing: '0.03em',
  }),
  clearBtn: (confirming: boolean) => ({
    background: confirming ? 'rgba(229,62,62,0.2)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${confirming ? 'rgba(229,62,62,0.5)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 7,
    color: confirming ? '#FC8181' : '#718096',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 600,
    padding: '6px 10px',
    transition: 'all 0.15s',
    letterSpacing: '0.03em',
  }),
  list: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '6px 10px 10px',
    scrollbarWidth: 'thin' as const,
    scrollbarColor: 'rgba(159,122,234,0.2) transparent',
  },
  emptyList: {
    textAlign: 'center' as const,
    color: '#553C9A',
    fontSize: 12,
    padding: '16px 8px',
  },
  overrideRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 6px',
    borderRadius: 6,
    background: 'rgba(255,255,255,0.03)',
    marginBottom: 4,
  },
  ruleKey: {
    flex: 1,
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#D6BCFA',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  shapeBadge: {
    background: 'rgba(159,122,234,0.2)',
    borderRadius: 4,
    color: '#B794F4',
    fontSize: 10,
    fontWeight: 700,
    padding: '1px 6px',
    flexShrink: 0,
  },
  removeRowBtn: {
    background: 'none',
    border: '1px solid rgba(229,62,62,0.3)',
    borderRadius: 4,
    color: '#FC8181',
    cursor: 'pointer',
    fontSize: 10,
    fontWeight: 700,
    padding: '1px 6px',
    flexShrink: 0,
    lineHeight: 1.4,
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminPanel({ overrides, onClearAll, onRemoveOverride }: AdminPanelProps) {
  const [copied, setCopied] = useState(false)
  const [confirmingClear, setConfirmingClear] = useState(false)

  const handleCopy = async () => {
    const { showToast } = useToastStore.getState()
    try {
      await navigator.clipboard.writeText(serializeOverrides(overrides))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      showToast('Override file copied to clipboard ✓', 'success')
    } catch {
      // fallback: create a textarea and copy
      const el = document.createElement('textarea')
      el.value = serializeOverrides(overrides)
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClearClick = () => {
    if (confirmingClear) {
      onClearAll()
      setConfirmingClear(false)
    } else {
      setConfirmingClear(true)
    }
  }

  return (
    <div style={S.panel} data-testid="admin-panel">
      {/* ── Header ── */}
      <div style={S.header}>
        <span style={S.adminBadge}>Admin</span>
        <span style={S.headerText}>Override Editor</span>
        <span style={S.overrideCount} data-testid="override-count">
          {overrides.length} override{overrides.length !== 1 ? 's' : ''} active
        </span>
      </div>

      {/* ── Action buttons ── */}
      <div style={S.actions}>
        <button
          style={S.copyBtn(copied)}
          onClick={handleCopy}
          data-testid="copy-overrides-btn"
          aria-label="Copy override file to clipboard"
        >
          {copied ? '✓ Copied!' : 'Copy Override File'}
        </button>
        <button
          style={S.clearBtn(confirmingClear)}
          onClick={handleClearClick}
          data-testid="clear-overrides-btn"
          aria-label={confirmingClear ? 'Confirm clear all overrides' : 'Clear all overrides'}
        >
          {confirmingClear ? 'Confirm?' : 'Clear All'}
        </button>
      </div>

      {/* ── Override list ── */}
      <div style={S.list} data-testid="overrides-list">
        {overrides.length === 0 ? (
          <div style={S.emptyList} data-testid="no-overrides">
            No overrides yet. Use Learn buttons in Admin mode.
          </div>
        ) : (
          overrides.map(rule => (
            <div key={rule.key} style={S.overrideRow} data-testid={`override-row-${rule.key}`}>
              <span style={S.ruleKey} title={rule.key}>{rule.key}</span>
              <span style={S.shapeBadge}>pos {rule.shapeIndex + 1}</span>
              <button
                style={S.removeRowBtn}
                onClick={() => onRemoveOverride(rule.key)}
                aria-label={`Remove override ${rule.key}`}
                data-testid={`remove-override-${rule.key}`}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AdminPanel
