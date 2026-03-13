<template>
  <div class="task-list">
    <div v-if="isLoading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

      <div v-else-if="tasks.length === 0" class="text-center py-12">
        <div class="card card-bordered bg-base-100 mx-auto max-w-md p-8 shadow-sm">
        <div class="text-base-content/50 mb-4">
          <span class="text-6xl">📋</span>
        </div>
        <h3 class="text-xl font-medium mb-2">{{ emptyTitle }}</h3>
        <p class="text-base-content/70 mb-6">{{ emptyDescription }}</p>
        <button v-if="showAddButton" class="btn btn-primary" @click="emit('add')">
          添加任务
        </button>
      </div>
    </div>

    <div v-else>
      <div v-if="showBulkActions && enableSelection && taskStore.selectedCount > 0" class="mb-4">
        <div class="alert bg-base-100 border border-base-300 shadow-sm">
          <div class="flex flex-wrap items-center gap-3">
            <span>已选择 {{ taskStore.selectedCount }} 项</span>
            <button class="btn btn-xs btn-success" @click="markSelectedDone">标记完成</button>
            <button class="btn btn-xs btn-info" @click="moveSelectedToToday">移至今日</button>
            <select v-model="bulkProjectId" class="select select-bordered select-xs">
              <option :value="null">收集箱</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
            <button class="btn btn-xs" @click="moveSelectedToProject">移动</button>
            <button class="btn btn-xs btn-error" @click="deleteSelected">删除</button>
            <button class="btn btn-xs btn-ghost" @click="taskStore.clearSelection()">清除选择</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <TaskCard
          v-for="task in visibleTasks"
          :key="task.id"
          :task="task"
          :project="getProject(task.project_id)"
          :selected="taskStore.isSelected(task.id)"
          :focused="taskStore.focusedTaskId === task.id"
          :selectable="enableSelection"
          @edit="emit('edit', task)"
          @delete="emit('delete', task.id)"
          @toggle-status="emit('toggle-status', task.id)"
          @move-to-today="emit('move-to-today', task.id)"
          @select="taskStore.toggleSelect"
          @focus="taskStore.setFocusedTask"
        />
      </div>

      <div v-if="visibleTasks.length < tasks.length" class="flex justify-center mt-6">
        <button class="btn btn-outline btn-sm" @click="loadMore">加载更多</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import TaskCard from './TaskCard.vue'
import type { Task } from '@/types/task'
import type { Project } from '@/types/project'
import { Status } from '@/types/task'
import { useTaskStore } from '@/stores/taskStore'

interface Props {
  tasks: Task[]
  projects: Project[]
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  showAddButton?: boolean
  showBulkActions?: boolean
  enableSelection?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  emptyTitle: '没有任务',
  emptyDescription: '这里还没有任何任务',
  showAddButton: true,
  showBulkActions: true,
  enableSelection: true,
})

const emit = defineEmits<{
  add: []
  edit: [task: Task]
  delete: [id: number]
  'toggle-status': [id: number]
  'move-to-today': [id: number]
}>()

const taskStore = useTaskStore()
const bulkProjectId = ref<number | null>(null)
const visibleCount = ref(20)

const visibleTasks = computed(() => props.tasks.slice(0, visibleCount.value))

const getProject = (projectId: number | null) => {
  if (!projectId) return null
  return props.projects.find((p) => p.id === projectId) || null
}

const loadMore = () => {
  visibleCount.value = Math.min(props.tasks.length, visibleCount.value + 20)
}

watch(
  () => props.tasks,
  () => {
    visibleCount.value = 20
  },
)

const markSelectedDone = async () => {
  await taskStore.bulkUpdateStatus(taskStore.selectedIds, Status.Done)
}

const moveSelectedToToday = async () => {
  await taskStore.bulkMoveToToday(taskStore.selectedIds)
}

const moveSelectedToProject = async () => {
  await taskStore.bulkMoveToProject(taskStore.selectedIds, bulkProjectId.value)
}

const deleteSelected = async () => {
  if (!confirm('确定要删除所选任务吗？此操作不可撤销。')) return
  await taskStore.bulkDelete(taskStore.selectedIds)
}
</script>

<style scoped>
.task-list {
  min-height: 200px;
}
</style>
