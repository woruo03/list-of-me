import { defineStore } from 'pinia';

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'auto';
  modal: {
    isOpen: boolean;
    type: 'task' | 'project' | 'settings' | null;
    data: any;
  };
  notifications: {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timeout: number;
  }[];
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
  }),
  
  actions: {
    // 切换侧边栏状态
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
    
    // 设置主题
    setTheme(theme: 'light' | 'dark' | 'auto') {
      this.theme = theme;
      // 应用到文档
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // 自动模式
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    
    // 打开模态框
    openModal(type: 'task' | 'project' | 'settings', data?: any) {
      this.modal = {
        isOpen: true,
        type,
        data: data || null,
      };
    },
    
    // 关闭模态框
    closeModal() {
      this.modal = {
        isOpen: false,
        type: null,
        data: null,
      };
    },
    
    // 添加通知
    addNotification(notification: {
      type: 'success' | 'error' | 'info' | 'warning';
      message: string;
      timeout?: number;
    }) {
      const id = Date.now().toString() + Math.random().toString(36).substr(2);
      const newNotification = {
        id,
        ...notification,
        timeout: notification.timeout || 5000,
      };
      
      this.notifications.push(newNotification);
      
      // 自动移除通知
      setTimeout(() => {
        this.removeNotification(id);
      }, newNotification.timeout);
    },
    
    // 移除通知
    removeNotification(id: string) {
      this.notifications = this.notifications.filter(n => n.id !== id);
    },
    
    // 清空所有通知
    clearNotifications() {
      this.notifications = [];
    },
  },
  
  getters: {
    // 是否有未读通知
    hasNotifications: (state) => {
      return state.notifications.length > 0;
    },
    
    // 获取成功通知
    successNotifications: (state) => {
      return state.notifications.filter(n => n.type === 'success');
    },
    
    // 获取错误通知
    errorNotifications: (state) => {
      return state.notifications.filter(n => n.type === 'error');
    },
  },
});