<template>
  <div class="projects-view">
    <div class="mb-4 flex justify-end">
      <button class="btn btn-primary" @click="openAddProjectModal">
        <span class="mr-2">+</span>
        新建项目
      </button>
    </div>

    <div v-if="projectStore.isLoading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="projectStore.projects.length === 0" class="text-center py-12">
      <div class="text-base-content/50 mb-4">
        <span class="text-6xl">📁</span>
      </div>
      <h3 class="text-xl font-medium mb-2">还没有项目</h3>
      <p class="text-base-content/70 mb-6">创建项目来更好地组织你的任务。</p>
      <button class="btn btn-primary" @click="openAddProjectModal">创建第一个项目</button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <ProjectCard
        v-for="project in projectStore.projects"
        :key="project.id"
        :project="project"
        :task-count="projectStats[project.id] || 0"
        @click="navigateToProject"
        @edit="openEditProjectModal"
        @delete="handleDeleteProject"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ProjectCard from '@/components/projects/ProjectCard.vue'
import type { Project } from '@/types/project'
import { useProjectStore } from '@/stores/projectStore'
import { useTaskStore } from '@/stores/taskStore'
import { useUIStore } from '@/stores/uiStore'

const router = useRouter()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const uiStore = useUIStore()

const projectStats = computed(() => {
  const stats: Record<number, number> = {}
  for (const task of taskStore.tasks) {
    if (task.project_id) {
      stats[task.project_id] = (stats[task.project_id] || 0) + 1
    }
  }
  return stats
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
