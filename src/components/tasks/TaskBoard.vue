<template>
  <div class="task-board">
    <div v-if="taskStore.selectedCount > 0" class="mb-4">
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

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="board-column" @dragover.prevent @drop="handleDrop(Status.Todo)">
        <div class="board-header">待办</div>
        <div class="board-list">
        <TaskCard
          v-for="task in todoTasks"
          :key="task.id"
          :task="task"
          :project="getProject(task.project_id)"
          :selected="taskStore.isSelected(task.id)"
          :focused="taskStore.focusedTaskId === task.id"
          :draggable="true"
          @dragstart="handleDragStart"
          @dragend="handleDragEnd"
          @edit="emit('edit', task)"
          @delete="emit('delete', task.id)"
          @toggle-status="emit('toggle-status', task.id)"
          @move-to-today="emit('move-to-today', task.id)"
          @select="taskStore.toggleSelect"
          @focus="taskStore.setFocusedTask"
        />
      </div>
    </div>

      <div class="board-column" @dragover.prevent @drop="handleDrop(Status.Doing)">
        <div class="board-header">进行中</div>
      <div class="board-list">
        <TaskCard
          v-for="task in doingTasks"
          :key="task.id"
          :task="task"
          :project="getProject(task.project_id)"
          :selected="taskStore.isSelected(task.id)"
          :focused="taskStore.focusedTaskId === task.id"
          :draggable="true"
          @dragstart="handleDragStart"
          @dragend="handleDragEnd"
          @edit="emit('edit', task)"
          @delete="emit('delete', task.id)"
          @toggle-status="emit('toggle-status', task.id)"
          @move-to-today="emit('move-to-today', task.id)"
          @select="taskStore.toggleSelect"
          @focus="taskStore.setFocusedTask"
        />
      </div>
    </div>

      <div class="board-column" @dragover.prevent @drop="handleDrop(Status.Done)">
        <div class="board-header">已完成</div>
      <div class="board-list">
        <TaskCard
          v-for="task in doneTasks"
          :key="task.id"
          :task="task"
          :project="getProject(task.project_id)"
          :selected="taskStore.isSelected(task.id)"
          :focused="taskStore.focusedTaskId === task.id"
          :draggable="true"
          @dragstart="handleDragStart"
          @dragend="handleDragEnd"
          @edit="emit('edit', task)"
          @delete="emit('delete', task.id)"
          @toggle-status="emit('toggle-status', task.id)"
          @move-to-today="emit('move-to-today', task.id)"
          @select="taskStore.toggleSelect"
          @focus="taskStore.setFocusedTask"
        />
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import TaskCard from './TaskCard.vue'
import type { Task } from '@/types/task'
import { Status } from '@/types/task'
import type { Project } from '@/types/project'
import { useTaskStore } from '@/stores/taskStore'

interface Props {
  tasks: Task[]
  projects: Project[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [task: Task]
  delete: [id: number]
  'toggle-status': [id: number]
  'move-to-today': [id: number]
}>()

const taskStore = useTaskStore()
const draggingId = ref<number | null>(null)
const bulkProjectId = ref<number | null>(null)

const todoTasks = computed(() => props.tasks.filter((t) => t.status === Status.Todo))
const doingTasks = computed(() => props.tasks.filter((t) => t.status === Status.Doing))
const doneTasks = computed(() => props.tasks.filter((t) => t.status === Status.Done))

const getProject = (projectId: number | null) => {
  if (!projectId) return null
  return props.projects.find((p) => p.id === projectId) || null
}

const handleDragStart = (id: number) => {
  draggingId.value = id
}

const handleDragEnd = () => {
  draggingId.value = null
}

const handleDrop = (status: Status) => async () => {
  if (!draggingId.value) return
  await taskStore.updateTask(draggingId.value, { status }, { optimistic: true })
  draggingId.value = null
}

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
.task-board {
  min-height: 200px;
}

.board-column {
  background: hsl(var(--b1));
  border: 1px solid hsl(var(--b3));
  border-radius: 12px;
  padding: 16px;
}

.board-header {
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.board-list {
  min-height: 120px;
}
</style>
