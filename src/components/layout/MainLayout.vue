<template>
  <div class="h-screen overflow-hidden flex text-base-content bg-transparent">
    <Sidebar class="hidden md:flex" />

    <div class="flex-1 flex flex-col min-h-0">
      <Header />

      <main class="flex-1 min-h-0 p-5 md:p-7 overflow-y-auto overflow-x-hidden pb-24 md:pb-7">
        <div
          class="min-h-full rounded-[1.25rem] bg-base-100/40 backdrop-blur-xl border border-white/10 p-5 md:p-7 shadow-2xl"
        >
          <router-view />
        </div>
      </main>
    </div>

    <nav
      class="md:hidden fixed bottom-0 left-0 right-0 btm-nav btm-nav-sm bg-base-100/70 backdrop-blur-xl border-t border-white/10"
    >
      <router-link class="text-base-content/60" to="/inbox">📥<span class="btm-nav-label">收集箱</span></router-link>
      <router-link class="text-base-content/60" to="/today">📅<span class="btm-nav-label">今日</span></router-link>
      <router-link class="text-base-content/60" to="/projects">📁<span class="btm-nav-label">项目</span></router-link>
      <router-link class="text-base-content/60" to="/completed">✅<span class="btm-nav-label">完成</span></router-link>
      <router-link class="text-base-content/60" to="/settings">⚙<span class="btm-nav-label">设置</span></router-link>
    </nav>

    <Modal
      :is-open="uiStore.modal.isOpen"
      :title="modalTitle"
      :show-actions="false"
      @close="uiStore.closeModal"
    >
      <ProjectForm
        v-if="uiStore.modal.type === 'project'"
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
import { useRouter } from 'vue-router'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import Modal from '@/components/ui/Modal.vue'
import ProjectForm from '@/components/projects/ProjectForm.vue'
import ToastList from '@/components/ui/ToastList.vue'
import { useUIStore } from '@/stores/uiStore'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'
import type { Project } from '@/types/project'

const uiStore = useUIStore()
const taskStore = useTaskStore()
const projectStore = useProjectStore()
const router = useRouter()

const modalProject = computed<Project | null>(() => {
  if (uiStore.modal.type !== 'project') return null
  return uiStore.modal.data?.project || null
})

const modalTitle = computed(() => {
  if (uiStore.modal.type === 'project') return modalProject.value ? '编辑项目' : '新建项目'
  return ''
})

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
    router.push('/tasks/new')
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
