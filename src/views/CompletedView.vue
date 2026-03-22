<template>
  <div>
    <div
      class="relative z-20 mb-5 flex flex-col items-end gap-3 rounded-2xl bg-base-100/35 backdrop-blur-xl border border-white/10 p-4 shadow-2xl"
    >
      <div class="flex items-center justify-end gap-2 flex-wrap">
        <button
          class="btn btn-outline btn-warning"
          @click="clearCompleted"
          :disabled="tasks.length === 0"
        >
          清空已完成
        </button>
        <button
          class="btn btn-ghost btn-outline"
          @click="toggleSelectionMode"
        >
          {{ selectionMode ? '取消选择' : '选择' }}
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
          class="btn btn-ghost btn-outline"
          @click="toggleMoveMenu"
        >
          移动
        </button>
        <button
          class="btn btn-outline btn-error"
          :disabled="taskStore.selectedCount === 0"
          @click="deleteSelected"
        >
          删除
        </button>
      </div>
      <div
        v-if="selectionMode && showMoveMenu"
        class="flex items-center justify-end gap-2 w-full"
      >
        <div class="w-56">
          <SelectMenu
            v-model="moveTargetId"
            :options="moveOptions"
            size="sm"
          />
        </div>
        <button
          class="btn btn-primary btn-outline btn-sm"
          @click="confirmMove"
        >
          确定
        </button>
      </div>
    </div>

    <TaskList
      :tasks="tasks"
      :projects="projectStore.projects"
      :is-loading="taskStore.isLoading"
      :selection-mode="selectionMode"
      empty-title="还没有完成的任务"
      empty-description="开始完成任务，这里会记录你的成就。"
      :show-add-button="false"
      @edit="openEditTaskModal"
      @delete="handleDeleteTask"
      @toggle-status="restoreTask"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import TaskList from '@/components/tasks/TaskList.vue'
import SelectMenu from '@/components/ui/SelectMenu.vue'
import type { Task } from '@/types/task'
import { Status } from '@/types/task'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'

const taskStore = useTaskStore()
const projectStore = useProjectStore()
const router = useRouter()
const selectionMode = ref(false)
const showMoveMenu = ref(false)
const moveTargetId = ref<number | null>(null)

const tasks = computed(() => taskStore.filterTasks(taskStore.completedTasks))
const allSelected = computed(() => {
  if (tasks.value.length === 0) return false
  return tasks.value.every((task) => taskStore.isSelected(task.id))
})
const moveOptions = computed(() => [
  { label: '收集箱', value: null },
  ...projectStore.projects.map((project) => ({ label: project.name, value: project.id })),
])

const openEditTaskModal = (task: Task) => {
  router.push(`/tasks/${task.id}/edit`)
}

const handleDeleteTask = async (taskId: number) => {
  await taskStore.deleteTask(taskId)
}

const restoreTask = async (taskId: number) => {
  await taskStore.updateTask(taskId, { status: Status.Todo })
}

const clearCompleted = async () => {
  if (!confirm('确定要清空所有已完成的任务吗？此操作不可撤销。')) return
  const ids = tasks.value.map((task) => task.id)
  await taskStore.bulkDelete(ids)
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
  taskStore.fetchAll({ status: Status.Done })
  projectStore.fetchProjects()
})
</script>
