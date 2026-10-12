import { ref } from 'vue'

const STORAGE_KEY = 'mi-xian-ju-theme'

function readTheme(): 'light' | 'dark' {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'dark' ? 'dark' : 'light'
}

const theme = ref<'light' | 'dark'>(readTheme())

function applyTheme(value: 'light' | 'dark') {
  document.documentElement.classList.toggle('site-theme-dark', value === 'dark')
}

applyTheme(theme.value)

export function useAppStore() {
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem(STORAGE_KEY, theme.value)
    applyTheme(theme.value)
  }

  return { theme, toggleTheme }
}
