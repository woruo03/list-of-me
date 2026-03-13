<template>
  <button
    :class="[
      'btn',
      {
        'btn-primary': variant === 'primary',
        'btn-secondary': variant === 'secondary',
        'btn-accent': variant === 'accent',
        'btn-ghost': variant === 'ghost',
        'btn-link': variant === 'link',
        'btn-outline': variant === 'outline',
        'btn-sm': size === 'sm',
        'btn-lg': size === 'lg',
        'btn-wide': size === 'wide',
        'btn-block': size === 'block',
        loading: loading,
      },
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span
      v-if="loading"
      class="loading loading-spinner"
    ></span>
    <span
      v-else-if="icon"
      class="mr-2"
      >{{ icon }}</span
    >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'link' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'wide' | 'block'
  icon?: string
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* 按钮样式 */
</style>
