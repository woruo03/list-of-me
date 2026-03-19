<template>
  <div class="settings-view">
    <div class="grid grid-cols-1 gap-6">
      <div class="card card-bordered bg-base-100/40 backdrop-blur-xl border border-white/10 shadow-2xl overflow-visible relative z-30">
        <div class="card-body">
          <h2 class="card-title text-lg">主题</h2>
          <SelectMenu class="min-w-[16rem]" v-model="themeValue" :options="themeOptions" preview-type="theme" />
        </div>
      </div>

      <div class="card card-bordered bg-base-100/40 backdrop-blur-xl border border-white/10 shadow-2xl overflow-visible relative z-20 lg:col-span-1">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <h2 class="card-title text-lg">字体大小</h2>
            <span class="badge badge-outline">{{ uiStore.fontSize }}px</span>
          </div>
          <SelectMenu class="min-w-[16rem]" v-model="fontSizeValue" :options="fontSizeOptions" />
        </div>
      </div>

      <div class="card card-bordered bg-base-100/40 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div class="card-body">
          <h2 class="card-title text-lg">版本信息</h2>
          <div class="badge badge-primary badge-outline">v{{ appVersion }}</div>
        </div>
      </div>

      <div class="card card-bordered bg-base-100/40 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div class="card-body">
          <h2 class="card-title text-lg">更新日志</h2>
          <div class="collapse collapse-arrow bg-base-100/45 backdrop-blur-xl border border-white/10">
            <input type="checkbox" />
            <div class="collapse-title text-sm font-medium">展开查看更新日志</div>
            <div class="collapse-content">
              <pre class="max-h-72 overflow-y-auto whitespace-pre-wrap text-xs leading-6 text-base-content/75">{{ changelogContent }}</pre>
            </div>
          </div>
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
import pkg from '../../package.json'
import changelogRaw from '../../CHANGELOG.md?raw'

const uiStore = useUIStore()
const appVersion = pkg.version
const changelogContent = changelogRaw.trim()

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
