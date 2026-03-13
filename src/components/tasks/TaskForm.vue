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

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="form-control">
          <label class="label">
            <span class="label-text">截止时间</span>
          </label>
          <input type="datetime-local" v-model="dueAtLocal" class="input input-bordered w-full" />
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
import { ref, computed, onMounted, watch } from 'vue'
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

const formData = ref({
  title: '',
  description: null as string | null,
  project_id: null as number | null,
  status: Status.Todo as Status,
  due_at: null as string | null,
  notes: null as string | null,
})

const dueAtLocal = computed({
  get() {
    if (!formData.value.due_at) return ''
    const date = new Date(formData.value.due_at)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  },
  set(value: string) {
    if (!value) {
      formData.value.due_at = null
      return
    }
    const date = new Date(value)
    formData.value.due_at = date.toISOString()
  },
})

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

  if (projectOptions.value.length === 0) {
    projectStore.fetchProjects()
  }
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

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    const submitData = {
      title: formData.value.title.trim(),
      description: formData.value.description,
      project_id: formData.value.project_id,
      status: formData.value.status,
      due_at: formData.value.due_at,
      notes: formData.value.notes,
    }

    emit('submit', submitData)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.task-form {
  max-width: 600px;
  margin: 0 auto;
}
</style>
