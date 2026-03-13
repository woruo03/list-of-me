<template>
  <div class="task-filter">
    <div class="flex flex-wrap gap-4 items-center">
      <!-- 项目筛选 -->
      <div class="form-control">
        <label class="label">
          <span class="label-text">项目</span>
        </label>
        <select
          v-model="localFilter.project_id"
          class="select select-bordered select-sm"
          @change="updateFilter"
        >
          <option :value="undefined">所有项目</option>
          <option :value="null">收集箱</option>
          <option
            v-for="project in projects"
            :key="project.id"
            :value="project.id"
          >
            {{ project.name }}
          </option>
        </select>
      </div>

      <!-- 状态筛选 -->
      <div class="form-control">
        <label class="label">
          <span class="label-text">状态</span>
        </label>
        <select
          v-model="localFilter.status"
          class="select select-bordered select-sm"
          @change="updateFilter"
        >
          <option :value="undefined">所有状态</option>
          <option value="todo">待办</option>
          <option value="doing">进行中</option>
          <option value="done">已完成</option>
        </select>
      </div>

      <!-- 排序 -->
      <div class="form-control">
        <label class="label">
          <span class="label-text">排序</span>
        </label>
        <select
          v-model="localSort"
          class="select select-bordered select-sm"
          @change="updateSort"
        >
          <option value="created_desc">最新创建</option>
          <option value="created_asc">最早创建</option>
          <option value="due_asc">截止时间最早</option>
          <option value="due_desc">截止时间最晚</option>
          <option value="title_asc">标题 A-Z</option>
          <option value="title_desc">标题 Z-A</option>
        </select>
      </div>

      <!-- 搜索 -->
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
          <span class="absolute left-2 top-1/2 transform -translate-y-1/2 text-base-content/50">
            🔍
          </span>
        </div>
      </div>

      <!-- 重置按钮 -->
      <div class="form-control self-end">
        <button
          class="btn btn-ghost btn-sm"
          @click="resetFilters"
        >
          重置筛选
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TaskFilter } from '@/types/task'
import type { Project } from '@/types/task'

interface Props {
  projects: Project[]
  initialFilter?: TaskFilter
}

const props = withDefaults(defineProps<Props>(), {
  initialFilter: () => ({}),
})

const emit = defineEmits<{
  filter: [filter: TaskFilter]
  search: [query: string]
}>()

const localFilter = ref<TaskFilter>({ ...props.initialFilter })
const localSort = ref('created_desc')
const searchQuery = ref('')

const updateFilter = () => {
  emit('filter', { ...localFilter.value })
}

const updateSort = () => {
  // TODO: 实现排序逻辑
  console.log('排序:', localSort.value)
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
}

// 监听初始筛选条件变化
watch(
  () => props.initialFilter,
  (newFilter) => {
    localFilter.value = { ...newFilter }
  },
  { deep: true },
)
</script>

<style scoped>
.task-filter {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}
</style>
