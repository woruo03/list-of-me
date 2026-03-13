<template>
  <div class="task-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text font-medium">任务标题 *</span>
        </label>
        <input
          type="text"
          v-model="formData.title"
          placeholder="输入任务标题..."
          class="input input-bordered w-full"
          required
        />
        <label v-if="errors.title" class="label">
          <span class="label-text-alt text-error">{{ errors.title }}</span>
        </label>
      </div>

      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text">描述</span>
        </label>
        <textarea
          v-model="formData.description"
          placeholder="添加任务描述..."
          class="textarea textarea-bordered w-full h-24"
        />
        <label v-if="errors.description" class="label">
          <span class="label-text-alt text-error">{{ errors.description }}</span>
        </label>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">项目</span>
          </label>
          <SelectMenu v-model="formData.project_id" :options="projectSelectOptions" />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">状态</span>
          </label>
          <SelectMenu v-model="formData.status" :options="statusOptions" />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 mb-6">
        <div class="form-control relative" ref="duePickerRef">
          <label class="label">
            <span class="label-text">截止时间</span>
          </label>
          <button
            type="button"
            class="input input-bordered w-full flex items-center justify-between"
            @click="toggleDuePicker"
          >
            <span class="text-base-content/80">
              {{ dueDisplay || '未设置截止时间' }}
            </span>
            <span class="text-base-content/40">📅</span>
          </button>

          <div
            v-if="isDuePickerOpen"
            class="absolute z-30 mt-2 w-full max-w-[520px] rounded-box border border-base-300 bg-base-100 p-4 shadow-xl"
          >
            <div class="flex items-center justify-between mb-3">
              <button type="button" class="btn btn-ghost btn-xs" @click="prevMonth">‹</button>
              <div class="font-medium">{{ monthLabel }}</div>
              <button type="button" class="btn btn-ghost btn-xs" @click="nextMonth">›</button>
            </div>

            <div class="grid grid-cols-7 text-xs text-base-content/60 mb-2">
              <span v-for="label in weekLabels" :key="label" class="text-center">{{ label }}</span>
            </div>

            <div class="grid grid-cols-7 gap-1">
              <button
                v-for="(day, index) in calendarDays"
                :key="index"
                type="button"
                class="btn btn-ghost btn-xs h-8 w-full"
                :class="day && isSameDate(day, selectedDate) ? 'btn-primary text-primary-content' : ''"
                :disabled="!day"
                @click="day && selectDate(day)"
              >
                {{ day ? day.getDate() : '' }}
              </button>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-3">
              <div>
                <div class="text-xs text-base-content/60 mb-2">小时</div>
                <div class="h-40 overflow-y-auto rounded-box border border-base-300">
                  <button
                    v-for="hour in hours"
                    :key="hour"
                    type="button"
                    class="w-full px-3 py-1 text-left hover:bg-base-200"
                    :class="hour === selectedHour ? 'bg-base-200 font-medium' : ''"
                    @click="selectedHour = hour"
                  >
                    {{ hour }}
                  </button>
                </div>
              </div>
              <div>
                <div class="text-xs text-base-content/60 mb-2">分钟</div>
                <div class="h-40 overflow-y-auto rounded-box border border-base-300">
                  <button
                    v-for="minute in minutes"
                    :key="minute"
                    type="button"
                    class="w-full px-3 py-1 text-left hover:bg-base-200"
                    :class="minute === selectedMinute ? 'bg-base-200 font-medium' : ''"
                    @click="selectedMinute = minute"
                  >
                    {{ minute }}
                  </button>
                </div>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
              <div class="flex flex-wrap gap-2">
                <button type="button" class="btn btn-ghost btn-xs" @click="setDuePreset(0)">
                  今天
                </button>
                <button type="button" class="btn btn-ghost btn-xs" @click="setDuePreset(1)">
                  明天
                </button>
                <button type="button" class="btn btn-ghost btn-xs" @click="setDuePreset(7)">
                  下周
                </button>
                <button type="button" class="btn btn-ghost btn-xs" @click="clearDueDate">
                  清除
                </button>
              </div>
              <button type="button" class="btn btn-primary btn-sm" @click="closeDuePicker">
                完成
              </button>
            </div>
          </div>

          <label v-if="errors.due_at" class="label">
            <span class="label-text-alt text-error">{{ errors.due_at }}</span>
          </label>
        </div>
      </div>

      <div class="form-control mb-6">
        <label class="label">
          <span class="label-text">笔记</span>
        </label>
        <textarea
          v-model="formData.notes"
          placeholder="添加额外笔记..."
          class="textarea textarea-bordered w-full h-20"
        />
      </div>

      <div class="flex justify-end gap-3">
        <button type="button" class="btn btn-ghost" @click="emit('cancel')">取消</button>
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="loading loading-spinner"></span>
          {{ submitButtonText }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import type { Task, TaskCreate, TaskUpdate } from '@/types/task'
import { Status } from '@/types/task'
import type { Project } from '@/types/project'
import { validateTaskTitle, validateDescription, validateDueDate } from '@/utils/validation'
import { useProjectStore } from '@/stores/projectStore'
import SelectMenu from '@/components/ui/SelectMenu.vue'

interface Props {
  initialTask?: Task | null
  projects?: Project[]
  mode?: 'create' | 'edit'
  defaultProjectId?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  initialTask: null,
  projects: () => [],
  mode: 'create',
  defaultProjectId: null,
})

