<template>
  <div class="task-filter">
    <div class="flex flex-wrap gap-4 items-center">
      <div class="form-control">
        <SelectMenu
          v-model="localFilter.project_id"
          :options="projectOptions"
          size="sm"
          placeholder="所有项目"
          @update:modelValue="updateFilter"
        />
      </div>

      <div class="form-control">
        <SelectMenu
          v-model="localFilter.status"
          :options="statusOptions"
          size="sm"
          placeholder="所有状态"
          @update:modelValue="updateFilter"
        />
      </div>

      <div class="form-control">
        <SelectMenu
          v-model="localSort"
          :options="sortOptions"
          size="sm"
          placeholder="排序"
          @update:modelValue="updateSort"
        />
      </div>

      <div class="form-control">
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
import { computed, ref, watch } from 'vue'
import type { TaskFilter } from '@/types/task'
import type { Project } from '@/types/project'
import type { TaskSort } from '@/stores/taskStore'
import SelectMenu from '@/components/ui/SelectMenu.vue'

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

const projectOptions = computed(() => {
  return [
    { label: '所有项目', value: undefined },
    { label: '收集箱', value: null },
    ...props.projects.map((project) => ({ label: project.name, value: project.id })),
  ]
})

const statusOptions = [
  { label: '所有状态', value: undefined },
  { label: '待办', value: 'todo' },
  { label: '进行中', value: 'doing' },
  { label: '已完成', value: 'done' },
]

const sortOptions = [
  { label: '最新创建', value: 'created_desc' },
  { label: '最早创建', value: 'created_asc' },
  { label: '截止时间最早', value: 'due_asc' },
  { label: '截止时间最晚', value: 'due_desc' },
  { label: '标题 A-Z', value: 'title_asc' },
  { label: '标题 Z-A', value: 'title_desc' },
]

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
