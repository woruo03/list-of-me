import { defineStore } from 'pinia'
import { DAISYUI_THEMES, STORAGE_KEYS } from '@/utils/constants'

interface UIState {
  sidebarCollapsed: boolean
  theme: string
  modal: {
    isOpen: boolean
    type: 'task' | 'project' | 'settings' | null
    data: any
  }
  notifications: {
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
    timeout: number
  }[]
  searchFocusToken: number
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    sidebarCollapsed: false,
    theme: 'light',
    modal: {
      isOpen: false,
      type: null,
      data: null,
    },
    notifications: [],
    searchFocusToken: 0,
  }),

  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(this.sidebarCollapsed))
    },

    setSidebarCollapsed(value: boolean) {
      this.sidebarCollapsed = value
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(this.sidebarCollapsed))
    },

    setTheme(theme: string) {
      const next = DAISYUI_THEMES.includes(theme) ? theme : 'light'
      this.theme = next
      localStorage.setItem(STORAGE_KEYS.THEME, next)
      document.documentElement.setAttribute('data-theme', next)
    },

    hydrateFromStorage() {
      const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME)
      if (storedTheme) {
        this.setTheme(storedTheme)
      } else {
        this.setTheme('light')
      }

      const collapsed = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED)
      if (collapsed === 'true' || collapsed === 'false') {
        this.sidebarCollapsed = collapsed === 'true'
      }
    },

    openModal(type: 'task' | 'project' | 'settings', data?: any) {
      this.modal = {
        isOpen: true,
        type,
        data: data || null,
      }
    },

    closeModal() {
      this.modal = {
        isOpen: false,
        type: null,
        data: null,
      }
    },

    requestSearchFocus() {
      this.searchFocusToken += 1
    },

    addNotification(notification: {
      type: 'success' | 'error' | 'info' | 'warning'
      message: string
      timeout?: number
    }) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const newNotification = {
        id,
        ...notification,
        timeout: notification.timeout || 3500,
      }

      this.notifications.push(newNotification)

      setTimeout(() => {
        this.removeNotification(id)
      }, newNotification.timeout)
    },

    removeNotification(id: string) {
      this.notifications = this.notifications.filter((n) => n.id !== id)
    },

    clearNotifications() {
      this.notifications = []
    },
  },

  getters: {
    hasNotifications: (state) => state.notifications.length > 0,
  },
})
