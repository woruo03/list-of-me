import TauriService from './tauriService';
import type { Task, TaskCreate, TaskUpdate, TaskFilter } from '@/types/task';
import type { Project } from '@/types/project';

export class TaskService {
  // 获取任务列表
  static async getTasks(filter?: TaskFilter): Promise<Task[]> {
    return TauriService.getTasks(filter);
  }
  
  // 创建任务
  static async createTask(taskData: TaskCreate): Promise<Task> {
    return TauriService.createTask(taskData);
  }
  
  // 更新任务
  static async updateTask(id: number, update: TaskUpdate): Promise<Task> {
    return TauriService.updateTask(id, update);
  }
  
  // 删除任务
  static async deleteTask(id: number): Promise<void> {
    return TauriService.deleteTask(id);
  }
  
  // 获取单个任务
  static async getTask(id: number): Promise<Task> {
    return TauriService.getTask(id);
  }
  
  // 获取收集箱任务
  static async getInboxTasks(): Promise<Task[]> {
    const filter: TaskFilter = {
      project_id: null,
    };
    return this.getTasks(filter);
  }
  
  // 获取今日任务
  static async getTodayTasks(): Promise<Task[]> {
    const allTasks = await this.getTasks();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    return allTasks.filter(task => {
      if (!task.due_at || task.status === 'done') return false;
      const dueDate = new Date(task.due_at);
      return dueDate < tomorrow;
    });
  }
  
  // 获取已完成任务
  static async getCompletedTasks(): Promise<Task[]> {
    const filter: TaskFilter = {
      status: 'done',
    };
    return this.getTasks(filter);
  }
  
  // 获取项目任务
  static async getProjectTasks(projectId: number): Promise<Task[]> {
    const filter: TaskFilter = {
      project_id: projectId,
    };
    return this.getTasks(filter);
  }
  
  // 切换任务状态
  static async toggleTaskStatus(id: number, currentStatus: string): Promise<Task> {
    let newStatus: string;
    if (currentStatus === 'todo') newStatus = 'doing';
    else if (currentStatus === 'doing') newStatus = 'done';
    else newStatus = 'todo';
    
    return this.updateTask(id, { status: newStatus as any });
  }
  
  // 移动到今日
  static async moveToToday(taskId: number): Promise<Task> {
    const today = new Date();
    today.setHours(23, 59, 0, 0);
    const dueAt = today.toISOString();
    
    return this.updateTask(taskId, { due_at: dueAt });
  }
  
  // 获取统计信息
  static async getStats() {
    const [inboxCount, todayCount] = await Promise.all([
      TauriService.getInboxCount(),
      TauriService.getTodayCount(),
    ]);
    
    return {
      inbox: inboxCount,
      today: todayCount,
    };
  }
}

export default TaskService;