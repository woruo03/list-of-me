<template>
  <aside
    class="bg-base-100/40 backdrop-blur-xl border-r border-white/10 flex flex-col duration-200 transition-[width] overflow-hidden shadow-2xl"
    :class="sidebarClass"
  >
    <div
      class="border-b border-white/10 flex items-center justify-between"
      :class="uiStore.sidebarCollapsed ? 'p-3' : 'p-6'"
    >
      <div class="flex items-center gap-2 min-w-0">
        <div class="w-9 h-9 bg-primary/90 rounded-xl flex items-center justify-center shadow-lg">
          <span class="text-primary-content font-bold">L</span>
        </div>
        <div v-if="!uiStore.sidebarCollapsed" class="min-w-0">
          <h1 class="text-xl font-bold tracking-tight">List-of-Me</h1>
          <p class="text-xs text-base-content/60 whitespace-nowrap">把今天安排得更聪明</p>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm btn-circle flex-shrink-0" @click="uiStore.toggleSidebar">☰</button>
    </div>

    <nav class="flex-1 p-4">
      <ul class="menu menu-md gap-1 w-full">
        <NavItem icon="📥" label="收集箱" to="/inbox" :collapsed="uiStore.sidebarCollapsed" />
        <NavItem icon="📅" label="今日" to="/today" :collapsed="uiStore.sidebarCollapsed" />
        <NavItem icon="📁" label="项目" to="/projects" :collapsed="uiStore.sidebarCollapsed" />
        <NavItem icon="✅" label="已完成" to="/completed" :collapsed="uiStore.sidebarCollapsed" />
        <NavItem icon="⚙" label="设置" to="/settings" :collapsed="uiStore.sidebarCollapsed" />
      </ul>
    </nav>

  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import NavItem from './NavItem.vue'
import { useUIStore } from '@/stores/uiStore'
const uiStore = useUIStore()

const sidebarClass = computed(() => {
  return uiStore.sidebarCollapsed ? 'w-24 min-w-[6rem]' : 'w-64 min-w-[16rem]'
})

</script>

<style scoped>
/* 侧边栏样式 */
</style>
