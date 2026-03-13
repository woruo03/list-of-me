<template>
  <aside
    class="bg-base-200 border-r border-base-300 flex flex-col transition-all duration-200"
    :class="sidebarClass"
  >
    <div class="p-6 border-b border-base-300 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span class="text-primary-content font-bold">L</span>
        </div>
        <h1 v-if="!uiStore.sidebarCollapsed" class="text-xl font-bold">List-of-Me</h1>
      </div>
      <button class="btn btn-ghost btn-sm" @click="uiStore.toggleSidebar">☰</button>
    </div>

    <nav class="flex-1 p-4">
      <ul class="space-y-2">
        <NavItem icon="📥" label="收集箱" to="/inbox" :badge="summary?.inbox_count || 0" :collapsed="uiStore.sidebarCollapsed" />
        <NavItem icon="📅" label="今日" to="/today" :badge="summary?.today_count || 0" :collapsed="uiStore.sidebarCollapsed" />
        <NavItem icon="📁" label="项目" to="/projects" :collapsed="uiStore.sidebarCollapsed" />
        <NavItem icon="✅" label="已完成" to="/completed" :collapsed="uiStore.sidebarCollapsed" />
      </ul>
    </nav>

    <div class="p-4 border-t border-base-300">
      <button class="btn btn-primary w-full" @click="openQuickAdd">
        <span class="mr-2">+</span>
        <span v-if="!uiStore.sidebarCollapsed">快速添加任务</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'
import NavItem from './NavItem.vue'
import { useTaskStore } from '@/stores/taskStore'
import { useUIStore } from '@/stores/uiStore'

const taskStore = useTaskStore()
const uiStore = useUIStore()

const summary = computed(() => taskStore.summary)

const sidebarClass = computed(() => {
  return uiStore.sidebarCollapsed ? 'w-20' : 'w-64'
})

const openQuickAdd = () => {
  uiStore.openModal('task', { mode: 'create' })
}

let intervalId: number | null = null

const startSummaryRefresh = () => {
  taskStore.refreshSummary()
  intervalId = window.setInterval(() => taskStore.refreshSummary(), 30000)
}

onMounted(() => {
  startSummaryRefresh()
})

onBeforeUnmount(() => {
  if (intervalId) window.clearInterval(intervalId)
})
</script>

<style scoped>
/* 侧边栏样式 */
</style>
