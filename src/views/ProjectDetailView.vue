<template>
  <div class="project-detail-view">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <button class="btn btn-ghost btn-sm" @click="router.back()">← 返回</button>
        <button class="btn btn-primary" @click="openAddTaskModal">
          <span class="mr-2">+</span>
          添加任务
        </button>
        <button class="btn btn-ghost" @click="openEditProjectModal">编辑项目</button>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn btn-ghost" @click="toggleFilter">
          {{ showFilters ? '隐藏筛选' : '筛选' }}
        </button>
        <button class="btn btn-ghost" @click="toggleViewMode">
          {{ viewMode === 'list' ? '看板视图' : '列表视图' }}
        </button>
      </div>
    </div>

    <TaskFilter
      v-if="showFilters"
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
      empty-title="项目中没有任务"
      empty-description="为这个项目添加第一个任务吧。"
      @add="openAddTaskModal"
      @edit="openEditTaskModal"
      @delete="handleDeleteTask"
      @toggle-status="taskStore.toggleTaskStatus"
      @move-to-today="taskStore.moveToToday"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TaskList from '@/components/tasks/TaskList.vue'
import TaskFilter from '@/components/tasks/TaskFilter.vue'
import TaskBoard from '@/components/tasks/TaskBoard.vue'
import type { Task } from '@/types/task'
import type { Project } from '@/types/project'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()
const projectStore = useProjectStore()
const uiStore = useUIStore()

const project = ref<Project | null>(null)
const viewMode = ref<'list' | 'board'>('list')
const showFilters = ref(false)

const projectId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? parseInt(id, 10) : Number(id)
})

const tasks = computed(() => taskStore.filterTasks(taskStore.tasksByProjectId(projectId.value)))

const fetchProject = async () => {
  try {
    project.value = await projectStore.getProject(projectId.value)
  } catch (error) {
    console.error('Failed to fetch project:', error)
    router.push('/projects')
  }
}

const fetchProjectTasks = async () => {
  await taskStore.fetchAll({ project_id: projectId.value })
}

const openAddTaskModal = () => {
  uiStore.openModal('task', { mode: 'create', defaultProjectId: projectId.value })
}

const openEditTaskModal = (task: Task) => {
  router.push(`/tasks/${task.id}/edit`)
}

const openEditProjectModal = () => {
  if (!project.value) return
  uiStore.openModal('project', { mode: 'edit', project: project.value })
}

const handleDeleteTask = async (taskId: number) => {
  await taskStore.deleteTask(taskId)
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'list' ? 'board' : 'list'
}

const toggleFilter = () => {
  showFilters.value = !showFilters.value
}

onMounted(() => {
  taskStore.setUserFilter({})
  taskStore.clearSelection()
  projectStore.fetchProjects()
  fetchProject()
  fetchProjectTasks()
})

watch(
  () => route.params.id,
  () => {
    taskStore.setUserFilter({})
    taskStore.clearSelection()
    fetchProject()
    fetchProjectTasks()
  },
)
</script>

<style scoped>
.project-detail-view {
  width: 100%;
}
</style>
