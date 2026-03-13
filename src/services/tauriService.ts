import { invoke } from '@tauri-apps/api/core'
import type { Task, Project, TaskCreate, TaskUpdate, TaskFilter, Summary } from '@/types/task'

export class TauriService {
  // --- 任务相关 ---

  /**
   * 获取任务列表
   */
  static async getTasks(filter?: TaskFilter): Promise<Task[]> {
    try {
      return await invoke<Task[]>('get_tasks', { filter: filter || {} })
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      throw error
    }
  }

  /**
   * 创建任务
   */
  static async createTask(task: TaskCreate): Promise<Task> {
    try {
      return await invoke<Task>('create_task', { task })
    } catch (error) {
      console.error('Failed to create task:', error)
      throw error
    }
  }

  /**
   * 更新任务
   */
  static async updateTask(id: number, update: TaskUpdate): Promise<Task> {
    try {
      return await invoke<Task>('update_task', { id, update })
    } catch (error) {
      console.error('Failed to update task:', error)
      throw error
    }
  }

  /**
   * 删除任务
   */
  static async deleteTask(id: number): Promise<void> {
    try {
      await invoke('delete_task', { id })
    } catch (error) {
      console.error('Failed to delete task:', error)
      throw error
    }
  }

  /**
   * 获取单个任务
   */
  static async getTask(id: number): Promise<Task> {
    try {
      return await invoke<Task>('get_task', { id })
    } catch (error) {
      console.error('Failed to fetch task:', error)
      throw error
    }
  }

  // --- 项目相关 ---

  /**
   * 获取项目列表
   */
  static async getProjects(): Promise<Project[]> {
    try {
      return await invoke<Project[]>('get_projects')
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      throw error
    }
  }

  /**
   * 创建项目
   */
  static async createProject(name: string): Promise<Project> {
    try {
      return await invoke<Project>('create_project', { name })
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    }
  }

  /**
   * 获取单个项目
   */
  static async getProject(id: number): Promise<Project> {
    try {
      return await invoke<Project>('get_project', { id })
    } catch (error) {
      console.error('Failed to fetch project:', error)
      throw error
    }
  }

  /**
   * 更新项目
   */
  static async updateProject(id: number, name: string): Promise<Project> {
    try {
      return await invoke<Project>('update_project', { id, name })
    } catch (error) {
      console.error('Failed to update project:', error)
      throw error
    }
  }

  /**
   * 删除项目
   */
  static async deleteProject(id: number): Promise<void> {
    try {
      await invoke('delete_project', { id })
    } catch (error) {
      console.error('Failed to delete project:', error)
      throw error
    }
  }

  // --- 统计相关 ---

  /**
   * 获取收集箱任务数量
   */
  static async getInboxCount(): Promise<number> {
    try {
      return await invoke<number>('get_inbox_count')
    } catch (error) {
      console.error('Failed to fetch inbox count:', error)
      throw error
    }
  }

  /**
   * 获取今日任务数量
   */
  static async getTodayCount(): Promise<number> {
    try {
      return await invoke<number>('get_today_count')
    } catch (error) {
      console.error('Failed to fetch today count:', error)
      throw error
    }
  }

  /**
   * 获取统计摘要
   */
  static async getSummary(): Promise<Summary> {
    try {
      return await invoke<Summary>('get_summary')
    } catch (error) {
      console.error('Failed to fetch summary:', error)
      throw error
    }
  }
}

export default TauriService
