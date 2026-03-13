import { defineStore } from 'pinia'
import { STORAGE_KEYS } from '@/utils/constants'

interface UIState {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'auto'
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

    setTheme(theme: 'light' | 'dark' | 'auto') {
      this.theme = theme
      localStorage.setItem(STORAGE_KEYS.THEME, theme)

      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark')
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
      }
    },

    hydrateFromStorage() {
      const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME)
      if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'auto') {
        this.setTheme(storedTheme)
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
