export const DARK_THEME = {
  bg: '#1A202C',
  surface: '#2D3748',
  surfaceRaised: '#1a2035',
  border: '#4A5568',
  borderSubtle: 'rgba(255,255,255,0.07)',
  text: '#F7FAFC',
  textMuted: '#A0AEC0',
  textDim: '#4A5568',
  accent: '#63B3ED',
  accentSoft: 'rgba(99,179,237,0.12)',
  success: '#48BB78',
  successSoft: 'rgba(72,187,120,0.15)',
  danger: '#FC8181',
  dangerSoft: 'rgba(229,62,62,0.12)',
  rootDot: '#E53E3E',
  overlay: 'rgba(0,0,0,0.75)',
  shadow: '0 8px 32px rgba(0,0,0,0.5)',
} as const

export const LIGHT_THEME = {
  bg: '#F7FAFC',
  surface: '#FFFFFF',
  surfaceRaised: '#EDF2F7',
  border: '#CBD5E0',
  borderSubtle: 'rgba(0,0,0,0.07)',
  text: '#1A202C',
  textMuted: '#718096',
  textDim: '#A0AEC0',
  accent: '#3182CE',
  accentSoft: 'rgba(49,130,206,0.1)',
  success: '#276749',
  successSoft: 'rgba(39,103,73,0.1)',
  danger: '#C53030',
  dangerSoft: 'rgba(197,48,48,0.1)',
  rootDot: '#C53030',
  overlay: 'rgba(0,0,0,0.4)',
  shadow: '0 4px 20px rgba(0,0,0,0.12)',
} as const

export type Theme = typeof DARK_THEME
export type ThemeKey = 'dark' | 'light'

export const THEMES: Record<ThemeKey, Theme> = {
  dark: DARK_THEME,
  light: LIGHT_THEME,
}
