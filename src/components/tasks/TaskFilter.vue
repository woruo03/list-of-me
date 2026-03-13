<template>
  <div class="task-filter">
    <div class="flex flex-wrap gap-4 items-center">
      <div class="form-control">
        <label class="label">
          <span class="label-text">项目</span>
        </label>
        <select v-model="localFilter.project_id" class="select select-bordered select-sm" @change="updateFilter">
          <option :value="undefined">所有项目</option>
          <option :value="null">收集箱</option>
          <option v-for="project in projects" :key="project.id" :value="project.id">
            {{ project.name }}
          </option>
        </select>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">状态</span>
        </label>
        <select v-model="localFilter.status" class="select select-bordered select-sm" @change="updateFilter">
          <option :value="undefined">所有状态</option>
          <option value="todo">待办</option>
          <option value="doing">进行中</option>
          <option value="done">已完成</option>
        </select>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">排序</span>
        </label>
        <select v-model="localSort" class="select select-bordered select-sm" @change="updateSort">
          <option value="created_desc">最新创建</option>
          <option value="created_asc">最早创建</option>
          <option value="due_asc">截止时间最早</option>
          <option value="due_desc">截止时间最晚</option>
          <option value="title_asc">标题 A-Z</option>
          <option value="title_desc">标题 Z-A</option>
        </select>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">搜索</span>
        </label>
        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="搜索任务..."
            class="input input-bordered input-sm w-48 pl-8"
            @input="handleSearch"
          />
          <span class="absolute left-2 top-1/2 transform -translate-y-1/2 text-base-content/50">🔍</span>
        </div>
      </div>

      <div class="form-control self-end">
        <button class="btn btn-ghost btn-sm" @click="resetFilters">重置筛选</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TaskFilter } from '@/types/task'
import type { Project } from '@/types/project'
import type { TaskSort } from '@/stores/taskStore'

interface Props {
  projects: Project[]
  initialFilter?: TaskFilter
  initialSort?: TaskSort
  initialSearch?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialFilter: () => ({}),
  initialSort: 'created_desc',
  initialSearch: '',
})

const emit = defineEmits<{
  filter: [filter: TaskFilter]
  search: [query: string]
  sort: [sort: TaskSort]
}>()

const localFilter = ref<TaskFilter>({ ...props.initialFilter })
const localSort = ref<TaskSort>(props.initialSort)
const searchQuery = ref(props.initialSearch)

const updateFilter = () => {
  emit('filter', { ...localFilter.value })
}

const updateSort = () => {
  emit('sort', localSort.value)
}

const handleSearch = () => {
  emit('search', searchQuery.value)
}

const resetFilters = () => {
  localFilter.value = {}
  searchQuery.value = ''
  localSort.value = 'created_desc'
  emit('filter', {})
  emit('search', '')
  emit('sort', localSort.value)
}

watch(
  () => props.initialFilter,
  (newFilter) => {
    localFilter.value = { ...newFilter }
  },
  { deep: true },
)

watch(
  () => props.initialSort,
  (newSort) => {
    if (newSort) localSort.value = newSort
  },
)

watch(
  () => props.initialSearch,
  (newSearch) => {
    searchQuery.value = newSearch || ''
  },
)
</script>

<style scoped>
.task-filter {
  background: hsl(var(--b1));
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid hsl(var(--b3));
}
</style>
