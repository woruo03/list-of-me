<template>
  <div
    class="task-filter relative z-30 rounded-2xl bg-base-100/40 backdrop-blur-xl border border-white/10 p-4 md:p-5 shadow-2xl"
    :class="{
      'rounded-none bg-transparent backdrop-blur-none border-0 p-0 shadow-none': embedded,
    }"
  >
    <div class="flex flex-col gap-3 md:flex-row md:items-start md:gap-5">
      <div class="flex flex-wrap items-center gap-4 flex-1">
        <div class="form-control min-w-[9rem]">
          <SelectMenu
            v-model="localFilter.project_id"
            :options="projectOptions"
            size="sm"
            placeholder="所有项目"
            @update:modelValue="updateFilter"
          />
        </div>

        <div class="form-control min-w-[9rem]">
          <SelectMenu
            v-model="localFilter.status"
            :options="statusOptions"
            size="sm"
            placeholder="所有状态"
            @update:modelValue="updateFilter"
          />
        </div>

        <div class="form-control min-w-[9rem]">
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
              class="input input-bordered input-sm w-56 pl-8 bg-base-100/55 border-base-content/25"
              @input="handleSearch"
            />
            <AppIcon name="search" class="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-base-content/50" />
          </div>
        </div>

        <div class="form-control">
          <button class="btn btn-outline btn-sm" @click="resetFilters">重置筛选</button>
        </div>
      </div>

      <div
        v-if="$slots.actions"
        class="flex items-center justify-end gap-2 flex-wrap md:flex-nowrap md:self-center md:ml-auto"
      >
        <slot name="actions" />
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
import AppIcon from '@/components/ui/AppIcon.vue'

interface Props {
  projects: Project[]
  initialFilter?: TaskFilter
  initialSort?: TaskSort
  initialSearch?: string
  embedded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialFilter: () => ({}),
  initialSort: 'created_desc',
  initialSearch: '',
  embedded: false,
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
  margin-bottom: 0;
}

.task-filter :deep(.btn.btn-outline),
.task-filter :deep(.btn.btn-ghost.btn-outline) {
  border-color: hsl(var(--bc) / 0.28);
  background-color: hsl(var(--b1) / 0.55);
}

.task-filter :deep(.btn.btn-outline:hover),
.task-filter :deep(.btn.btn-ghost.btn-outline:hover) {
  border-color: hsl(var(--bc) / 0.5);
}
</style>
