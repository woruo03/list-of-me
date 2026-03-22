<template>
  <div class="task-board">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div
        class="board-column rounded-2xl bg-base-100/40 backdrop-blur-xl border border-white/10 p-5 shadow-2xl"
        @dragover.prevent
        @drop="handleDrop(Status.Todo)"
      >
        <div class="board-header">待办</div>
        <div class="board-list">
          <TaskCard
            v-for="task in todoTasks"
            :key="task.id"
            :task="task"
            :project="getProject(task.project_id)"
            :selected="taskStore.isSelected(task.id)"
            :focused="taskStore.focusedTaskId === task.id"
            :selectable="selectionMode"
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

      <div
        class="board-column rounded-2xl bg-base-100/40 backdrop-blur-xl border border-white/10 p-5 shadow-2xl"
        @dragover.prevent
        @drop="handleDrop(Status.Doing)"
      >
        <div class="board-header">进行中</div>
      <div class="board-list">
        <TaskCard
          v-for="task in doingTasks"
          :key="task.id"
          :task="task"
          :project="getProject(task.project_id)"
          :selected="taskStore.isSelected(task.id)"
          :focused="taskStore.focusedTaskId === task.id"
          :selectable="selectionMode"
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

      <div
        class="board-column rounded-2xl bg-base-100/40 backdrop-blur-xl border border-white/10 p-5 shadow-2xl"
        @dragover.prevent
        @drop="handleDrop(Status.Done)"
      >
        <div class="board-header">已完成</div>
      <div class="board-list">
        <TaskCard
          v-for="task in doneTasks"
          :key="task.id"
          :task="task"
          :project="getProject(task.project_id)"
          :selected="taskStore.isSelected(task.id)"
          :focused="taskStore.focusedTaskId === task.id"
          :selectable="selectionMode"
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
  selectionMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectionMode: false,
})

const emit = defineEmits<{
  edit: [task: Task]
  delete: [id: number]
  'toggle-status': [id: number]
  'move-to-today': [id: number]
}>()

const taskStore = useTaskStore()
const draggingId = ref<number | null>(null)

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
</script>

<style scoped>
.task-board {
  min-height: 200px;
  position: relative;
  z-index: 0;
}

.board-header {
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.board-list {
  min-height: 120px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
