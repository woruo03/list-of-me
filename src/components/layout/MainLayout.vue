<template>
  <div class="min-h-screen flex text-base-content bg-base-100">
    <Sidebar class="hidden md:flex" />

    <div class="flex-1 flex flex-col">
      <Header />

      <main class="flex-1 p-6 overflow-auto pb-24 md:pb-6">
        <div class="min-h-full rounded-box bg-base-100 border border-base-300 p-6">
          <router-view />
        </div>
      </main>
    </div>

    <nav class="md:hidden fixed bottom-0 left-0 right-0 btm-nav btm-nav-sm bg-base-100 border-t border-base-300">
      <router-link class="text-base-content/60" to="/inbox">📥<span class="btm-nav-label">收集箱</span></router-link>
      <router-link class="text-base-content/60" to="/today">📅<span class="btm-nav-label">今日</span></router-link>
      <router-link class="text-base-content/60" to="/projects">📁<span class="btm-nav-label">项目</span></router-link>
      <router-link class="text-base-content/60" to="/completed">✅<span class="btm-nav-label">完成</span></router-link>
    </nav>

    <Modal
      :is-open="uiStore.modal.isOpen"
      :title="modalTitle"
      :show-actions="false"
      @close="uiStore.closeModal"
    >
      <TaskForm
        v-if="uiStore.modal.type === 'task'"
        :initial-task="modalTask"
        :projects="projectStore.projects"
        :default-project-id="uiStore.modal.data?.defaultProjectId ?? null"
        :mode="modalTask ? 'edit' : 'create'"
        @submit="handleTaskSubmit"
        @cancel="uiStore.closeModal"
      />
      <ProjectForm
        v-else-if="uiStore.modal.type === 'project'"
        :initial-project="modalProject"
        :mode="modalProject ? 'edit' : 'create'"
        @submit="handleProjectSubmit"
        @cancel="uiStore.closeModal"
      />
    </Modal>

    <ToastList />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import Modal from '@/components/ui/Modal.vue'
import TaskForm from '@/components/tasks/TaskForm.vue'
import ProjectForm from '@/components/projects/ProjectForm.vue'
import ToastList from '@/components/ui/ToastList.vue'
import { useUIStore } from '@/stores/uiStore'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'
import type { Task, TaskCreate, TaskUpdate } from '@/types/task'
import type { Project } from '@/types/project'

const uiStore = useUIStore()
const taskStore = useTaskStore()
const projectStore = useProjectStore()

const modalTask = computed<Task | null>(() => {
  if (uiStore.modal.type !== 'task') return null
  return uiStore.modal.data?.task || null
})

const modalProject = computed<Project | null>(() => {
  if (uiStore.modal.type !== 'project') return null
  return uiStore.modal.data?.project || null
})

const modalTitle = computed(() => {
  if (uiStore.modal.type === 'task') return modalTask.value ? '编辑任务' : '添加任务'
  if (uiStore.modal.type === 'project') return modalProject.value ? '编辑项目' : '新建项目'
  return ''
})

const handleTaskSubmit = async (data: TaskCreate | TaskUpdate) => {
  const payload = { ...data } as TaskCreate
  const modalData = uiStore.modal.data || {}

  if (uiStore.modal.type !== 'task') return

  if (modalData.forceInbox) {
    payload.project_id = null
  }

  if (modalTask.value) {
    await taskStore.updateTask(modalTask.value.id, payload)
  } else {
    await taskStore.createTask(payload)
  }

  uiStore.closeModal()
}

const handleProjectSubmit = async (data: { name: string }) => {
  if (uiStore.modal.type !== 'project') return

  if (modalProject.value) {
    await projectStore.updateProject(modalProject.value.id, data.name)
  } else {
    await projectStore.createProject(data.name)
  }

  uiStore.closeModal()
}

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

const handleKeydown = (event: KeyboardEvent) => {
  if (isEditableTarget(event.target)) return

  const key = event.key.toLowerCase()
  const meta = event.metaKey || event.ctrlKey

  if (meta && key === 'n') {
    event.preventDefault()
    uiStore.openModal('task', { mode: 'create' })
    return
  }

  if (meta && key === 'f') {
    event.preventDefault()
    uiStore.requestSearchFocus()
    return
  }

  if (event.key === ' ') {
    event.preventDefault()
    const targetId = taskStore.focusedTaskId || taskStore.selectedIds[0]
    if (targetId) taskStore.toggleTaskStatus(targetId)
    return
  }

  if (event.key === 'Delete') {
    if (taskStore.selectedIds.length === 0) return
    if (!confirm('确定要删除所选任务吗？此操作不可撤销。')) return
    taskStore.bulkDelete(taskStore.selectedIds)
  }
}

onMounted(() => {
  uiStore.hydrateFromStorage()
  projectStore.fetchProjects()
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* 主布局样式 */
</style>
