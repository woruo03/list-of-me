<template>
  <div class="task-list">
    <div v-if="isLoading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="tasks.length === 0" class="text-center py-12 md:py-16">
      <div
        class="empty-task-card card card-bordered bg-base-100/45 backdrop-blur-xl mx-auto max-w-md p-8 md:p-9 border border-white/10 shadow-2xl"
      >
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-base-100/55 text-base-content/60">
          <AppIcon name="checklist" class="h-9 w-9" />
        </div>
        <h3 class="text-xl font-semibold mb-2 tracking-tight">{{ emptyTitle }}</h3>
        <p class="text-base-content/70 mb-6 leading-7">{{ emptyDescription }}</p>
        <button
          v-if="showAddButton"
          class="btn btn-primary btn-outline px-5"
          @click="emit('add')"
        >
          添加任务
        </button>
      </div>
    </div>

    <div v-else>
      <div class="task-list-stack">
        <TaskCard
          v-for="task in visibleTasks"
          :key="task.id"
          :task="task"
          :project="getProject(task.project_id)"
          :selected="taskStore.isSelected(task.id)"
          :focused="taskStore.focusedTaskId === task.id"
          :selectable="selectionMode"
          @edit="emit('edit', task)"
          @delete="emit('delete', task.id)"
          @toggle-status="emit('toggle-status', task.id)"
          @move-to-today="emit('move-to-today', task.id)"
          @select="taskStore.toggleSelect"
          @focus="taskStore.setFocusedTask"
        />
      </div>

      <div v-if="visibleTasks.length < tasks.length" class="flex justify-center mt-6">
        <button
          class="btn btn-outline btn-sm rounded-xl border-white/20 bg-base-100/50 px-5 shadow-md"
          @click="loadMore"
        >
          加载更多任务
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import TaskCard from './TaskCard.vue'
import type { Task } from '@/types/task'
import type { Project } from '@/types/project'
import { useTaskStore } from '@/stores/taskStore'
import AppIcon from '@/components/ui/AppIcon.vue'

interface Props {
  tasks: Task[]
  projects: Project[]
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  showAddButton?: boolean
  selectionMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  emptyTitle: '没有任务',
  emptyDescription: '这里还没有任何任务',
  showAddButton: true,
  selectionMode: false,
})

const emit = defineEmits<{
  add: []
  edit: [task: Task]
  delete: [id: number]
  'toggle-status': [id: number]
  'move-to-today': [id: number]
}>()

const taskStore = useTaskStore()
const visibleCount = ref(20)

const visibleTasks = computed(() => props.tasks.slice(0, visibleCount.value))

const selectionMode = computed(() => props.selectionMode)

const getProject = (projectId: number | null) => {
  if (!projectId) return null
  return props.projects.find((p) => p.id === projectId) || null
}

const loadMore = () => {
  visibleCount.value = Math.min(props.tasks.length, visibleCount.value + 20)
}

watch(
  () => props.tasks,
  () => {
    visibleCount.value = 20
  },
)

</script>

<style scoped>
.task-list {
  min-height: 200px;
  position: relative;
  z-index: 0;
}

.task-list-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-task-card {
  position: relative;
}

.empty-task-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 1rem;
  pointer-events: none;
  background: linear-gradient(145deg, hsl(var(--p) / 0.08), transparent 45%);
}
</style>