const emit = defineEmits<{
  submit: [data: TaskCreate | TaskUpdate]
  cancel: []
}>()

const isSubmitting = ref(false)
const projectStore = useProjectStore()

const projectOptions = computed(() => {
  return props.projects.length > 0 ? props.projects : projectStore.projects
})

const projectSelectOptions = computed(() => {
  return [
    { label: '收集箱（无项目）', value: null },
    ...projectOptions.value.map((project) => ({ label: project.name, value: project.id })),
  ]
})

const statusOptions = [
  { label: '待办', value: Status.Todo },
  { label: '进行中', value: Status.Doing },
  { label: '已完成', value: Status.Done },
]

const errors = ref<{ title?: string; description?: string; due_at?: string }>({})
const duePickerRef = ref<HTMLElement | null>(null)
const isDuePickerOpen = ref(false)
const clearedDueAt = ref(false)
const calendarMonth = ref(new Date())

const weekLabels = ['一', '二', '三', '四', '五', '六', '日']
const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

const formData = ref({
  title: '',
  description: null as string | null,
  project_id: null as number | null,
  status: Status.Todo as Status,
  due_at: null as string | null,
  notes: null as string | null,
})

const formatDateLocal = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatTimeLocal = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const formatDisplay = (date: Date) => {
  return `${formatDateLocal(date)} ${formatTimeLocal(date)}`
}

const setDueFromParts = (dateStr: string, timeStr: string) => {
  if (!dateStr) {
    formData.value.due_at = null
    clearedDueAt.value = true
    return
  }
  const safeTime = timeStr || '23:59'
  const date = new Date(`${dateStr}T${safeTime}`)
  if (isNaN(date.getTime())) return
  formData.value.due_at = date.toISOString()
  clearedDueAt.value = false
}

const dueDateLocal = computed({
  get() {
    if (!formData.value.due_at) return ''
    return formatDateLocal(new Date(formData.value.due_at))
  },
  set(value: string) {
    if (!value) {
      formData.value.due_at = null
      clearedDueAt.value = true
      return
    }
    setDueFromParts(value, dueTimeLocal.value)
  },
})

const dueTimeLocal = computed({
  get() {
    if (!formData.value.due_at) return ''
    return formatTimeLocal(new Date(formData.value.due_at))
  },
  set(value: string) {
    if (!dueDateLocal.value) {
      if (!value) {
        formData.value.due_at = null
        clearedDueAt.value = true
        return
      }
      const today = new Date()
      setDueFromParts(formatDateLocal(today), value)
      return
    }
    setDueFromParts(dueDateLocal.value, value)
  },
})

const selectedDate = computed(() => {
  if (!formData.value.due_at) return null
  return new Date(formData.value.due_at)
})

const dueDisplay = computed(() => {
  if (!formData.value.due_at) return ''
  return formatDisplay(new Date(formData.value.due_at))
})

const monthLabel = computed(() => {
  const year = calendarMonth.value.getFullYear()
  const month = calendarMonth.value.getMonth() + 1
  return `${year} 年 ${month} 月`
})

const calendarDays = computed(() => {
  const year = calendarMonth.value.getFullYear()
  const month = calendarMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: Array<Date | null> = []

  for (let i = 0; i < startOffset; i += 1) days.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(year, month, day))
  }
  return days
})

const selectedHour = computed({
  get() {
    if (!dueTimeLocal.value) return '23'
    return dueTimeLocal.value.split(':')[0] || '23'
  },
  set(value: string) {
    dueTimeLocal.value = `${value}:${selectedMinute.value}`
  },
})

