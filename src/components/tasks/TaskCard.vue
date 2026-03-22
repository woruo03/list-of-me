<template>
  <div
    class="task-card-root card card-bordered relative overflow-hidden rounded-2xl bg-base-100/45 backdrop-blur-xl p-4 md:p-5 shadow-xl border border-white/15"
    :class="{
      'opacity-80': task.status === Status.Done,
      'border-error/60 bg-error/10 ring-2 ring-error/40': selected,
      'ring-2 ring-primary/30': focused,
    }"
    :draggable="draggable"
    @dragstart="handleDragStart"
    @dragend="emit('dragend', task.id)"
    @click="handleCardClick"
  >
    <div class="pointer-events-none absolute inset-y-0 left-0 w-1.5 rounded-r-full" :class="statusStripeClass"></div>

    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1 pr-1">
        <div class="flex items-start gap-3">
          <button
            class="btn btn-circle btn-sm border mt-0.5"
            :class="{
              'border-base-300 bg-base-100/80': task.status === Status.Todo,
              'border-warning/60 bg-warning/20 text-warning-content': task.status === Status.Doing,
              'border-success/60 bg-success/20 text-success-content': task.status === Status.Done,
            }"
            @click.stop="toggleStatus"
          >
            <AppIcon
              v-if="task.status === Status.Done"
              name="check"
              class="h-3.5 w-3.5 text-success"
            />
          </button>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <h3
                class="font-semibold text-[1.03rem] leading-6 break-all text-base-content"
                :class="{ 'line-through text-base-content/50': task.status === Status.Done }"
              >
                {{ task.title }}
              </h3>
              <span class="badge badge-sm border-white/20 bg-base-100/65">{{ statusText }}</span>
              <span
                v-if="isOverdue"
                class="badge badge-error badge-outline badge-sm"
              >
                已逾期
              </span>
              <span
                v-else-if="isDueSoon"
                class="badge badge-warning badge-outline badge-sm"
              >
                即将到期
              </span>
            </div>

            <div
              v-if="task.description"
              class="mb-3"
            >
              <p
                class="text-base-content/75 text-sm leading-6 whitespace-normal break-all"
                :class="{ 'line-clamp-2': !isDescriptionExpanded }"
              >
                {{ task.description }}
              </p>
              <button
                v-if="hasLongDescription"
                class="btn btn-ghost btn-xs mt-1"
                @click.stop="toggleDescription"
              >
                {{ isDescriptionExpanded ? '收起' : '展开' }}
              </button>
            </div>

            <div class="flex flex-wrap items-center gap-2.5 text-xs text-base-content/65">
              <span
                v-if="showProject && task.project_id && projectName"
                class="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-base-100/45 px-2.5 py-1"
              >
                <AppIcon name="folder" class="h-3.5 w-3.5" />
                {{ projectName }}
              </span>
              <span
                v-if="task.due_at"
                class="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-base-100/45 px-2.5 py-1"
              >
                <AppIcon name="calendar" class="h-3.5 w-3.5" />
                {{ formattedDueDate }}
              </span>
              <span class="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-base-100/45 px-2.5 py-1">
                <AppIcon name="clock" class="h-3.5 w-3.5" />
                {{ formattedCreatedAt }}
              </span>
            </div>

            <div v-if="task.notes" class="mt-3 rounded-xl border border-white/10 bg-base-100/35 px-3 py-2.5">
              <p
                class="text-base-content/80 text-sm break-all"
                :class="{ 'line-clamp-2': !isNotesExpanded }"
              >
                <span class="inline-flex items-start gap-1.5">
                  <AppIcon name="note" class="h-3.5 w-3.5 mt-0.5" />
                  <span>{{ task.notes }}</span>
                </span>
              </p>
              <button
                v-if="hasLongNotes"
                class="btn btn-ghost btn-xs mt-1"
                @click.stop="toggleNotes"
              >
                {{ isNotesExpanded ? '收起' : '展开' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-1.5 flex-shrink-0">
        <button
          v-if="task.status !== Status.Done && !isTodayTask"
          class="btn btn-ghost btn-sm btn-circle border border-transparent bg-base-100/35 hover:border-white/15"
          @click.stop="moveToToday"
          title="移动到今日"
        >
          <AppIcon name="calendar" class="h-4 w-4" />
        </button>

        <button
          v-if="!selectable"
          class="btn btn-ghost btn-sm btn-circle border border-transparent bg-base-100/35 hover:border-white/15"
          @click.stop="emit('edit', task)"
          title="编辑任务"
        >
          <AppIcon name="pencil" class="h-4 w-4" />
        </button>

        <button
          v-if="!selectable"
          class="btn btn-ghost btn-sm btn-circle border border-transparent bg-base-100/35 text-error hover:border-error/35"
          @click.stop="confirmDelete"
          title="删除任务"
        >
          <AppIcon name="trash" class="h-4 w-4" />
        </button>

        <span
          v-if="draggable"
          class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-base-100/35 text-base-content/50 cursor-grab"
        >
          <AppIcon name="grip" class="h-4 w-4" />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Task } from '@/types/task'
import { Status } from '@/types/task'
import type { Project } from '@/types/project'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useUIStore } from '@/stores/uiStore'

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
const uiStore = useUIStore()

const projectName = computed(() => props.project?.name || '未知项目')
const statusText = computed(() => {
  if (props.task.status === Status.Doing) return '进行中'
  if (props.task.status === Status.Done) return '已完成'
  return '待办'
})
const statusStripeClass = computed(() => {
  if (props.task.status === Status.Doing) return 'bg-warning/80'
  if (props.task.status === Status.Done) return 'bg-success/80'
  return 'bg-primary/80'
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
  if (!props.task.due_at || props.task.status === Status.Done) return false
  const dueDate = new Date(props.task.due_at)
  const now = new Date()
  const hoursDiff = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  return hoursDiff < 24 && hoursDiff > 0
})

const isOverdue = computed(() => {
  if (!props.task.due_at || props.task.status === Status.Done) return false
  const dueDate = new Date(props.task.due_at)
  const now = new Date()
  return dueDate.getTime() <= now.getTime()
})

const isDescriptionExpanded = ref(false)
const isNotesExpanded = ref(false)

const hasLongDescription = computed(() => {
  return (props.task.description?.length || 0) > 80
})

const hasLongNotes = computed(() => {
  return (props.task.notes?.length || 0) > 80
})

const toggleStatus = () => {
  emit('toggleStatus', props.task.id)
}

const moveToToday = () => {
  emit('moveToToday', props.task.id)
}

const toggleDescription = () => {
  isDescriptionExpanded.value = !isDescriptionExpanded.value
}

const toggleNotes = () => {
  isNotesExpanded.value = !isNotesExpanded.value
}

const handleCardClick = () => {
  if (props.selectable) {
    emit('select', props.task.id)
    return
  }
  emit('focus', props.task.id)
}

const confirmDelete = async () => {
  const confirmed = await uiStore.confirmDestructive({
    title: '删除任务',
    message: `确定要删除任务“${props.task.title}”吗？\n此操作不可撤销。`,
  })
  if (!confirmed) return
  emit('delete', props.task.id)
}

const handleDragStart = (event: DragEvent) => {
  if (!props.draggable) return
  event.dataTransfer?.setData('text/plain', String(props.task.id))
  event.dataTransfer?.setDragImage(new Image(), 0, 0)
  emit('dragstart', props.task.id)
}
</script>

<style scoped>
.task-card-root,
.task-card-root:hover {
  transform: none !important;
  transition: none !important;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
