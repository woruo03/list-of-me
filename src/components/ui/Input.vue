<template>
  <div class="form-control">
    <label
      v-if="label"
      class="label"
    >
      <span class="label-text">{{ label }}</span>
      <span
        v-if="required"
        class="label-text-alt text-error"
        >*</span
      >
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'input',
        'input-bordered',
        'w-full',
        {
          'input-sm': size === 'sm',
          'input-lg': size === 'lg',
          'input-error': error,
        },
      ]"
      @input="handleInput"
      @blur="handleBlur"
    />
    <label
      v-if="error"
      class="label"
    >
      <span class="label-text-alt text-error">{{ error }}</span>
    </label>
    <label
      v-if="helperText"
      class="label"
    >
      <span class="label-text-alt text-base-content/70">{{ helperText }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string
  type?: 'text' | 'password' | 'email' | 'number' | 'date' | 'datetime-local'
  label?: string
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  required?: boolean
  error?: string
  helperText?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  input: [event: Event]
  blur: [event: FocusEvent]
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('input', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}
</script>

<style scoped>
/* 输入框样式 */
</style>
