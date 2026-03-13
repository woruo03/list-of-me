<template>
  <div class="project-detail-view">
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <button class="btn btn-ghost btn-sm" @click="router.back()">← 返回</button>
            <h1 class="text-3xl font-bold tracking-tight">{{ project?.name || '加载中...' }}</h1>
            <span class="badge badge-primary badge-outline">项目</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="badge badge-primary badge-outline">{{ tasks.length }} 个任务</span>
          <button class="btn btn-primary shadow-md" @click="openAddTaskModal">
            <span class="mr-2">+</span>
            添加任务
          </button>
          <button class="btn btn-ghost" @click="openEditProjectModal">编辑项目</button>
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
  uiStore.openModal('task', { mode: 'edit', task, defaultProjectId: projectId.value })
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
  max-width: 800px;
  margin: 0 auto;
}
</style>
