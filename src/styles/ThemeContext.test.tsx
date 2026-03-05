import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from './ThemeContext'
import { DARK_THEME, LIGHT_THEME } from './theme'

// ─── Helper: renders a component that exposes theme values ───────────────────

function ThemeDisplay() {
  const { theme, themeKey, toggleTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme-key">{themeKey}</span>
      <span data-testid="theme-bg">{theme.bg}</span>
      <span data-testid="theme-text">{theme.text}</span>
      <button data-testid="toggle" onClick={toggleTheme}>Toggle</button>
    </div>
  )
}

function Wrapper({ children = <ThemeDisplay /> }) {
  return <ThemeProvider>{children}</ThemeProvider>
}

describe('ThemeProvider / useTheme', () => {

  beforeEach(() => {
    try { localStorage.clear() } catch {}
  })

  it('provides the dark theme by default', () => {
    render(<Wrapper />)
    expect(screen.getByTestId('theme-key').textContent).toBe('dark')
    expect(screen.getByTestId('theme-bg').textContent).toBe(DARK_THEME.bg)
  })

  it('useTheme returns correct bg and text for dark theme', () => {
    render(<Wrapper />)
    expect(screen.getByTestId('theme-bg').textContent).toBe(DARK_THEME.bg)
    expect(screen.getByTestId('theme-text').textContent).toBe(DARK_THEME.text)
  })

  it('toggleTheme switches from dark to light', () => {
    render(<Wrapper />)
    fireEvent.click(screen.getByTestId('toggle'))
    expect(screen.getByTestId('theme-key').textContent).toBe('light')
    expect(screen.getByTestId('theme-bg').textContent).toBe(LIGHT_THEME.bg)
  })

  it('toggleTheme switches back from light to dark', () => {
    render(<Wrapper />)
    fireEvent.click(screen.getByTestId('toggle'))
    fireEvent.click(screen.getByTestId('toggle'))
    expect(screen.getByTestId('theme-key').textContent).toBe('dark')
  })

  it('light theme has correct values', () => {
    render(<Wrapper />)
    fireEvent.click(screen.getByTestId('toggle'))
    expect(screen.getByTestId('theme-bg').textContent).toBe(LIGHT_THEME.bg)
    expect(screen.getByTestId('theme-text').textContent).toBe(LIGHT_THEME.text)
  })

  it('persists theme choice to localStorage', () => {
    render(<Wrapper />)
    fireEvent.click(screen.getByTestId('toggle'))  // → light
    expect(localStorage.getItem('theme_preference')).toBe('light')
  })

  it('reads theme from localStorage on mount', () => {
    localStorage.setItem('theme_preference', 'light')
    render(<Wrapper />)
    expect(screen.getByTestId('theme-key').textContent).toBe('light')
    expect(screen.getByTestId('theme-bg').textContent).toBe(LIGHT_THEME.bg)
  })

  it('defaults to dark if localStorage has invalid value', () => {
    localStorage.setItem('theme_preference', 'invalid')
    render(<Wrapper />)
    expect(screen.getByTestId('theme-key').textContent).toBe('dark')
  })

  it('ThemeProvider renders children', () => {
    render(<ThemeProvider><span data-testid="child">hello</span></ThemeProvider>)
    expect(screen.getByTestId('child')).toBeTruthy()
  })
})
