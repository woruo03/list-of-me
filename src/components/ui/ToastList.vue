<template>
  <div class="toast toast-top toast-end z-50">
    <div
      v-for="toast in uiStore.notifications"
      :key="toast.id"
      class="alert shadow-2xl border border-white/10 bg-base-100/50 backdrop-blur-xl"
      :class="alertClass(toast.type)"
    >
      <span>{{ toast.message }}</span>
      <button
        class="btn btn-xs btn-ghost"
        @click="uiStore.removeNotification(toast.id)"
      >
        <AppIcon name="close" class="h-3.5 w-3.5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUIStore } from '@/stores/uiStore'
import AppIcon from '@/components/ui/AppIcon.vue'

const uiStore = useUIStore()

const alertClass = (type: string) => {
  if (type === 'success') return 'alert-success'
  if (type === 'error') return 'alert-error'
  if (type === 'warning') return 'alert-warning'
  return 'alert-info'
}
</script>

<style scoped>
.toast {
  pointer-events: none;
}

.toast > .alert {
  pointer-events: auto;
}
</style>
