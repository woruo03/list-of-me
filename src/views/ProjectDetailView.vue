<template>
  <div class="project-detail-view">
    <!-- 项目头部 -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <button 
              class="btn btn-ghost btn-sm"
              @click="router.back()"
            >
              ← 返回
            </button>
            <h1 class="text-3xl font-bold">{{ project?.name || '加载中...' }}</h1>
            <span 
              class="badge"
              :style="{ backgroundColor: project?.color || '#3b82f6' }"
            >
              项目
            </span>
          </div>
          <p v-if="project?.description" class="text-base-content/70 mt-2">
            {{ project.description }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <span class="badge badge-primary badge-lg">
            {{ tasks.length }} 个任务
          </span>
          <button 
            class="btn btn-primary"
            @click="openAddTaskModal"
          >
            <span class="mr-2">+</span>
            添加任务
          </button>
          <button 
            class="btn btn-ghost"
            @click="openEditProjectModal"
          >
            编辑项目
          </button>
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <TaskList
      :tasks="tasks"
      :projects="[project]"
      :is-loading="isLoading"
      empty-title="项目中没有任务"
      empty-description="为这个项目添加第一个任务吧。"
      @add="openAddTaskModal"
      @edit="openEditTaskModal"
      @delete="handleDeleteTask"
      @toggle-status="handleToggleStatus"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TaskList from '@/components/tasks/TaskList.vue';
import type { Task, TaskFilter } from '@/types/task';
import type { Project } from '@/types/project';
import TauriService from '@/services/tauriService';

const route = useRoute();
const router = useRouter();

const project = ref<Project | null>(null);
const tasks = ref<Task[]>([]);
const isLoading = ref(false);

const projectId = computed(() => {
  const id = route.params.id;
  return typeof id === 'string' ? parseInt(id, 10) : Number(id);
});

const fetchProject = async () => {
  try {
    project.value = await TauriService.getProject(projectId.value);
  } catch (error) {
    console.error('Failed to fetch project:', error);
    router.push('/projects');
  }
};

const fetchProjectTasks = async () => {
  isLoading.value = true;
  try {
    const filter: TaskFilter = {
      project_id: projectId.value,
    };
    tasks.value = await TauriService.getTasks(filter);
  } catch (error) {
    console.error('Failed to fetch project tasks:', error);
  } finally {
    isLoading.value = false;
  }
};

const openAddTaskModal = () => {
  console.log('打开添加任务模态框');
};

const openEditTaskModal = (task: Task) => {
  console.log('编辑任务:', task);
};

const openEditProjectModal = () => {
  console.log('编辑项目:', project.value);
};

const handleDeleteTask = async (taskId: number) => {
  try {
    await TauriService.deleteTask(taskId);
    fetchProjectTasks();
  } catch (error) {
    console.error('Failed to delete task:', error);
  }
};

const handleToggleStatus = async (taskId: number) => {
  try {
    const task = tasks.value.find(t => t.id === taskId);
    if (!task) return;
    
    let newStatus;
    if (task.status === 'todo') newStatus = 'doing';
    else if (task.status === 'doing') newStatus = 'done';
    else newStatus = 'todo';
    
    await TauriService.updateTask(taskId, { status: newStatus });
    fetchProjectTasks();
  } catch (error) {
    console.error('Failed to toggle task status:', error);
  }
};

onMounted(() => {
  fetchProject();
  fetchProjectTasks();
});

watch(() => route.params.id, () => {
  fetchProject();
  fetchProjectTasks();
});
</script>

<style scoped>
.project-detail-view {
  max-width: 800px;
  margin: 0 auto;
}
</style>