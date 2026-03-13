import { createPinia } from 'pinia'

export const pinia = createPinia()

export * from './taskStore'
export * from './projectStore'
export * from './uiStore'
