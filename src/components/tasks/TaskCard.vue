<template>
  <div
    class="bg-base-100 border border-base-300 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow"
    :class="{
      'border-l-4 border-l-primary': task.status === 'todo',
      'border-l-4 border-l-warning': task.status === 'doing',
      'border-l-4 border-l-success': task.status === 'done',
      'opacity-70': task.status === 'done',
    }"
  >
    <div class="flex items-start justify-between">
      <!-- 左侧内容 -->
      <div class="flex-1">
        <!-- 标题和状态 -->
        <div class="flex items-center gap-2 mb-2">
          <!-- 状态指示器 -->
          <button
            class="w-5 h-5 rounded-full border flex items-center justify-center"
            :class="{
              'border-base-300': task.status === 'todo',
              'border-warning bg-warning/20': task.status === 'doing',
              'border-success bg-success/20': task.status === 'done',
            }"
            @click="toggleStatus"
          >
            <span
              v-if="task.status === 'done'"
              class="text-success text-sm"
            >
              ✓
            </span>
          </button>

          <!-- 标题 -->
          <h3
            class="font-medium text-lg"
            :class="{
              'line-through text-base-content/50': task.status === 'done',
            }"
          >
            {{ task.title }}
          </h3>

          <!-- 优先级标签 -->
          <span
            v-if="isDueSoon"
            class="badge badge-warning badge-sm"
          >
            即将到期
          </span>
        </div>

        <!-- 描述 -->
        <p
          v-if="task.description"
          class="text-base-content/70 mb-3 ml-7"
        >
          {{ task.description }}
        </p>

        <!-- 元信息 -->
        <div class="flex items-center gap-4 text-sm text-base-content/50 ml-7">
          <!-- 项目 -->
          <span v-if="task.project_id && projectName"> 📁 {{ projectName }} </span>

          <!-- 截止时间 -->
          <span v-if="task.due_at"> 📅 {{ formattedDueDate }} </span>

          <!-- 创建时间 -->
          <span> 🕐 {{ formattedCreatedAt }} </span>
        </div>
      </div>

      <!-- 右侧操作按钮 -->
      <div class="flex items-center gap-2">
        <!-- 移动到今日 -->
        <button
          v-if="task.status !== 'done' && !isTodayTask"
          class="btn btn-ghost btn-sm"
          @click="moveToToday"
          title="移动到今日"
        >
          📅
        </button>

        <!-- 编辑按钮 -->
        <button
          class="btn btn-ghost btn-sm"
          @click="emit('edit', task)"
          title="编辑任务"
        >
          ✏️
        </button>

        <!-- 删除按钮 -->
        <button
          class="btn btn-ghost btn-sm text-error"
          @click="confirmDelete"
          title="删除任务"
        >
          🗑️
        </button>
      </div>
    </div>

    <!-- 笔记 -->
    <div
      v-if="task.notes"
      class="mt-3 pt-3 border-t border-base-300 ml-7"
    >
      <p class="text-base-content/80 text-sm">📝 {{ task.notes }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task, Project } from '@/types/task'

interface Props {
  task: Task
  project?: Project
}

const props = defineProps<Props>()
const emit = defineEmits<{
  edit: [task: Task]
  delete: [id: number]
  toggleStatus: [id: number]
  moveToToday: [id: number]
}>()

const projectName = computed(() => {
  return props.project?.name || '未知项目'
})

const formattedDueDate = computed(() => {
  if (!props.task.due_at) return ''
  const date = new Date(props.task.due_at)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const formattedCreatedAt = computed(() => {
  const date = new Date(props.task.created_at)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  })
})

const isTodayTask = computed(() => {
  if (!props.task.due_at) return false
  const dueDate = new Date(props.task.due_at)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return dueDate < tomorrow
})

const isDueSoon = computed(() => {
  if (!props.task.due_at || props.task.status === 'done') return false
  const dueDate = new Date(props.task.due_at)
  const now = new Date()
  const hoursDiff = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  return hoursDiff < 24 && hoursDiff > 0
})

const toggleStatus = () => {
  emit('toggleStatus', props.task.id)
}

const moveToToday = () => {
  emit('moveToToday', props.task.id)
}

const confirmDelete = () => {
  if (confirm(`确定要删除任务 "${props.task.title}" 吗？`)) {
    emit('delete', props.task.id)
  }
}
</script>

<style scoped>
/* 任务卡片样式 */
</style>
