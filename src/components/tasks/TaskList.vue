<template>
  <div class="task-list">
    <!-- 加载状态 -->
    <div
      v-if="isLoading"
      class="flex justify-center py-12"
    >
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- 空状态 -->
    <div
      v-else-if="tasks.length === 0"
      class="text-center py-12"
    >
      <div class="text-base-content/50 mb-4">
        <span class="text-6xl">📋</span>
      </div>
      <h3 class="text-xl font-medium mb-2">{{ emptyTitle }}</h3>
      <p class="text-base-content/70 mb-6">{{ emptyDescription }}</p>
      <button
        v-if="showAddButton"
        class="btn btn-primary"
        @click="emit('add')"
      >
        添加任务
      </button>
    </div>

    <!-- 任务列表 -->
    <div
      v-else
      class="space-y-4"
    >
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :project="getProject(task.project_id)"
        @edit="emit('edit', task)"
        @delete="emit('delete', task.id)"
        @toggle-status="emit('toggle-status', task.id)"
        @move-to-today="emit('move-to-today', task.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TaskCard from './TaskCard.vue'
import type { Task, Project } from '@/types/task'

interface Props {
  tasks: Task[]
  projects: Project[]
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  showAddButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  emptyTitle: '没有任务',
  emptyDescription: '这里还没有任何任务',
  showAddButton: true,
})

const emit = defineEmits<{
  add: []
  edit: [task: Task]
  delete: [id: number]
  'toggle-status': [id: number]
  'move-to-today': [id: number]
}>()

const getProject = (projectId: number | null) => {
  if (!projectId) return null
  return props.projects.find((p) => p.id === projectId) || null
}
</script>

<style scoped>
.task-list {
  min-height: 200px;
}
</style>
