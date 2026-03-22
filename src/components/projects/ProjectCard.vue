<template>
  <div
    class="card card-bordered bg-base-100/40 backdrop-blur-xl p-6 shadow-2xl border border-white/10 transition-[box-shadow,border-color,background-color] duration-200 cursor-pointer"
    :class="{ 'border-error/60 bg-error/10 ring-2 ring-error/40': selected }"
    @click="handleClick"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 bg-primary/15 rounded-xl flex items-center justify-center border border-primary/25">
          <AppIcon name="folder" class="h-5 w-5 text-primary" />
        </div>

        <div>
          <h3 class="font-medium text-lg">{{ project.name }}</h3>
          <p class="text-base-content/70 text-sm">{{ taskCount }} 个任务</p>
        </div>
      </div>

      <div v-if="!selectable" class="flex items-center gap-2">
        <button class="btn btn-ghost btn-sm btn-circle" @click.stop="emit('edit', project)" title="编辑项目">
          <AppIcon name="pencil" class="h-4 w-4" />
        </button>
        <button class="btn btn-ghost btn-sm btn-circle text-error" @click.stop="confirmDelete" title="删除项目">
          <AppIcon name="trash" class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '@/types/project'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useUIStore } from '@/stores/uiStore'

interface Props {
  project: Project
  taskCount?: number
  selectable?: boolean
  selected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  taskCount: 0,
  selectable: false,
  selected: false,
})

const emit = defineEmits<{
  click: [project: Project]
  edit: [project: Project]
  delete: [id: number]
  select: [id: number]
}>()
const uiStore = useUIStore()

const handleClick = () => {
  if (props.selectable) {
    emit('select', props.project.id)
    return
  }
  emit('click', props.project)
}

const confirmDelete = async () => {
  const confirmed = await uiStore.confirmDestructive({
    title: '删除项目',
    message: `确定要删除项目“${props.project.name}”吗？\n此操作不可撤销。`,
  })
  if (!confirmed) return
  emit('delete', props.project.id)
}
</script>
