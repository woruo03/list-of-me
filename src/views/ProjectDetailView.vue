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
      <div class="flex flex-col items-end gap-2">
        <div class="flex items-center gap-2 flex-wrap justify-end">
          <button class="btn btn-ghost" @click="toggleFilter">
            {{ showFilters ? '隐藏筛选' : '筛选' }}
          </button>
          <button class="btn btn-ghost" @click="toggleViewMode">
            {{ viewMode === 'list' ? '看板视图' : '列表视图' }}
          </button>
          <button class="btn btn-ghost" @click="toggleSelectionMode">
            {{ selectionMode ? '取消选择' : '选择' }}
          </button>
        </div>
        <div v-if="selectionMode && !showFilters" class="flex items-center gap-2 w-full justify-end">
          <button class="btn btn-ghost" @click="toggleSelectAll">
            {{ allSelected ? '取消全选' : '全选' }}
          </button>
          <button class="btn btn-ghost" @click="toggleMoveMenu">移动</button>
          <button
            class="btn btn-ghost text-error"
            :disabled="taskStore.selectedCount === 0"
            @click="deleteSelected"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <div v-if="showFilters" class="mb-4 flex flex-wrap items-start gap-3">
      <div class="flex-1 min-w-[260px]">
        <TaskFilter
          :projects="projectStore.projects"
          :initial-filter="taskStore.userFilter"
          :initial-sort="taskStore.sort"
          :initial-search="taskStore.searchQuery"
          @filter="taskStore.setUserFilter"
          @search="taskStore.setSearchQuery"
          @sort="taskStore.setSort"
        />
      </div>
      <div v-if="selectionMode" class="flex items-center gap-2 flex-shrink-0">
        <button class="btn btn-ghost" @click="toggleSelectAll">
          {{ allSelected ? '取消全选' : '全选' }}
        </button>
        <button class="btn btn-ghost" @click="toggleMoveMenu">移动</button>
        <button
          class="btn btn-ghost text-error"
          :disabled="taskStore.selectedCount === 0"
          @click="deleteSelected"
        >
          删除
        </button>
      </div>
    </div>

    <div v-if="selectionMode && showMoveMenu" class="mb-4 flex items-center justify-end gap-2">
      <div class="w-56">
        <SelectMenu v-model="moveTargetId" :options="moveOptions" size="sm" />
      </div>
      <button class="btn btn-ghost" @click="confirmMove">确定</button>
    </div>

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
      :selection-mode="selectionMode"
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
import SelectMenu from '@/components/ui/SelectMenu.vue'
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
const selectionMode = ref(false)
const showMoveMenu = ref(false)
const moveTargetId = ref<number | null>(null)

const projectId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? parseInt(id, 10) : Number(id)
})

const tasks = computed(() => taskStore.filterTasks(taskStore.tasksByProjectId(projectId.value)))
const allSelected = computed(() => {
  if (tasks.value.length === 0) return false
  return tasks.value.every((task) => taskStore.isSelected(task.id))
})
const moveOptions = computed(() => [
  { label: '收集箱', value: null },
  ...projectStore.projects.map((project) => ({ label: project.name, value: project.id })),
])

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
  router.push(`/tasks/new?projectId=${projectId.value}`)
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

const toggleSelectionMode = () => {
  selectionMode.value = !selectionMode.value
  if (!selectionMode.value) taskStore.clearSelection()
  if (!selectionMode.value) showMoveMenu.value = false
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    taskStore.clearSelection()
    return
  }
  taskStore.selectAll(tasks.value.map((task) => task.id))
}

const deleteSelected = async () => {
  if (!confirm('确定要删除所选任务吗？此操作不可撤销。')) return
  await taskStore.bulkDelete(taskStore.selectedIds)
}

const toggleMoveMenu = () => {
  showMoveMenu.value = !showMoveMenu.value
}

const confirmMove = async () => {
  if (taskStore.selectedIds.length === 0) return
  await taskStore.bulkMoveToProject(taskStore.selectedIds, moveTargetId.value)
  showMoveMenu.value = false
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
