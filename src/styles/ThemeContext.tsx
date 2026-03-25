import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Theme, ThemeKey } from './theme'
import { THEMES } from './theme'

const STORAGE_KEY = 'theme_preference'

// ─── Context ──────────────────────────────────────────────────────────────────

type ThemeContextValue = {
  theme: Theme
  themeKey: ThemeKey
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: THEMES.dark,
  themeKey: 'dark',
  toggleTheme: () => {},
})

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeKey, setThemeKey] = useState<ThemeKey>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'dark' || saved === 'light') return saved
    } catch {}
    return 'dark'
  })

  const toggleTheme = useCallback(() => {
    setThemeKey(k => {
      const next: ThemeKey = k === 'dark' ? 'light' : 'dark'
      try { localStorage.setItem(STORAGE_KEY, next) } catch {}
      return next
    })
  }, [])

  // Apply bg color to document body so there's no flash of white
  useEffect(() => {
    document.body.style.backgroundColor = THEMES[themeKey].bg
  }, [themeKey])

  return (
    <ThemeContext.Provider value={{ theme: THEMES[themeKey], themeKey, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}