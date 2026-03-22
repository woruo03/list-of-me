<template>
  <div
    ref="root"
    class="relative z-40 w-full"
  >
    <button
      type="button"
      class="btn btn-outline w-full flex items-center justify-between gap-2 font-normal bg-base-100/55 border-base-content/25 hover:bg-base-100/75 hover:border-base-content/45"
      :class="sizeClass"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="w-full text-left whitespace-nowrap overflow-hidden text-ellipsis">{{
        selectedLabel
      }}</span>
    </button>

    <ul
      v-if="isOpen"
      class="menu menu-sm menu-vertical dropdown-content absolute z-[90] mt-2 min-w-full w-max rounded-box border border-base-content/20 bg-base-100/70 backdrop-blur-xl p-2 shadow-2xl"
      @mouseleave="handleListLeave"
    >
      <li
        v-for="(option, index) in options"
        :key="`${index}-${String(option.value)}`"
        class="w-full"
      >
        <button
          type="button"
          class="btn btn-ghost btn-sm justify-between w-full text-left font-normal normal-case hover:bg-base-100/70"
          :class="{ 'btn-active': isSelected(option.value) }"
          @mouseenter="handleOptionEnter(option)"
          @click="selectOption(option.value)"
        >
          <div class="flex items-center gap-2 min-w-0">
            <span
              v-if="showPreview"
              class="inline-flex h-4 w-4 rounded-full border border-base-300"
              :data-theme="String(option.value || '')"
              :style="previewStyle()"
            ></span>
            <span class="whitespace-nowrap">{{ option.label }}</span>
          </div>
          <AppIcon v-if="isSelected(option.value)" name="check" class="h-4 w-4" />
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

interface OptionItem {
  label: string
  value: string | number | null | undefined
}

interface Props {
  modelValue: string | number | null | undefined
  options: OptionItem[]
  placeholder?: string
  size?: 'sm' | 'md'
  disabled?: boolean
  previewType?: 'theme' | 'none'
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  size: 'md',
  disabled: false,
  previewType: 'none',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null | undefined]
}>()

const root = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const originalTheme = ref<string | null>(null)
const isPreviewing = ref(false)

const sizeClass = computed(() => {
  return props.size === 'sm' ? 'btn-sm' : ''
})

const selectedLabel = computed(() => {
  const match = props.options.find((option) => option.value === props.modelValue)
  return match ? match.label : props.placeholder
})

const isSelected = (value: string | number | null | undefined) => {
  return value === props.modelValue
}

const showPreview = computed(() => props.previewType === 'theme')

const previewStyle = () => {
  if (props.previewType !== 'theme') return {}
  return {
    background: `hsl(var(--p) / 0.9)`,
    boxShadow: `0 0 0 2px hsl(var(--b1)) inset`,
  } as Record<string, string>
}

const toggle = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

const selectOption = (value: string | number | null | undefined) => {
  emit('update:modelValue', value)
  if (props.previewType === 'theme' && typeof value === 'string') {
    originalTheme.value = value
    isPreviewing.value = false
  }
  isOpen.value = false
}

const onDocumentClick = (event: MouseEvent) => {
  if (!isOpen.value) return
  if (!root.value) return
  if (root.value.contains(event.target as Node)) return
  isOpen.value = false
}

const onDocumentKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value) return
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

const handleOptionEnter = (option: OptionItem) => {
  if (props.previewType !== 'theme') return
  if (typeof option.value !== 'string') return
  if (!originalTheme.value) {
    originalTheme.value = document.documentElement.getAttribute('data-theme')
  }
  isPreviewing.value = true
  document.documentElement.setAttribute('data-theme', option.value)
}

const handleListLeave = () => {
  if (props.previewType !== 'theme') return
  if (!isPreviewing.value) return
  if (originalTheme.value) {
    document.documentElement.setAttribute('data-theme', originalTheme.value)
  }
  isPreviewing.value = false
}

watch(isOpen, (open) => {
  if (open) {
    originalTheme.value = document.documentElement.getAttribute('data-theme')
    return
  }
  if (props.previewType !== 'theme') return
  if (isPreviewing.value && originalTheme.value) {
    document.documentElement.setAttribute('data-theme', originalTheme.value)
  }
  isPreviewing.value = false
})

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onDocumentKeydown)
})
</script>

<style scoped>
.dropdown-content {
  max-height: 280px;
  overflow-y: auto;
  display: block;
}

.dropdown-content > li {
  width: 100%;
}

.dropdown-content > li > button {
  width: 100%;
}
</style>
