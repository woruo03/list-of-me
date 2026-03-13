<template>
  <div class="min-h-screen bg-base-100 flex">
    <!-- 侧边栏 -->
    <Sidebar />

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col">
      <!-- 头部 -->
      <Header />

      <!-- 页面内容 -->
      <main class="flex-1 p-6 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
</script>

<style scoped>
/* 主布局样式 */
</style>
