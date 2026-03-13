<template>
  <div class="completed-view">
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold">已完成</h1>
          <p class="text-base-content/70 mt-2">
            查看已完成的任务历史。这是你的成就记录，也是复盘的好地方。
          </p>
        </div>
        <div class="flex items-center gap-3">
          <span class="badge badge-primary badge-lg">
            {{ tasks.length }} 个任务
          </span>
          <button 
            class="btn btn-ghost"
            @click="clearCompleted"
            :disabled="tasks.length === 0"
          >
            清空已完成
          </button>
        </div>
      </div>
    </div>

    <TaskList
      :tasks="tasks"
      :projects="projects"
      :is-loading="isLoading"
      empty-title="还没有完成的任务"
      empty-description="开始完成任务，这里会记录你的成就。"
      :show-add-button="false"
      @edit="openEditTaskModal"
      @delete="handleDeleteTask"
      @toggle-status="handleToggleStatus"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TaskList from '@/components/tasks/TaskList.vue';
import type { Task, TaskFilter } from '@/types/task';
import TauriService from '@/services/tauriService';

const tasks = ref<Task[]>([]);
const projects = ref([]);
const isLoading = ref(false);

const fetchCompletedTasks = async () => {
  isLoading.value = true;
  try {
    const filter: TaskFilter = {
      status: 'done',
    };
    tasks.value = await TauriService.getTasks(filter);
  } catch (error) {
    console.error('Failed to fetch completed tasks:', error);
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

const openEditTaskModal = (task: Task) => {
  console.log('编辑任务:', task);
};

const handleDeleteTask = async (taskId: number) => {
  try {
    await TauriService.deleteTask(taskId);
    fetchCompletedTasks();
  } catch (error) {
    console.error('Failed to delete task:', error);
  }
};

const handleToggleStatus = async (taskId: number) => {
  try {
    // 将已完成任务恢复为待办
    await TauriService.updateTask(taskId, { status: 'todo' });
    fetchCompletedTasks();
  } catch (error) {
    console.error('Failed to toggle task status:', error);
  }
};

const clearCompleted = async () => {
  if (!confirm('确定要清空所有已完成的任务吗？此操作不可撤销。')) {
    return;
  }
  
  try {
    for (const task of tasks.value) {
      await TauriService.deleteTask(task.id);
    }
    tasks.value = [];
  } catch (error) {
    console.error('Failed to clear completed tasks:', error);
  }
};

onMounted(() => {
  fetchCompletedTasks();
  fetchProjects();
});
</script>

<style scoped>
.completed-view {
  max-width: 800px;
  margin: 0 auto;
}
</style>