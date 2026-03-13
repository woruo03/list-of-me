// 应用常量

export const APP_NAME = 'List-of-Me'
export const APP_VERSION = '0.1.0'
export const APP_DESCRIPTION = '基于 GTD 理念的桌面任务管理应用'

// 任务状态常量
export const TASK_STATUS = {
  TODO: 'todo',
  DOING: 'doing',
  DONE: 'done',
} as const

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.TODO]: '待办',
  [TASK_STATUS.DOING]: '进行中',
  [TASK_STATUS.DONE]: '已完成',
}

export const TASK_STATUS_COLORS = {
  [TASK_STATUS.TODO]: 'primary',
  [TASK_STATUS.DOING]: 'warning',
  [TASK_STATUS.DONE]: 'success',
}

// 颜色常量
export const COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
}

// 路由常量
export const ROUTES = {
  INBOX: '/inbox',
  TODAY: '/today',
  PROJECTS: '/projects',
  COMPLETED: '/completed',
}

// 本地存储键名
export const STORAGE_KEYS = {
  THEME: 'list-of-me-theme',
  SIDEBAR_COLLAPSED: 'list-of-me-sidebar-collapsed',
  LAST_VISITED: 'list-of-me-last-visited',
  FONT_SIZE: 'list-of-me-font-size',
  FONT_FAMILY: 'list-of-me-font-family',
}

// DaisyUI 内置主题
export const DAISYUI_THEMES = [
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
  'dim',
  'nord',
  'sunset',
  'caramellatte',
  'abyss',
  'silk',
]

export const FONT_SIZES = [12, 13, 14, 15, 16, 17, 18, 20]

export const FONT_FAMILIES = [
  { label: 'Space Grotesk', value: '"Space Grotesk", "Noto Sans SC", sans-serif' },
  { label: 'Noto Sans SC', value: '"Noto Sans SC", sans-serif' },
  { label: 'Inter', value: 'Inter, "Noto Sans SC", sans-serif' },
  { label: 'Source Sans 3', value: '"Source Sans 3", "Noto Sans SC", sans-serif' },
  { label: 'System UI', value: 'system-ui, -apple-system, "Noto Sans SC", sans-serif' },
]

// 常见本机字体候选列表（用于检测）
// 不使用预设字体列表，字体由本机检测提供

// 快捷键常量
export const SHORTCUTS = {
  NEW_TASK: 'Ctrl+N',
  SEARCH: 'Ctrl+F',
  TOGGLE_STATUS: 'Space',
  DELETE: 'Delete',
}

// 时间常量（毫秒）
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
}

// 默认值
export const DEFAULTS = {
  TASK: {
    STATUS: TASK_STATUS.TODO,
  },
  UI: {
    THEME: 'light',
    SIDEBAR_COLLAPSED: false,
  },
}

// 限制常量
export const LIMITS = {
  TASK_TITLE_MAX_LENGTH: 200,
  TASK_DESCRIPTION_MAX_LENGTH: 1000,
  PROJECT_NAME_MAX_LENGTH: 100,
  NOTES_MAX_LENGTH: 2000,
}
