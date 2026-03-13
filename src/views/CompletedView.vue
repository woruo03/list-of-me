<template>
  <div class="completed-view">
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">已完成</h1>
          <p class="text-base-content/70 mt-2">查看已完成的任务历史。这是你的成就记录，也是复盘的好地方。</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="badge badge-primary badge-outline">{{ tasks.length }} 个任务</span>
          <button class="btn btn-ghost" @click="clearCompleted" :disabled="tasks.length === 0">清空已完成</button>
        </div>
      </div>
    </div>

    <TaskList
      :tasks="tasks"
      :projects="projectStore.projects"
      :is-loading="taskStore.isLoading"
      empty-title="还没有完成的任务"
      empty-description="开始完成任务，这里会记录你的成就。"
      :show-add-button="false"
      @edit="openEditTaskModal"
      @delete="handleDeleteTask"
      @toggle-status="restoreTask"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import TaskList from '@/components/tasks/TaskList.vue'
import type { Task } from '@/types/task'
import { Status } from '@/types/task'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'

const taskStore = useTaskStore()
const projectStore = useProjectStore()
const uiStore = useUIStore()

const tasks = computed(() => taskStore.filterTasks(taskStore.completedTasks))

const openEditTaskModal = (task: Task) => {
  uiStore.openModal('task', { mode: 'edit', task })
}

const handleDeleteTask = async (taskId: number) => {
  await taskStore.deleteTask(taskId)
}

const restoreTask = async (taskId: number) => {
  await taskStore.updateTask(taskId, { status: Status.Todo })
}

const clearCompleted = async () => {
  if (!confirm('确定要清空所有已完成的任务吗？此操作不可撤销。')) return
  const ids = tasks.value.map((task) => task.id)
  await taskStore.bulkDelete(ids)
}

onMounted(() => {
  taskStore.setUserFilter({})
  taskStore.clearSelection()
  taskStore.fetchAll({ status: Status.Done })
  projectStore.fetchProjects()
})
</script>

<style scoped>
.completed-view {
  max-width: 800px;
  margin: 0 auto;
}
</style>
