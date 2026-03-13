<template>
  <div class="toast toast-top toast-end z-50">
    <div
      v-for="toast in uiStore.notifications"
      :key="toast.id"
      class="alert shadow-lg border border-base-300 bg-base-100"
      :class="alertClass(toast.type)"
    >
      <span>{{ toast.message }}</span>
      <button class="btn btn-xs btn-ghost" @click="uiStore.removeNotification(toast.id)">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUIStore } from '@/stores/uiStore'

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
