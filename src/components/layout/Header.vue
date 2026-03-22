<template>
  <header class="bg-base-100/35 backdrop-blur-xl border-b border-white/10 px-5 md:px-7 py-4 shadow-xl">
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
            v-model="searchDraft"
            placeholder="搜索任务..."
            class="input input-bordered w-full pl-10 bg-base-100/50 border-white/10 focus:outline-none focus:border-primary/50"
            @input="handleSearch"
          />
          <AppIcon name="search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/50" />
        </div>

        <button class="btn btn-primary btn-outline shadow-lg" @click="openAddTaskModal">
          <AppIcon name="plus" class="mr-2 h-4 w-4" />
          添加任务
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import { useUIStore } from '@/stores/uiStore'
import AppIcon from '@/components/ui/AppIcon.vue'
import { debounce } from '@/utils/debounce'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()
const uiStore = useUIStore()
const searchInput = ref<HTMLInputElement | null>(null)
const searchDraft = ref(taskStore.searchQuery)
const debouncedSetSearchQuery = debounce((query: string) => {
  taskStore.setSearchQuery(query)
}, 140)

const pageTitle = computed(() => (route.meta.title as string) || 'List-of-Me')

const pageDescription = computed(() => {
  const descriptions: Record<string, string> = {
    Inbox: '收集所有未整理的想法和任务',
    Today: '专注于今日需要完成的任务',
    Projects: '按项目组织和管理任务',
    ProjectDetail: '项目内任务管理',
  }
  return descriptions[route.name as string] || '高效管理你的任务'
})

const handleSearch = () => {
  debouncedSetSearchQuery(searchDraft.value)
}

const openAddTaskModal = () => {
  router.push('/tasks/new')
}

watch(
  () => uiStore.searchFocusToken,
  () => {
    searchInput.value?.focus()
    searchInput.value?.select()
  },
)

watch(
  () => taskStore.searchQuery,
  (query) => {
    if (query === searchDraft.value) return
    searchDraft.value = query
  },
)

onBeforeUnmount(() => {
  debouncedSetSearchQuery.cancel()
})
</script>
