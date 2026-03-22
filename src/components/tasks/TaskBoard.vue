<template>
  <div class="task-board">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div
        class="board-column board-column-todo rounded-2xl bg-base-100/42 backdrop-blur-xl border border-white/10 p-4 md:p-5 shadow-2xl"
        @dragover.prevent
        @drop="handleDrop(Status.Todo)"
      >
        <div class="board-header">
          <div class="inline-flex items-center gap-2">
            <span class="board-dot bg-primary/80"></span>
            <span>待办</span>
          </div>
          <span class="badge badge-primary badge-outline badge-sm">{{ todoTasks.length }}</span>
        </div>
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
          <p v-if="todoTasks.length === 0" class="board-empty">暂无待办任务</p>
        </div>
      </div>

      <div
        class="board-column board-column-doing rounded-2xl bg-base-100/42 backdrop-blur-xl border border-white/10 p-4 md:p-5 shadow-2xl"
        @dragover.prevent
        @drop="handleDrop(Status.Doing)"
      >
        <div class="board-header">
          <div class="inline-flex items-center gap-2">
            <span class="board-dot bg-warning/80"></span>
            <span>进行中</span>
          </div>
          <span class="badge badge-warning badge-outline badge-sm">{{ doingTasks.length }}</span>
        </div>
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
          <p v-if="doingTasks.length === 0" class="board-empty">开始推进第一个任务</p>
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
  justify-content: space-between;
  font-weight: 600;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid hsl(var(--bc) / 0.08);
  display: flex;
  align-items: center;
  gap: 8px;
}

.board-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
}

.board-list {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.board-empty {
  border: 1px dashed hsl(var(--bc) / 0.2);
  background: hsl(var(--b1) / 0.25);
  border-radius: 0.9rem;
  color: hsl(var(--bc) / 0.58);
  text-align: center;
  font-size: 0.82rem;
  line-height: 1.4;
  padding: 1rem 0.75rem;
}
</style>
