<template>
  <div
    class="card card-bordered bg-base-100 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    @click="emit('click', project)"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
          <span class="text-primary text-lg">📁</span>
        </div>

        <div>
          <h3 class="font-medium text-lg">{{ project.name }}</h3>
          <p class="text-base-content/70 text-sm">{{ taskCount }} 个任务</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button class="btn btn-ghost btn-sm" @click.stop="emit('edit', project)" title="编辑项目">
          ✏️
        </button>
        <button class="btn btn-ghost btn-sm text-error" @click.stop="confirmDelete" title="删除项目">
          🗑️
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '@/types/project'

interface Props {
  project: Project
  taskCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  taskCount: 0,
})

const emit = defineEmits<{
  click: [project: Project]
  edit: [project: Project]
  delete: [id: number]
}>()

const confirmDelete = () => {
  if (confirm(`确定要删除项目 "${props.project.name}" 吗？`)) {
    emit('delete', props.project.id)
  }
}
</script>

<style scoped>
/* 项目卡片样式 */
</style>
