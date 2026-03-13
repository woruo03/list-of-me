<template>
  <div class="settings-view">
    <div class="grid grid-cols-1 gap-6">
      <div class="card card-bordered bg-base-100">
        <div class="card-body">
          <h2 class="card-title text-lg">主题</h2>
          <SelectMenu v-model="themeValue" :options="themeOptions" preview-type="theme" />
        </div>
      </div>

      <div class="card card-bordered bg-base-100 lg:col-span-1">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <h2 class="card-title text-lg">字体大小</h2>
            <span class="text-sm text-base-content/60">{{ uiStore.fontSize }}px</span>
          </div>
          <SelectMenu v-model="fontSizeValue" :options="fontSizeOptions" />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SelectMenu from '@/components/ui/SelectMenu.vue'
import { useUIStore } from '@/stores/uiStore'
import { DAISYUI_THEMES, FONT_SIZES } from '@/utils/constants'

const uiStore = useUIStore()

const themeOptions = DAISYUI_THEMES.map((theme) => ({ label: theme, value: theme }))
const fontSizeOptions = FONT_SIZES.map((size) => ({ label: `${size}px`, value: size }))
const themeValue = computed({
  get: () => uiStore.theme,
  set: (value: string | number | null | undefined) => {
    if (typeof value === 'string') uiStore.setTheme(value)
  },
})

const fontSizeValue = computed({
  get: () => uiStore.fontSize,
  set: (value: string | number | null | undefined) => {
    if (typeof value === 'number') uiStore.setFontSize(value)
  },
})

</script>

<style scoped>
.settings-view {
  width: 100%;
}
</style>
