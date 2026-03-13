<template>
  <div class="today-view">
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold">今日</h1>
          <p class="text-base-content/70 mt-2">
            专注于今日需要完成的任务。截止时间为今天的任务会显示在这里。
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
        </div>
      </div>
    </div>

    <TaskList
      :tasks="tasks"
      :projects="projects"
      :is-loading="isLoading"
      empty-title="今日没有任务"
      empty-description="今天可以放松一下，或者添加一些新任务。"
      @add="openAddTaskModal"
      @edit="openEditTaskModal"
      @delete="handleDeleteTask"
      @toggle-status="handleToggleStatus"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TaskList from '@/components/tasks/TaskList.vue';
import type { Task, TaskCreate, TaskUpdate } from '@/types/task';
import TauriService from '@/services/tauriService';

const tasks = ref<Task[]>([]);
const projects = ref([]);
const isLoading = ref(false);

const fetchTodayTasks = async () => {
  isLoading.value = true;
  try {
    // TODO: 实现今日任务筛选
    const allTasks = await TauriService.getTasks();
    // 临时筛选：显示所有任务
    tasks.value = allTasks;
  } catch (error) {
    console.error('Failed to fetch today tasks:', error);
  } finally {
    isLoading.value = false;
  }
};

const fetchProjects = async () => {
  try {
    projects.value = await TauriService.getProjects();
  } catch (error) {
    console.error('Failed to fetch projects:', error);
  }
};

const openAddTaskModal = () => {
  console.log('打开添加任务模态框');
};

const openEditTaskModal = (task: Task) => {
  console.log('编辑任务:', task);
};

const handleDeleteTask = async (taskId: number) => {
  try {
    await TauriService.deleteTask(taskId);
    fetchTodayTasks();
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
    fetchTodayTasks();
  } catch (error) {
    console.error('Failed to toggle task status:', error);
  }
};

onMounted(() => {
  fetchTodayTasks();
  fetchProjects();
});
</script>

<style scoped>
.today-view {
  max-width: 800px;
  margin: 0 auto;
}
</style>