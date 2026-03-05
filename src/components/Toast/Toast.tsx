import { useToastStore } from '../../store/toastStore'
import { useTheme } from '../../styles/ThemeContext'
import type { Toast, ToastType } from '../../store/toastStore'

// ─── Per-type colors ──────────────────────────────────────────────────────────

function toastColors(type: ToastType, isDark: boolean) {
  if (type === 'success') return {
    bg: isDark ? 'rgba(39,103,73,0.95)' : 'rgba(236,253,245,0.98)',
    border: isDark ? 'rgba(72,187,120,0.5)' : 'rgba(72,187,120,0.6)',
    text: isDark ? '#9AE6B4' : '#22543D',
    icon: '✓',
  }
  if (type === 'error') return {
    bg: isDark ? 'rgba(97,26,26,0.95)' : 'rgba(255,245,245,0.98)',
    border: isDark ? 'rgba(229,62,62,0.5)' : 'rgba(229,62,62,0.5)',
    text: isDark ? '#FC8181' : '#C53030',
    icon: '✕',
  }
  return {
    bg: isDark ? 'rgba(26,50,97,0.95)' : 'rgba(235,248,255,0.98)',
    border: isDark ? 'rgba(99,179,237,0.4)' : 'rgba(49,130,206,0.4)',
    text: isDark ? '#90CDF4' : '#2C5282',
    icon: 'ℹ',
  }
}

// ─── Single toast ─────────────────────────────────────────────────────────────

function ToastItem({ toast }: { toast: Toast }) {
  const { themeKey } = useTheme()
  const { dismissToast } = useToastStore()
  const isDark = themeKey === 'dark'
  const colors = toastColors(toast.type, isDark)

  return (
    <div
      role="alert"
      aria-live="polite"
      data-testid={`toast-${toast.id}`}
      data-type={toast.type}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(8px)',
        color: colors.text,
        fontSize: 13,
        fontWeight: 500,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        maxWidth: 320,
        animation: 'toastSlideIn 0.2s ease-out',
        cursor: 'pointer',
      }}
      onClick={() => dismissToast(toast.id)}
    >
      <span style={{ fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{colors.icon}</span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
      <button
        onClick={e => { e.stopPropagation(); dismissToast(toast.id) }}
        aria-label="Dismiss"
        data-testid={`toast-dismiss-${toast.id}`}
        style={{
          background: 'none', border: 'none', color: 'inherit',
          cursor: 'pointer', fontSize: 14, opacity: 0.6, padding: '0 2px',
          flexShrink: 0,
        }}
      >×</button>
    </div>
  )
}

// ─── Toast container ──────────────────────────────────────────────────────────

export function ToastContainer() {
  const toasts = useToastStore(s => s.toasts)

  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
      <div
        data-testid="toast-container"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: toasts.length ? 'auto' : 'none',
        }}
      >
        {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
      </div>
    </>
  )
}

export default ToastContainer
