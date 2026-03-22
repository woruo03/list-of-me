<template>
  <div class="projects-view">
    <div
      class="mb-5 flex flex-col items-end gap-3 rounded-2xl bg-base-100/35 backdrop-blur-xl border border-white/10 p-4 shadow-2xl"
    >
      <div class="flex items-center justify-end gap-2 flex-wrap">
        <button
          class="btn btn-ghost btn-outline"
          @click="toggleSelectionMode"
        >
          {{ selectionMode ? '取消选择' : '选择' }}
        </button>
        <button
          class="btn btn-primary btn-outline shadow-lg"
          @click="openAddProjectModal"
        >
          <AppIcon name="plus" class="mr-2 h-4 w-4" />
          新建项目
        </button>
      </div>
      <div
        v-if="selectionMode"
        class="flex items-center justify-end gap-2 w-full"
      >
        <button
          class="btn btn-ghost btn-outline"
          @click="toggleSelectAll"
        >
          {{ allSelected ? '取消全选' : '全选' }}
        </button>
        <button
          class="btn btn-outline btn-error"
          :disabled="selectedIds.length === 0"
          @click="deleteSelected"
        >
          删除
        </button>
      </div>
    </div>

    <div
      v-if="projectStore.isLoading"
      class="flex justify-center py-12"
    >
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div
      v-else-if="projectStore.projects.length === 0"
      class="text-center py-12"
    >
      <div
        class="card card-bordered bg-base-100/40 backdrop-blur-xl border border-white/10 shadow-2xl mx-auto max-w-md p-8"
      >
        <div class="text-base-content/50 mb-4">
          <AppIcon name="folder" class="h-14 w-14" />
        </div>
        <h3 class="text-xl font-medium mb-2">还没有项目</h3>
        <p class="text-base-content/70 mb-6">创建项目来更好地组织你的任务。</p>
        <button
          class="btn btn-primary btn-outline"
          @click="openAddProjectModal"
        >
          创建第一个项目
        </button>
      </div>
    </div>

    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <ProjectCard
        v-for="project in projectStore.projects"
        :key="project.id"
        :project="project"
        :task-count="projectStats[project.id] || 0"
        :selectable="selectionMode"
        :selected="selectedIds.includes(project.id)"
        @click="navigateToProject"
        @select="toggleSelect"
        @edit="openEditProjectModal"
        @delete="handleDeleteProject"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ProjectCard from '@/components/projects/ProjectCard.vue'
import type { Project } from '@/types/project'
import { useProjectStore } from '@/stores/projectStore'
import { useTaskStore } from '@/stores/taskStore'
import { useUIStore } from '@/stores/uiStore'
import AppIcon from '@/components/ui/AppIcon.vue'

const router = useRouter()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const uiStore = useUIStore()
const selectionMode = ref(false)
const selectedIds = ref<number[]>([])

const projectStats = computed(() => {
  const stats: Record<number, number> = {}
  for (const task of taskStore.tasks) {
    if (task.project_id) {
      stats[task.project_id] = (stats[task.project_id] || 0) + 1
    }
  }
  return stats
})

const allSelected = computed(() => {
  if (projectStore.projects.length === 0) return false
  return projectStore.projects.every((project) => selectedIds.value.includes(project.id))
})

const navigateToProject = (project: Project) => {
  router.push(`/projects/${project.id}`)
}

const openAddProjectModal = () => {
  uiStore.openModal('project', { mode: 'create' })
}

const openEditProjectModal = (project: Project) => {
  uiStore.openModal('project', { mode: 'edit', project })
}

const handleDeleteProject = async (projectId: number) => {
  await projectStore.deleteProject(projectId)
}

const toggleSelectionMode = () => {
  selectionMode.value = !selectionMode.value
  if (!selectionMode.value) selectedIds.value = []
}

const toggleSelect = (projectId: number) => {
  if (selectedIds.value.includes(projectId)) {
    selectedIds.value = selectedIds.value.filter((id) => id !== projectId)
  } else {
    selectedIds.value = [...selectedIds.value, projectId]
  }
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedIds.value = []
    return
  }
  selectedIds.value = projectStore.projects.map((project) => project.id)
}

const deleteSelected = async () => {
  if (!confirm('确定要删除所选项目吗？此操作不可撤销。')) return
  for (const id of selectedIds.value) {
    await projectStore.deleteProject(id)
  }
  selectedIds.value = []
}

onMounted(() => {
  projectStore.fetchProjects()
  taskStore.fetchAll()
})
</script>

<style scoped>
.projects-view {
  width: 100%;
}
</style>
