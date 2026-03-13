<template>
  <div class="inbox-view">
    <div class="mb-4 flex flex-col items-end gap-2">
      <div class="flex items-center justify-end gap-2 flex-wrap">
        <button class="btn btn-ghost" @click="toggleSelectionMode">
          {{ selectionMode ? '取消选择' : '选择' }}
        </button>
      </div>
      <div v-if="selectionMode" class="flex items-center justify-end gap-2 w-full">
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
      <div v-if="selectionMode && showMoveMenu" class="flex items-center justify-end gap-2 w-full">
        <div class="w-56">
          <SelectMenu v-model="moveTargetId" :options="moveOptions" size="sm" />
        </div>
        <button class="btn btn-ghost" @click="confirmMove">确定</button>
      </div>
    </div>

    <TaskList
      :tasks="tasks"
      :projects="projectStore.projects"
      :is-loading="taskStore.isLoading"
      :selection-mode="selectionMode"
      empty-title="收集箱是空的"
      empty-description="还没有任何任务添加到收集箱。点击“添加任务”开始。"
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
import { useRouter } from 'vue-router'
import TaskList from '@/components/tasks/TaskList.vue'
import SelectMenu from '@/components/ui/SelectMenu.vue'
import type { Task } from '@/types/task'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'

const taskStore = useTaskStore()
const projectStore = useProjectStore()
const uiStore = useUIStore()
const router = useRouter()
const selectionMode = ref(false)
const showMoveMenu = ref(false)
const moveTargetId = ref<number | null>(null)

const tasks = computed(() => taskStore.filterTasks(taskStore.inboxTasks))
const allSelected = computed(() => {
  if (tasks.value.length === 0) return false
  return tasks.value.every((task) => taskStore.isSelected(task.id))
})
const moveOptions = computed(() => [
  { label: '收集箱', value: null },
  ...projectStore.projects.map((project) => ({ label: project.name, value: project.id })),
])

const openAddTaskModal = () => {
  router.push('/tasks/new?inbox=1')
}

const openEditTaskModal = (task: Task) => {
  router.push(`/tasks/${task.id}/edit`)
}

const handleDeleteTask = async (taskId: number) => {
  await taskStore.deleteTask(taskId)
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
  taskStore.fetchAll({ project_id: null })
  projectStore.fetchProjects()
})
</script>

<style scoped>
.inbox-view {
  width: 100%;
}
</style>
