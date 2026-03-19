<template>
  <div
    v-if="isOpen"
    class="modal modal-open"
  >
    <div class="modal-box bg-base-100/40 backdrop-blur-xl border border-white/10 shadow-2xl" :class="sizeClass">
      <!-- 标题 -->
      <div
        v-if="title"
        class="flex items-center justify-between mb-4"
      >
        <h3 class="font-bold text-lg">{{ title }}</h3>
        <button
          v-if="showCloseButton"
          class="btn btn-sm btn-circle btn-ghost"
          @click="closeModal"
        >
          ✕
        </button>
      </div>

      <!-- 内容 -->
      <div class="modal-content">
        <slot />
      </div>

      <!-- 操作按钮 -->
      <div
        v-if="showActions"
        class="modal-action gap-3"
      >
        <slot name="actions">
          <button
            class="btn btn-ghost btn-outline"
            @click="closeModal"
          >
            取消
          </button>
          <button
            class="btn btn-primary"
            @click="handleConfirm"
            :disabled="confirmDisabled"
          >
            {{ confirmText }}
          </button>
        </slot>
      </div>
    </div>
    <div
      class="modal-backdrop"
      @click="closeOnBackdrop && closeModal()"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  isOpen: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  showActions?: boolean
  confirmText?: string
  confirmDisabled?: boolean
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showCloseButton: true,
  showActions: true,
  confirmText: '确认',
  closeOnBackdrop: true,
})

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const sizeClass = computed(() => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  }
  return sizes[props.size]
})

const closeModal = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped>
.modal-content {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
