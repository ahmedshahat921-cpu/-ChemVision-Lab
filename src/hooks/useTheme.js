import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    const handleThemeChange = () => {
      const current = localStorage.getItem('theme') || 'light'
      setThemeState(current)
      if (current === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    window.addEventListener('themeChange', handleThemeChange)
    return () => window.removeEventListener('themeChange', handleThemeChange)
  }, [theme])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', nextTheme)
    setThemeState(nextTheme)
    
    const root = document.documentElement
    if (nextTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    window.dispatchEvent(new Event('themeChange'))
  }

  return { theme, isDark: theme === 'dark', toggleTheme }
}
