<template>
  <div class="inbox-view">
    <!-- 页面头部 -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold">收集箱</h1>
          <p class="text-base-content/70 mt-2">
            收集所有未整理的想法和任务。将它们移动到今日或指定项目以开始行动。
          </p>
        </div>
        <div class="flex items-center gap-3">
          <span class="badge badge-primary badge-lg"> {{ tasks.length }} 个任务 </span>
          <button
            class="btn btn-primary"
            @click="openAddTaskModal"
          >
            <span class="mr-2">+</span>
            添加任务
          </button>
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div
      v-if="isLoading"
      class="flex justify-center py-12"
    >
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div
      v-else-if="tasks.length === 0"
      class="text-center py-12"
    >
      <div class="text-base-content/50 mb-4">
        <span class="text-6xl">📥</span>
      </div>
      <h3 class="text-xl font-medium mb-2">收集箱是空的</h3>
      <p class="text-base-content/70 mb-6">还没有任何任务添加到收集箱。点击"添加任务"按钮开始。</p>
      <button
        class="btn btn-primary"
        @click="openAddTaskModal"
      >
        添加第一个任务
      </button>
    </div>

    <div v-else>
      <!-- 任务列表 -->
      <div class="space-y-4">
        <TaskCard
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          @edit="openEditTaskModal"
          @delete="handleDeleteTask"
          @toggle-status="handleToggleStatus"
          @move-to-today="handleMoveToToday"
        />
      </div>
    </div>

    <!-- 添加任务模态框 -->
    <div
      v-if="showAddModal"
      class="modal modal-open"
    >
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">添加新任务</h3>
        <TaskForm
          :projects="projects"
          mode="create"
          @submit="handleCreateTask"
          @cancel="closeAddTaskModal"
        />
      </div>
      <div
        class="modal-backdrop"
        @click="closeAddTaskModal"
      ></div>
    </div>

    <!-- 编辑任务模态框 -->
    <div
      v-if="showEditModal"
      class="modal modal-open"
    >
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">编辑任务</h3>
        <TaskForm
          v-if="editingTask"
          :initial-task="editingTask"
          :projects="projects"
          mode="edit"
          @submit="handleUpdateTask"
          @cancel="closeEditTaskModal"
        />
      </div>
      <div
        class="modal-backdrop"
        @click="closeEditTaskModal"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TaskCard from '@/components/tasks/TaskCard.vue'
import TaskForm from '@/components/tasks/TaskForm.vue'
import type { Task, TaskCreate, TaskUpdate, TaskFilter } from '@/types/task'
import TauriService from '@/services/tauriService'

const tasks = ref<Task[]>([])
const projects = ref([])
const isLoading = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingTask = ref<Task | null>(null)

// 获取收集箱任务
const fetchInboxTasks = async () => {
  isLoading.value = true
  try {
    const filter: TaskFilter = {
      project_id: null, // 收集箱任务 project_id 为 null
      status: undefined,
    }
    tasks.value = await TauriService.getTasks(filter)
  } catch (error) {
    console.error('Failed to fetch inbox tasks:', error)
  } finally {
    isLoading.value = false
  }
}

// 获取项目列表
const fetchProjects = async () => {
  try {
    projects.value = await TauriService.getProjects()
  } catch (error) {
    console.error('Failed to fetch projects:', error)
  }
}

// 创建任务
const handleCreateTask = async (taskData: TaskCreate) => {
  try {
    // 确保任务进入收集箱（project_id = null）
    const taskToCreate = {
      ...taskData,
      project_id: null,
    }

    await TauriService.createTask(taskToCreate)
    closeAddTaskModal()
    fetchInboxTasks() // 刷新列表
  } catch (error) {
    console.error('Failed to create task:', error)
    alert('创建任务失败，请重试')
  }
}

// 更新任务
const handleUpdateTask = async (taskData: TaskUpdate) => {
  if (!editingTask.value) return

  try {
    await TauriService.updateTask(editingTask.value.id, taskData)
    closeEditTaskModal()
    fetchInboxTasks() // 刷新列表
  } catch (error) {
    console.error('Failed to update task:', error)
    alert('更新任务失败，请重试')
  }
}

// 删除任务
const handleDeleteTask = async (taskId: number) => {
  try {
    await TauriService.deleteTask(taskId)
    fetchInboxTasks() // 刷新列表
  } catch (error) {
    console.error('Failed to delete task:', error)
    alert('删除任务失败，请重试')
  }
}

// 切换任务状态
const handleToggleStatus = async (taskId: number) => {
  try {
    const task = tasks.value.find((t) => t.id === taskId)
    if (!task) return

    // 切换状态：todo -> doing -> done -> todo
    let newStatus
    if (task.status === 'todo') newStatus = 'doing'
    else if (task.status === 'doing') newStatus = 'done'
    else newStatus = 'todo'

    await TauriService.updateTask(taskId, { status: newStatus })
    fetchInboxTasks() // 刷新列表
  } catch (error) {
    console.error('Failed to toggle task status:', error)
  }
}

// 移动到今日
const handleMoveToToday = async (taskId: number) => {
  try {
    // 设置截止时间为今天23:59
    const today = new Date()
    today.setHours(23, 59, 0, 0)
    const dueAt = today.toISOString()

    await TauriService.updateTask(taskId, { due_at: dueAt })
    fetchInboxTasks() // 刷新列表
    alert('任务已移动到今日')
  } catch (error) {
    console.error('Failed to move task to today:', error)
    alert('移动任务失败，请重试')
  }
}

// 模态框控制
const openAddTaskModal = () => {
  showAddModal.value = true
}

const closeAddTaskModal = () => {
  showAddModal.value = false
}

const openEditTaskModal = (task: Task) => {
  editingTask.value = task
  showEditModal.value = true
}

const closeEditTaskModal = () => {
  editingTask.value = null
  showEditModal.value = false
}

// 初始化
onMounted(() => {
  fetchInboxTasks()
  fetchProjects()
})
</script>

<style scoped>
.inbox-view {
  max-width: 800px;
  margin: 0 auto;
}
</style>
