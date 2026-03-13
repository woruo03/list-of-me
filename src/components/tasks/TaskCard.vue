<template>
  <div
    class="card card-bordered bg-base-100 p-4 mb-3 shadow-sm hover:shadow-md transition-shadow"
    :class="{
      'border-l-4 border-l-primary': task.status === Status.Todo,
      'border-l-4 border-l-warning': task.status === Status.Doing,
      'border-l-4 border-l-success': task.status === Status.Done,
      'opacity-70': task.status === Status.Done,
      'ring-2 ring-primary/30': focused,
    }"
    :draggable="draggable"
    @dragstart="handleDragStart"
    @dragend="emit('dragend', task.id)"
    @click="emit('focus', task.id)"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1 min-w-0 pr-4">
        <div class="flex items-center gap-2 mb-2">
          <input
            v-if="selectable"
            type="checkbox"
            class="checkbox checkbox-sm"
            :checked="selected"
            @click.stop
            @change="emit('select', task.id)"
          />

          <button
            class="w-5 h-5 rounded-full border flex items-center justify-center"
            :class="{
              'border-base-300': task.status === Status.Todo,
              'border-warning bg-warning/20': task.status === Status.Doing,
              'border-success bg-success/20': task.status === Status.Done,
            }"
            @click.stop="toggleStatus"
          >
            <span v-if="task.status === Status.Done" class="text-success text-sm">✓</span>
          </button>

          <h3
            class="font-medium text-lg break-all"
            :class="{ 'line-through text-base-content/50': task.status === Status.Done }"
          >
            {{ task.title }}
          </h3>

          <span v-if="isDueSoon" class="badge badge-warning badge-sm">即将到期</span>
        </div>

        <p v-if="task.description" class="text-base-content/70 mb-3 ml-7 whitespace-normal break-all">
          {{ task.description }}
        </p>

        <div class="flex flex-wrap items-center gap-4 text-sm text-base-content/50 ml-7">
          <span v-if="showProject && task.project_id && projectName"> 📁 {{ projectName }} </span>
          <span v-if="task.due_at"> 📅 {{ formattedDueDate }} </span>
          <span> 🕐 {{ formattedCreatedAt }} </span>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-shrink-0">
        <button
          v-if="task.status !== Status.Done && !isTodayTask"
          class="btn btn-ghost btn-sm"
          @click.stop="moveToToday"
          title="移动到今日"
        >
          📅
        </button>

        <button class="btn btn-ghost btn-sm" @click.stop="emit('edit', task)" title="编辑任务">
          ✏️
        </button>

        <button
          class="btn btn-ghost btn-sm text-error"
          @click.stop="confirmDelete"
          title="删除任务"
        >
          🗑️
        </button>

        <span v-if="draggable" class="cursor-grab text-base-content/40">⋮⋮</span>
      </div>
    </div>

    <div v-if="task.notes" class="mt-3 pt-3 border-t border-base-300 ml-7">
      <p class="text-base-content/80 text-sm break-all">📝 {{ task.notes }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/types/task'
import { Status } from '@/types/task'
import type { Project } from '@/types/project'

interface Props {
  task: Task
  project?: Project | null
  selected?: boolean
  focused?: boolean
  selectable?: boolean
  draggable?: boolean
  showProject?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  project: null,
  selected: false,
  focused: false,
  selectable: true,
  draggable: false,
  showProject: true,
})

const emit = defineEmits<{
  edit: [task: Task]
  delete: [id: number]
  toggleStatus: [id: number]
  moveToToday: [id: number]
  select: [id: number]
  focus: [id: number]
  dragstart: [id: number]
  dragend: [id: number]
}>()

const projectName = computed(() => props.project?.name || '未知项目')

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
  if (!props.task.due_at || props.task.status === Status.Done) return false
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

const handleDragStart = (event: DragEvent) => {
  if (!props.draggable) return
  event.dataTransfer?.setData('text/plain', String(props.task.id))
  event.dataTransfer?.setDragImage(new Image(), 0, 0)
  emit('dragstart', props.task.id)
}
</script>

<style scoped>
/* 任务卡片样式 */
</style>
