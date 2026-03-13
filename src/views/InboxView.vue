<template>
  <div class="inbox-view">
    <TaskList
      :tasks="tasks"
      :projects="projectStore.projects"
      :is-loading="taskStore.isLoading"
      empty-title="收集箱是空的"
      empty-description="还没有任何任务添加到收集箱。点击“添加任务”开始。"
      @add="openAddTaskModal"
      @edit="openEditTaskModal"
      @delete="handleDeleteTask"
      @toggle-status="taskStore.toggleTaskStatus"
      @move-to-today="taskStore.moveToToday"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import TaskList from '@/components/tasks/TaskList.vue'
import type { Task } from '@/types/task'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'

const taskStore = useTaskStore()
const projectStore = useProjectStore()
const uiStore = useUIStore()

const tasks = computed(() => taskStore.filterTasks(taskStore.inboxTasks))

const openAddTaskModal = () => {
  uiStore.openModal('task', { mode: 'create', forceInbox: true })
}

const openEditTaskModal = (task: Task) => {
  uiStore.openModal('task', { mode: 'edit', task })
}

const handleDeleteTask = async (taskId: number) => {
  await taskStore.deleteTask(taskId)
}

onMounted(() => {
  taskStore.setUserFilter({})
  taskStore.clearSelection()
  taskStore.fetchAll({ project_id: null })
  projectStore.fetchProjects()
})
</script>

<style scoped>
.inbox-view {
  width: 100%;
}
</style>