const selectedMinute = computed({
  get() {
    if (!dueTimeLocal.value) return '59'
    return dueTimeLocal.value.split(':')[1] || '59'
  },
  set(value: string) {
    dueTimeLocal.value = `${selectedHour.value}:${value}`
  },
})

const isSameDate = (a: Date, b: Date | null) => {
  if (!b) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const selectDate = (date: Date) => {
  dueDateLocal.value = formatDateLocal(date)
}

const prevMonth = () => {
  const current = calendarMonth.value
  calendarMonth.value = new Date(current.getFullYear(), current.getMonth() - 1, 1)
}

const nextMonth = () => {
  const current = calendarMonth.value
  calendarMonth.value = new Date(current.getFullYear(), current.getMonth() + 1, 1)
}

const toggleDuePicker = () => {
  isDuePickerOpen.value = !isDuePickerOpen.value
}

const closeDuePicker = () => {
  isDuePickerOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (!isDuePickerOpen.value) return
  const target = event.target as Node
  if (duePickerRef.value && !duePickerRef.value.contains(target)) {
    isDuePickerOpen.value = false
  }
}

const submitButtonText = computed(() => {
  if (isSubmitting.value) return '处理中...'
  return props.mode === 'create' ? '创建任务' : '更新任务'
})

const validateForm = () => {
  errors.value = {}
  const titleResult = validateTaskTitle(formData.value.title)
  if (!titleResult.valid) errors.value.title = titleResult.message

  const descResult = validateDescription(formData.value.description)
  if (!descResult.valid) errors.value.description = descResult.message

  const dueResult = validateDueDate(formData.value.due_at)
  if (!dueResult.valid) errors.value.due_at = dueResult.message

  return Object.keys(errors.value).length === 0
}

onMounted(() => {
  if (props.initialTask) {
    formData.value = {
      title: props.initialTask.title,
      description: props.initialTask.description,
      project_id: props.initialTask.project_id,
      status: props.initialTask.status,
      due_at: props.initialTask.due_at,
      notes: props.initialTask.notes,
    }
  } else if (props.defaultProjectId !== null && props.defaultProjectId !== undefined) {
    formData.value.project_id = props.defaultProjectId
  }

  if (formData.value.due_at) {
    const current = new Date(formData.value.due_at)
    calendarMonth.value = new Date(current.getFullYear(), current.getMonth(), 1)
  }

  if (projectOptions.value.length === 0) {
    projectStore.fetchProjects()
  }

  document.addEventListener('mousedown', handleClickOutside)
})

watch(
  () => props.initialTask,
  (task) => {
    if (!task) return
    formData.value = {
      title: task.title,
      description: task.description,
      project_id: task.project_id,
      status: task.status,
      due_at: task.due_at,
      notes: task.notes,
    }
    if (task.due_at) {
      const current = new Date(task.due_at)
      calendarMonth.value = new Date(current.getFullYear(), current.getMonth(), 1)
    }
  },
)

watch(
  () => props.defaultProjectId,
  (projectId) => {
    if (props.initialTask) return
    if (projectId !== null && projectId !== undefined) {
      formData.value.project_id = projectId
    }
  },
)

watch(
  () => formData.value.due_at,
  (value) => {
    if (!value) return
    const current = new Date(value)
    calendarMonth.value = new Date(current.getFullYear(), current.getMonth(), 1)
  },
)

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    const submitData: TaskCreate & TaskUpdate = {
      title: formData.value.title.trim(),
      description: formData.value.description,
      project_id: formData.value.project_id,
      status: formData.value.status,
      due_at: formData.value.due_at,
      notes: formData.value.notes,
    }

    if (clearedDueAt.value && formData.value.due_at === null) {
      submitData.clear_due_at = true
    }

    emit('submit', submitData)
  } finally {
    isSubmitting.value = false
  }
}

const setDuePreset = (daysFromNow: number) => {
  const target = new Date()
  target.setDate(target.getDate() + daysFromNow)
  target.setHours(23, 59, 0, 0)
  formData.value.due_at = target.toISOString()
  clearedDueAt.value = false
}

const clearDueDate = async () => {
  formData.value.due_at = null
  errors.value.due_at = undefined
  clearedDueAt.value = true
  closeDuePicker()
}

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style scoped>
.task-form {
  max-width: 600px;
  margin: 0 auto;
}
</style>
