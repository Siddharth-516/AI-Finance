/** Purpose: simple persisted appearance helpers. */
const THEME_STORAGE_KEY = 'aifc_theme'

export function getSavedTheme() {
  if (typeof window === 'undefined') return 'dark'
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia?.('(prefers-color-scheme: light)')?.matches ? 'light' : 'dark'
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return theme
  const resolved = theme === 'light' ? 'light' : 'dark'
  document.documentElement.classList.toggle('light', resolved === 'light')
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_STORAGE_KEY, resolved)
  }
  return resolved
}

export function toggleTheme() {
  const current = typeof document !== 'undefined' && document.documentElement.classList.contains('light') ? 'light' : 'dark'
  const next = current === 'light' ? 'dark' : 'light'
  return applyTheme(next)
}

export function getThemeLabel(theme) {
  return theme === 'light' ? 'Light' : 'Dark'
}
