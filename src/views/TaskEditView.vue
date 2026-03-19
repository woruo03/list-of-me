<template>
  <div class="task-edit-view">
    <div class="mb-5 flex items-center justify-between rounded-2xl bg-base-100/35 backdrop-blur-xl border border-white/10 p-4 shadow-2xl">
      <button class="btn btn-ghost btn-outline btn-sm" @click="router.back()">← 返回</button>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p class="text-base-content/70 mb-4">{{ error }}</p>
      <button class="btn btn-ghost btn-outline" @click="router.back()">返回</button>
    </div>

    <TaskForm
      v-else
      :initial-task="task"
      :projects="projectStore.projects"
      mode="edit"
      @submit="handleSubmit"
      @cancel="router.back()"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TaskForm from '@/components/tasks/TaskForm.vue'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'
import type { TaskUpdate } from '@/types/task'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()
const projectStore = useProjectStore()

const isLoading = ref(false)
const error = ref<string | null>(null)

const taskId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? parseInt(id, 10) : Number(id)
})

const task = computed(() => taskStore.tasks.find((item) => item.id === taskId.value) || null)

const loadTask = async () => {
  isLoading.value = true
  error.value = null
  try {
    const fetched = await taskStore.fetchTaskById(taskId.value)
    if (!fetched) error.value = '未找到任务'
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载任务失败'
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async (data: TaskUpdate) => {
  if (!task.value) return
  await taskStore.updateTask(task.value.id, data)
  router.back()
}

onMounted(() => {
  projectStore.fetchProjects()
  loadTask()
})

watch(
  () => route.params.id,
  () => {
    loadTask()
  },
)
</script>

<style scoped>
.task-edit-view {
  width: 100%;
}
</style>
