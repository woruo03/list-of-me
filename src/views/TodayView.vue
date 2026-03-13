<template>
  <div class="today-view">
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">今日</h1>
          <p class="text-base-content/70 mt-2">
            专注于今日需要完成的任务。截止时间为今天的任务会显示在这里。
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button class="btn btn-ghost" @click="toggleViewMode">
            {{ viewMode === 'list' ? '看板视图' : '列表视图' }}
          </button>
        </div>
      </div>
    </div>

    <TaskFilter
      :projects="projectStore.projects"
      :initial-filter="taskStore.userFilter"
      :initial-sort="taskStore.sort"
      :initial-search="taskStore.searchQuery"
      @filter="taskStore.setUserFilter"
      @search="taskStore.setSearchQuery"
      @sort="taskStore.setSort"
    />

    <TaskBoard
      v-if="viewMode === 'board'"
      :tasks="tasks"
      :projects="projectStore.projects"
      @edit="openEditTaskModal"
      @delete="handleDeleteTask"
      @toggle-status="taskStore.toggleTaskStatus"
      @move-to-today="taskStore.moveToToday"
    />

    <TaskList
      v-else
      :tasks="tasks"
      :projects="projectStore.projects"
      :is-loading="taskStore.isLoading"
      empty-title="今日没有任务"
      empty-description="今天可以放松一下，或者添加一些新任务。"
      @add="openAddTaskModal"
      @edit="openEditTaskModal"
      @delete="handleDeleteTask"
      @toggle-status="taskStore.toggleTaskStatus"
      @move-to-today="taskStore.moveToToday"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import TaskList from '@/components/tasks/TaskList.vue'
import TaskFilter from '@/components/tasks/TaskFilter.vue'
import TaskBoard from '@/components/tasks/TaskBoard.vue'
import type { Task } from '@/types/task'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'

const taskStore = useTaskStore()
const projectStore = useProjectStore()
const uiStore = useUIStore()
const viewMode = ref<'list' | 'board'>('list')

const tasks = computed(() => taskStore.filterTasks(taskStore.todayTasks))

const openAddTaskModal = () => {
  uiStore.openModal('task', { mode: 'create' })
}

const openEditTaskModal = (task: Task) => {
  uiStore.openModal('task', { mode: 'edit', task })
}

const handleDeleteTask = async (taskId: number) => {
  await taskStore.deleteTask(taskId)
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'list' ? 'board' : 'list'
}

onMounted(() => {
  taskStore.setUserFilter({})
  taskStore.clearSelection()
  taskStore.fetchAll()
  projectStore.fetchProjects()
})
</script>

<style scoped>
.today-view {
  width: 100%;
}
</style>
