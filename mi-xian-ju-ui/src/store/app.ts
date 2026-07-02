import { defineStore } from 'pinia'
import { DEFAULT_THEME } from '@/config/setting'

const THEME_VARIABLE_VERSION = 3

export const DEFAULT_THEME_VARIABLE = {
  '--global-primary-color': '#1f9d8a',
  '--global-normal-color': '#3f7564',
  '--global-warm-color': '#c58b3a',
  '--global-danger-color': '#b85c4b',
  '--global-checked-color': '#2f8f68',
  '--global-border-radius': '12px',
  '--global-neutral-color-1': '#f8faf7',
  '--global-neutral-color-2': '#eef3ee',
  '--global-neutral-color-3': '#dfe8df',
  '--global-neutral-color-4': '#cbd8cf',
  '--global-neutral-color-5': '#aebfb4',
  '--global-neutral-color-6': '#8d9d93',
  '--global-neutral-color-7': '#66766d',
  '--global-neutral-color-8': '#46534d',
}

export const useAppStore = defineStore('app', {
  state: () => ({
    theme: DEFAULT_THEME as 'light' | 'dark',
    themeVariable: { ...DEFAULT_THEME_VARIABLE },
    themeVariableVersion: THEME_VARIABLE_VERSION,
  }),
  actions: {
    hydrateThemeVariable() {
      if (this.themeVariableVersion !== THEME_VARIABLE_VERSION) {
        this.resetThemeVariable()
      }
    },
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
    },
    resetThemeVariable() {
      this.themeVariable = { ...DEFAULT_THEME_VARIABLE }
      this.themeVariableVersion = THEME_VARIABLE_VERSION
    },
  },
  persist: {
    paths: ['theme', 'themeVariable', 'themeVariableVersion'],
  },
})
