import { useEffect } from 'react'
import { Session } from './components/Session/Session'
import { useSessionStore } from './store/sessionStore'
import { isAdminMode } from './utils/adminMode'
import { ThemeProvider, useTheme } from './styles/ThemeContext'
import { ToastContainer } from './components/Toast/Toast'
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary'

function AppInner() {
  const initSavedProgressions = useSessionStore(s => s.initSavedProgressions)
  const setAdminMode = useSessionStore(s => s.setAdminMode)
  const { theme } = useTheme()

  useEffect(() => {
    initSavedProgressions()
    if (isAdminMode()) setAdminMode(true)
  }, [])

  return (
    <div style={{
      minHeight: '100vh', height: '100vh',
      background: theme.bg, color: theme.text,
      display: 'flex', flexDirection: 'column',
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      overflow: 'hidden',
      transition: 'background 0.2s, color 0.2s',
    }}>
      <header style={{
        padding: '12px 20px',
        borderBottom: `1px solid ${theme.borderSubtle}`,
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        background: theme.surface,
      }}>
        <span style={{ fontSize: 20 }}>🎸</span>
        <h1 style={{
          margin: 0, fontSize: 15, fontWeight: 700,
          letterSpacing: '-0.02em', color: theme.text, flex: 1,
        }}>
          Pentatonic Fretboard Visualizer
        </h1>
      </header>
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <ErrorBoundary>
          <Session />
        </ErrorBoundary>
      </main>
      <ToastContainer />
    </div>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  )
}

export default App
