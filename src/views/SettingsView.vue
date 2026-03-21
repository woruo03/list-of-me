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
        <div class="card-body gap-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="space-y-1">
              <h2 class="card-title text-lg">应用更新</h2>
              <p class="text-sm text-base-content/70">{{ updateStatusText }}</p>
              <p v-if="updateMetaText" class="text-xs text-base-content/60">{{ updateMetaText }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                class="btn btn-outline"
                :disabled="!updaterAvailable || isCheckingUpdate || isInstallingUpdate"
                @click="checkForUpdate()"
              >
                {{ isCheckingUpdate ? '检查中...' : '检查更新' }}
              </button>
              <button
                v-if="updateInfo"
                class="btn btn-primary btn-outline"
                :disabled="isCheckingUpdate || isInstallingUpdate"
                @click="installUpdate"
              >
                {{ isInstallingUpdate ? (downloadPercent !== null ? `下载中 ${downloadPercent}%` : '安装中...') : `更新到 v${updateInfo.version}` }}
              </button>
            </div>
          </div>
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
import { isTauri } from '@tauri-apps/api/core'
import { check, type DownloadEvent, type Update } from '@tauri-apps/plugin-updater'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import SelectMenu from '@/components/ui/SelectMenu.vue'
import { useUIStore } from '@/stores/uiStore'
import { DAISYUI_THEMES, FONT_SIZES } from '@/utils/constants'
import pkg from '../../package.json'
import changelogRaw from '../../CHANGELOG.md?raw'

const uiStore = useUIStore()
const appVersion = pkg.version
const changelogContent = changelogRaw.trim()
const updaterAvailable = isTauri()
const isCheckingUpdate = ref(false)
const isInstallingUpdate = ref(false)
const hasCheckedUpdate = ref(false)
const updateInfo = ref<Update | null>(null)
const updateError = ref('')
const downloadedBytes = ref(0)
const totalBytes = ref<number | null>(null)

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

const downloadPercent = computed(() => {
  if (!totalBytes.value || totalBytes.value <= 0) return null
  return Math.min(100, Math.round((downloadedBytes.value / totalBytes.value) * 100))
})

const updateStatusText = computed(() => {
  if (!updaterAvailable) return '仅桌面客户端支持在线更新'
  if (updateError.value) return updateError.value
  if (isInstallingUpdate.value && downloadPercent.value !== null) return `正在下载更新 ${downloadPercent.value}%`
  if (isInstallingUpdate.value) return '正在安装更新...'
  if (isCheckingUpdate.value) return '正在检查更新...'
  if (updateInfo.value) return `发现新版本 v${updateInfo.value.version}`
  if (hasCheckedUpdate.value) return '当前已是最新版本'
  return '点击“检查更新”获取最新版本'
})

const updateMetaText = computed(() => {
  if (!updateInfo.value) return ''
  const publishedAt = updateInfo.value.date
    ? `（发布于 ${new Date(updateInfo.value.date).toLocaleDateString('zh-CN')}）`
    : ''
  return `可更新到 v${updateInfo.value.version}${publishedAt}`
})

const releaseUpdateResource = async () => {
  if (!updateInfo.value) return
  try {
    await updateInfo.value.close()
  } catch (error) {
    console.error('Failed to release update resource:', error)
  } finally {
    updateInfo.value = null
  }
}

const checkForUpdate = async ({ silent = false }: { silent?: boolean } = {}) => {
  if (!updaterAvailable || isCheckingUpdate.value || isInstallingUpdate.value) return
  isCheckingUpdate.value = true
  updateError.value = ''
  try {
    const nextUpdate = await check()
    await releaseUpdateResource()
    updateInfo.value = nextUpdate
    hasCheckedUpdate.value = true
    if (silent) return
    if (nextUpdate) {
      uiStore.addNotification({ type: 'info', message: `发现新版本 v${nextUpdate.version}` })
    } else {
      uiStore.addNotification({ type: 'success', message: '当前已是最新版本' })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '检查更新失败，请稍后重试'
    updateError.value = `检查更新失败：${message}`
    if (!silent) {
      uiStore.addNotification({ type: 'error', message: '检查更新失败，请稍后重试' })
    }
  } finally {
    isCheckingUpdate.value = false
  }
}

const handleDownloadEvent = (event: DownloadEvent) => {
  if (event.event === 'Started') {
    downloadedBytes.value = 0
    totalBytes.value = event.data.contentLength ?? null
    return
  }
  if (event.event === 'Progress') {
    downloadedBytes.value += event.data.chunkLength
  }
}

const installUpdate = async () => {
  if (!updateInfo.value || isCheckingUpdate.value || isInstallingUpdate.value) return
  isInstallingUpdate.value = true
  updateError.value = ''
  downloadedBytes.value = 0
  totalBytes.value = null
  const pendingUpdate = updateInfo.value
  try {
    await pendingUpdate.downloadAndInstall(handleDownloadEvent)
    hasCheckedUpdate.value = true
    await releaseUpdateResource()
    uiStore.addNotification({ type: 'success', message: '更新已安装，重启应用后生效' })
  } catch (error) {
    const message = error instanceof Error ? error.message : '安装更新失败，请稍后重试'
    updateError.value = `安装更新失败：${message}`
    uiStore.addNotification({ type: 'error', message: '安装更新失败，请稍后重试' })
    updateInfo.value = pendingUpdate
  } finally {
    isInstallingUpdate.value = false
  }
}

onMounted(() => {
  void checkForUpdate({ silent: true })
})

onBeforeUnmount(() => {
  void releaseUpdateResource()
})

</script>

<style scoped>
.settings-view {
  width: 100%;
}
</style>
