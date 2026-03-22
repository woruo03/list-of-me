import { defineStore } from 'pinia'
import { DAISYUI_THEMES, FONT_SIZES, STORAGE_KEYS } from '@/utils/constants'

type ConfirmIntent = 'danger' | 'primary'

interface UIState {
  sidebarCollapsed: boolean
  theme: string
  fontSize: number
  fontFamily: string
  modal: {
    isOpen: boolean
    type: 'project' | null
    data: any
  }
  confirmDialog: {
    isOpen: boolean
    title: string
    message: string
    confirmText: string
    cancelText: string
    intent: ConfirmIntent
  }
  notifications: {
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
    timeout: number
  }[]
  searchFocusToken: number
}

let pendingConfirmResolver: ((confirmed: boolean) => void) | null = null

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    sidebarCollapsed: false,
    theme: 'light',
    fontSize: 16,
    fontFamily: '"Space Grotesk", "Noto Sans SC", sans-serif',
    modal: {
      isOpen: false,
      type: null,
      data: null,
    },
    confirmDialog: {
      isOpen: false,
      title: '',
      message: '',
      confirmText: '确认',
      cancelText: '取消',
      intent: 'danger',
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

    setFontSize(size: number) {
      const next = FONT_SIZES.includes(size) ? size : 16
      this.fontSize = next
      localStorage.setItem(STORAGE_KEYS.FONT_SIZE, String(next))
      document.documentElement.style.setProperty('--app-font-size', `${next}px`)
    },

    setFontFamily(family: string) {
      const trimmed = family.trim()
      const next = trimmed || '"Space Grotesk", "Noto Sans SC", sans-serif'
      this.fontFamily = next
      localStorage.setItem(STORAGE_KEYS.FONT_FAMILY, next)
      document.documentElement.style.setProperty('--app-font', next)
    },

    hydrateFromStorage() {
      const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME)
      if (storedTheme) {
        this.setTheme(storedTheme)
      } else {
        this.setTheme('light')
      }

      const storedFontSize = localStorage.getItem(STORAGE_KEYS.FONT_SIZE)
      if (storedFontSize) {
        this.setFontSize(Number(storedFontSize))
      } else {
        this.setFontSize(16)
      }

      const storedFontFamily = localStorage.getItem(STORAGE_KEYS.FONT_FAMILY)
      if (storedFontFamily) {
        this.setFontFamily(storedFontFamily)
      } else {
        this.setFontFamily('"Space Grotesk", "Noto Sans SC", sans-serif')
      }

      const collapsed = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED)
      if (collapsed === 'true' || collapsed === 'false') {
        this.sidebarCollapsed = collapsed === 'true'
      }
    },

    openModal(type: 'project', data?: any) {
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

    confirmDestructive(options?: {
      title?: string
      message?: string
      confirmText?: string
      cancelText?: string
      intent?: ConfirmIntent
    }) {
      if (pendingConfirmResolver) {
        pendingConfirmResolver(false)
        pendingConfirmResolver = null
      }

      this.confirmDialog = {
        isOpen: true,
        title: options?.title || '确认删除',
        message: options?.message || '此操作不可撤销，确定继续吗？',
        confirmText: options?.confirmText || '确认删除',
        cancelText: options?.cancelText || '取消',
        intent: options?.intent || 'danger',
      }

      return new Promise<boolean>((resolve) => {
        pendingConfirmResolver = resolve
      })
    },

    resolveConfirmDialog(confirmed: boolean) {
      if (pendingConfirmResolver) {
        pendingConfirmResolver(confirmed)
        pendingConfirmResolver = null
      }
      this.confirmDialog = {
        isOpen: false,
        title: '',
        message: '',
        confirmText: '确认',
        cancelText: '取消',
        intent: 'danger',
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
