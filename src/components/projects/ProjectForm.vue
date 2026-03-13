<template>
  <div class="project-form">
    <form @submit.prevent="handleSubmit">
      <!-- 项目名称 -->
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text font-medium">项目名称 *</span>
        </label>
        <input
          type="text"
          v-model="formData.name"
          placeholder="输入项目名称..."
          class="input input-bordered w-full"
          required
        />
      </div>

      <!-- 项目描述 -->
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text">描述</span>
        </label>
        <textarea
          v-model="formData.description"
          placeholder="添加项目描述..."
          class="textarea textarea-bordered w-full h-24"
        />
      </div>

      <!-- 颜色选择 -->
      <div class="form-control mb-6">
        <label class="label">
          <span class="label-text">颜色</span>
        </label>
        <div class="flex gap-2">
          <button
            v-for="color in colorOptions"
            :key="color.value"
            type="button"
            class="w-8 h-8 rounded-full border-2"
            :class="{
              'border-primary': formData.color === color.value,
              'border-base-300': formData.color !== color.value,
            }"
            :style="{ backgroundColor: color.value }"
            @click="formData.color = color.value"
          />
        </div>
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
import type { Project, ProjectCreate, ProjectUpdate } from '@/types/project'

interface Props {
  initialProject?: Project | null
  mode?: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  initialProject: null,
  mode: 'create',
})

const emit = defineEmits<{
  submit: [data: ProjectCreate | ProjectUpdate]
  cancel: []
}>()

const isSubmitting = ref(false)

// 表单数据
const formData = ref({
  name: '',
  description: null as string | null,
  color: '#3b82f6', // 默认蓝色
})

// 颜色选项
const colorOptions = [
  { name: '蓝色', value: '#3b82f6' },
  { name: '绿色', value: '#10b981' },
  { name: '黄色', value: '#f59e0b' },
  { name: '红色', value: '#ef4444' },
  { name: '紫色', value: '#8b5cf6' },
  { name: '粉色', value: '#ec4899' },
]

const submitButtonText = computed(() => {
  if (isSubmitting.value) return '处理中...'
  return props.mode === 'create' ? '创建项目' : '更新项目'
})

// 初始化表单数据
onMounted(() => {
  if (props.initialProject) {
    formData.value = {
      name: props.initialProject.name,
      description: props.initialProject.description || null,
      color: props.initialProject.color || '#3b82f6',
    }
  }
})

const handleSubmit = async () => {
  if (!formData.value.name.trim()) {
    alert('请填写项目名称')
    return
  }

  isSubmitting.value = true

  try {
    // 准备提交数据
    const submitData = {
      name: formData.value.name,
      description: formData.value.description,
      color: formData.value.color,
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
.project-form {
  max-width: 500px;
  margin: 0 auto;
}
</style>
