import { defineStore } from 'pinia'
import { DEFAULT_THEME } from '@/config/setting'

export const DEFAULT_THEME_VARIABLE = {
  '--global-primary-color': '#16baaa',
  '--global-normal-color': '#1e9fff',
  '--global-warm-color': '#ffb800',
  '--global-danger-color': '#ff5722',
  '--global-checked-color': '#16b777',
  '--global-border-radius': '2px',
  '--global-neutral-color-1': '#FAFAFA',
  '--global-neutral-color-2': '#F6F6F6',
  '--global-neutral-color-3': '#eeeeee',
  '--global-neutral-color-4': '#e2e2e2',
  '--global-neutral-color-5': '#dddddd',
  '--global-neutral-color-6': '#d2d2d2',
  '--global-neutral-color-7': '#cccccc',
  '--global-neutral-color-8': '#c2c2c2',
}

export const useAppStore = defineStore('app', {
  state: () => ({
    theme: DEFAULT_THEME as 'light' | 'dark',
    themeVariable: { ...DEFAULT_THEME_VARIABLE },
  }),
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
    },
    resetThemeVariable() {
      this.themeVariable = { ...DEFAULT_THEME_VARIABLE }
    },
  },
  persist: {
    paths: ['theme', 'themeVariable'],
  },
})
