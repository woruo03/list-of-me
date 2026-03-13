<template>
  <div class="task-form">
    <form @submit.prevent="handleSubmit">
      <!-- 标题 -->
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
      </div>

      <!-- 描述 -->
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text">描述</span>
        </label>
        <textarea
          v-model="formData.description"
          placeholder="添加任务描述..."
          class="textarea textarea-bordered w-full h-24"
        />
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <!-- 项目选择 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">项目</span>
          </label>
          <select
            v-model="formData.project_id"
            class="select select-bordered w-full"
          >
            <option :value="null">收集箱（无项目）</option>
            <option
              v-for="project in projects"
              :key="project.id"
              :value="project.id"
            >
              {{ project.name }}
            </option>
          </select>
        </div>

        <!-- 状态选择 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">状态</span>
          </label>
          <select
            v-model="formData.status"
            class="select select-bordered w-full"
          >
            <option value="todo">待办</option>
            <option value="doing">进行中</option>
            <option value="done">已完成</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <!-- 截止时间 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">截止时间</span>
          </label>
          <input
            type="datetime-local"
            v-model="dueAtLocal"
            class="input input-bordered w-full"
          />
        </div>

        <!-- 优先级 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">优先级</span>
          </label>
          <select
            v-model="formData.priority"
            class="select select-bordered w-full"
          >
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
        </div>
      </div>

      <!-- 笔记 -->
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

      <!-- 表单操作 -->
      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="btn btn-ghost"
          @click="emit('cancel')"
        >
          取消
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isSubmitting"
        >
          <span
            v-if="isSubmitting"
            class="loading loading-spinner"
          ></span>
          {{ submitButtonText }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Task, Project, TaskCreate, TaskUpdate, Status } from '@/types/task'
import TauriService from '@/services/tauriService'

interface Props {
  initialTask?: Task | null
  projects: Project[]
  mode?: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  initialTask: null,
  mode: 'create',
})

const emit = defineEmits<{
  submit: [data: TaskCreate | TaskUpdate]
  cancel: []
}>()

const isSubmitting = ref(false)
const projects = ref<Project[]>(props.projects)

// 表单数据
const formData = ref({
  title: '',
  description: null as string | null,
  project_id: null as number | null,
  status: 'todo' as Status,
  due_at: null as string | null,
  notes: null as string | null,
  priority: 'medium' as 'low' | 'medium' | 'high',
})

// 本地日期时间（用于 datetime-local 输入）
const dueAtLocal = computed({
  get() {
    if (!formData.value.due_at) return ''
    const date = new Date(formData.value.due_at)
    // 转换为本地时间字符串格式 YYYY-MM-DDTHH:mm
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
    // 将本地时间转换为 UTC 字符串
    const date = new Date(value)
    formData.value.due_at = date.toISOString()
  },
})

const submitButtonText = computed(() => {
  if (isSubmitting.value) return '处理中...'
  return props.mode === 'create' ? '创建任务' : '更新任务'
})

// 初始化表单数据
onMounted(() => {
  if (props.initialTask) {
    formData.value = {
      title: props.initialTask.title,
      description: props.initialTask.description,
      project_id: props.initialTask.project_id,
      status: props.initialTask.status,
      due_at: props.initialTask.due_at,
      notes: props.initialTask.notes,
      priority: 'medium',
    }
  }

  // 如果没有传入项目列表，则获取项目
  if (projects.value.length === 0) {
    fetchProjects()
  }
})

const fetchProjects = async () => {
  try {
    projects.value = await TauriService.getProjects()
  } catch (error) {
    console.error('Failed to fetch projects:', error)
  }
}

const handleSubmit = async () => {
  if (!formData.value.title.trim()) {
    alert('请填写任务标题')
    return
  }

  isSubmitting.value = true

  try {
    // 准备提交数据
    const submitData = {
      title: formData.value.title,
      description: formData.value.description,
      project_id: formData.value.project_id,
      status: formData.value.status,
      due_at: formData.value.due_at,
      notes: formData.value.notes,
    }

    emit('submit', submitData)
  } catch (error) {
    console.error('Form submission error:', error)
    alert('提交失败，请重试')
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
