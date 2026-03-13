<template>
  <li>
    <router-link
      :to="to"
      class="flex items-center justify-between p-3 rounded-lg hover:bg-base-300 transition-colors"
      :class="{ 'bg-base-300': isActive }"
    >
      <div class="flex items-center gap-3">
        <div class="w-5 h-5 flex items-center justify-center">
          <span class="text-lg">{{ icon }}</span>
        </div>
        <span v-if="!collapsed" class="font-medium">{{ label }}</span>
      </div>

      <span v-if="badge !== undefined && badge > 0 && !collapsed" class="badge badge-primary">
        {{ badge }}
      </span>
    </router-link>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface Props {
  icon: string
  label: string
  to: string
  badge?: number
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
})

const route = useRoute()

const isActive = computed(() => {
  if (props.to === '/') return route.path === '/'
  return route.path.startsWith(props.to)
})
</script>

<style scoped>
/* 导航项样式 */
</style>
