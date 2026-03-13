<template>
  <header class="bg-base-100 border-b border-base-300 px-6 py-4">
    <div class="flex items-center justify-between gap-6">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">{{ pageTitle }}</h2>
        <p class="text-base-content/70 text-sm mt-1">{{ pageDescription }}</p>
      </div>

      <div class="flex items-center gap-3">
        <div class="relative w-72">
          <input
            ref="searchInput"
            type="text"
            :value="taskStore.searchQuery"
            placeholder="搜索任务..."
            class="input input-bordered w-full pl-10"
            @input="handleSearch"
          />
          <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50">🔍</span>
        </div>

        <button class="btn btn-primary" @click="openAddTaskModal">
          <span class="mr-2">+</span>
          添加任务
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import { useUIStore } from '@/stores/uiStore'

const route = useRoute()
const taskStore = useTaskStore()
const uiStore = useUIStore()
const searchInput = ref<HTMLInputElement | null>(null)

const pageTitle = computed(() => (route.meta.title as string) || 'List-of-Me')

const pageDescription = computed(() => {
  const descriptions: Record<string, string> = {
    Inbox: '收集所有未整理的想法和任务',
    Today: '专注于今日需要完成的任务',
    Projects: '按项目组织和管理任务',
    ProjectDetail: '项目内任务管理',
    Completed: '查看已完成的任务历史',
  }
  return descriptions[route.name as string] || '高效管理你的任务'
})

const handleSearch = (event: Event) => {
  const target = event.target as HTMLInputElement
  taskStore.setSearchQuery(target.value)
}

const openAddTaskModal = () => {
  uiStore.openModal('task', { mode: 'create' })
}


watch(
  () => uiStore.searchFocusToken,
  () => {
    searchInput.value?.focus()
    searchInput.value?.select()
  },
)
</script>

<style scoped>
/* 头部样式 */
</style>
