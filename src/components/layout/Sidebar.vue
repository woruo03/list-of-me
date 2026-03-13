<template>
  <aside
    class="bg-base-200 border-r border-base-300 flex flex-col transition-all duration-200"
    :class="sidebarClass"
  >
    <div class="p-6 border-b border-base-300 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
          <span class="text-primary-content font-bold">L</span>
        </div>
        <div v-if="!uiStore.sidebarCollapsed">
          <h1 class="text-xl font-bold tracking-tight">List-of-Me</h1>
          <p class="text-xs text-base-content/60">把今天安排得更聪明</p>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" @click="uiStore.toggleSidebar">☰</button>
    </div>

    <nav class="flex-1 p-4">
      <ul class="menu menu-md gap-1">
        <NavItem icon="📥" label="收集箱" to="/inbox" :collapsed="uiStore.sidebarCollapsed" />
        <NavItem icon="📅" label="今日" to="/today" :collapsed="uiStore.sidebarCollapsed" />
        <NavItem icon="📁" label="项目" to="/projects" :collapsed="uiStore.sidebarCollapsed" />
        <NavItem icon="✅" label="已完成" to="/completed" :collapsed="uiStore.sidebarCollapsed" />
      </ul>
    </nav>

    <div class="p-4 border-t border-base-300">
      <div v-if="!uiStore.sidebarCollapsed" class="text-xs text-base-content/60 mb-2">主题</div>
      <select
        class="select select-bordered select-sm w-full"
        :value="uiStore.theme"
        @change="handleThemeChange"
      >
        <option v-for="theme in themes" :key="theme" :value="theme">
          {{ theme }}
        </option>
      </select>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import NavItem from './NavItem.vue'
import { useUIStore } from '@/stores/uiStore'
import { DAISYUI_THEMES } from '@/utils/constants'

const uiStore = useUIStore()
const themes = DAISYUI_THEMES

const sidebarClass = computed(() => {
  return uiStore.sidebarCollapsed ? 'w-20' : 'w-64'
})

const handleThemeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  uiStore.setTheme(target.value)
}
</script>

<style scoped>
/* 侧边栏样式 */
</style>
