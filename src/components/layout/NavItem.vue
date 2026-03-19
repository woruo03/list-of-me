<template>
  <li class="w-full">
    <router-link
      :to="to"
      class="flex w-full items-center justify-between px-3 py-2 rounded-xl bg-base-100/20 border border-transparent hover:bg-base-100/50 hover:border-white/10 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
      :class="{ 'bg-base-100/60 border-white/10 shadow-lg': isActive }"
    >
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 flex items-center justify-center rounded-lg bg-base-100/60 border border-white/10">
          <span class="text-lg">{{ icon }}</span>
        </div>
        <span v-if="!collapsed" class="font-medium">{{ label }}</span>
      </div>

      <span v-if="badge !== undefined && badge > 0 && !collapsed" class="badge badge-primary badge-outline badge-sm">
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
