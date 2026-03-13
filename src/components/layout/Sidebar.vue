<template>
  <aside class="w-64 bg-base-200 border-r border-base-300 flex flex-col">
    <!-- Logo -->
    <div class="p-6 border-b border-base-300">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span class="text-primary-content font-bold">L</span>
        </div>
        <h1 class="text-xl font-bold">List-of-Me</h1>
      </div>
    </div>

    <!-- 导航菜单 -->
    <nav class="flex-1 p-4">
      <ul class="space-y-2">
        <NavItem
          icon="inbox"
          label="收集箱"
          to="/inbox"
          :badge="inboxCount"
        />
        <NavItem
          icon="calendar"
          label="今日"
          to="/today"
          :badge="todayCount"
        />
        <NavItem
          icon="folder"
          label="项目"
          to="/projects"
        />
        <NavItem
          icon="check-circle"
          label="已完成"
          to="/completed"
        />
      </ul>
    </nav>

    <!-- 底部区域 -->
    <div class="p-4 border-t border-base-300">
      <button
        class="btn btn-primary w-full"
        @click="openQuickAdd"
      >
        <span class="mr-2">+</span>
        快速添加任务
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavItem from './NavItem.vue'
import TauriService from '@/services/tauriService'

const inboxCount = ref(0)
const todayCount = ref(0)

const openQuickAdd = () => {
  // TODO: 实现快速添加任务模态框
  console.log('打开快速添加任务')
}

const fetchSummary = async () => {
  try {
    const summary = await TauriService.getSummary()
    inboxCount.value = summary.inbox_count
    todayCount.value = summary.today_count
  } catch (error) {
    console.error('Failed to fetch summary:', error)
  }
}

onMounted(() => {
  fetchSummary()
  // 每30秒刷新一次统计
  setInterval(fetchSummary, 30000)
})
</script>

<style scoped>
/* 侧边栏样式 */
</style>
