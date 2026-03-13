<template>
  <div class="task-create-view">
    <div class="mb-4 flex items-center justify-between">
      <button class="btn btn-ghost btn-sm" @click="router.back()">← 返回</button>
    </div>

    <TaskForm
      :projects="projectStore.projects"
      :default-project-id="defaultProjectId"
      mode="create"
      @submit="handleSubmit"
      @cancel="router.back()"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TaskForm from '@/components/tasks/TaskForm.vue'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'
import type { TaskCreate } from '@/types/task'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()
const projectStore = useProjectStore()

const defaultProjectId = computed(() => {
  const raw = route.query.projectId
  if (raw === undefined) return null
  const value = Array.isArray(raw) ? raw[0] : raw
  const parsed = parseInt(String(value), 10)
  return Number.isNaN(parsed) ? null : parsed
})

const forceInbox = computed(() => {
  const raw = route.query.inbox
  if (raw === undefined) return false
  const value = Array.isArray(raw) ? raw[0] : raw
  return String(value) === '1' || String(value).toLowerCase() === 'true'
})

const handleSubmit = async (data: TaskCreate) => {
  const payload = { ...data }
  if (forceInbox.value) {
    payload.project_id = null
  } else if (defaultProjectId.value !== null) {
    payload.project_id = defaultProjectId.value
  }
  await taskStore.createTask(payload)
  router.back()
}

onMounted(() => {
  projectStore.fetchProjects()
})
</script>

<style scoped>
.task-create-view {
  width: 100%;
}
</style>
