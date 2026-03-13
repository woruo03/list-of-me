<template>
  <div class="inbox-view">
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold">收集箱</h1>
          <p class="text-base-content/70 mt-2">
            收集所有未整理的想法和任务。将它们移动到今日或指定项目以开始行动。
          </p>
        </div>
        <div class="flex items-center gap-3">
          <span class="badge badge-primary badge-lg">{{ tasks.length }} 个任务</span>
          <button class="btn btn-primary" @click="openAddTaskModal">
            <span class="mr-2">+</span>
            添加任务
          </button>
        </div>
      </div>
    </div>

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
  max-width: 800px;
  margin: 0 auto;
}
</style>
