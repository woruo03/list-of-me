<template>
  <div class="project-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text font-medium">项目名称 *</span>
        </label>
        <input
          type="text"
          v-model="formData.name"
          placeholder="输入项目名称..."
          class="input input-bordered w-full bg-base-100/50 border-white/10"
          required
        />
        <label v-if="error" class="label">
          <span class="label-text-alt text-error">{{ error }}</span>
        </label>
      </div>

      <div class="flex justify-end gap-3">
        <button type="button" class="btn btn-ghost btn-outline" @click="emit('cancel')">取消</button>
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
import type { Project } from '@/types/project'
import { validateProjectName } from '@/utils/validation'

interface Props {
  initialProject?: Project | null
  mode?: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  initialProject: null,
  mode: 'create',
})

const emit = defineEmits<{
  submit: [data: { name: string }]
  cancel: []
}>()

const isSubmitting = ref(false)
const error = ref<string | null>(null)

const formData = ref({
  name: '',
})

const submitButtonText = computed(() => {
  if (isSubmitting.value) return '处理中...'
  return props.mode === 'create' ? '创建项目' : '更新项目'
})

onMounted(() => {
  if (props.initialProject) {
    formData.value = { name: props.initialProject.name }
  }
})

watch(
  () => props.initialProject,
  (project) => {
    if (!project) return
    formData.value = { name: project.name }
  },
)

const handleSubmit = async () => {
  error.value = null
  const result = validateProjectName(formData.value.name)
  if (!result.valid) {
    error.value = result.message || '项目名称不合法'
    return
  }

  isSubmitting.value = true
  try {
    emit('submit', { name: formData.value.name.trim() })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.project-form {
  max-width: 560px;
  margin: 0 auto;
  border-radius: 1rem;
  background: hsl(var(--b1) / 0.35);
  border: 1px solid hsl(var(--bc) / 0.1);
  backdrop-filter: blur(24px);
  padding: 1.25rem;
  box-shadow: 0 24px 48px hsl(var(--bc) / 0.12);
}
</style>
