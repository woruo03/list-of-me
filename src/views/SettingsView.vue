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

      <div class="card card-bordered bg-base-100">
        <div class="card-body">
          <h2 class="card-title text-lg">版本信息</h2>
          <div class="text-base-content/70">v{{ appVersion }}</div>
        </div>
      </div>

      <div class="card card-bordered bg-base-100">
        <div class="card-body">
          <h2 class="card-title text-lg">更新日志</h2>
          <div class="collapse collapse-arrow bg-base-200 border border-base-300">
            <input type="checkbox" />
            <div class="collapse-title text-sm font-medium">展开查看更新日志</div>
            <div class="collapse-content">
              <ul class="list-disc pl-5 space-y-1 text-base-content/70 max-h-40 overflow-y-auto">
                <li>新增选择模式：全选、移动、删除。</li>
                <li>新增任务编辑/新增独立页面（不再使用弹窗）。</li>
                <li>截止时间选择器升级为日历弹出 + 时间滚轮。</li>
                <li>主题与字体大小设置优化，筛选栏布局优化。</li>
              </ul>
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

const uiStore = useUIStore()
const appVersion = pkg.version

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
