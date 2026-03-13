import TauriService from './tauriService'
import type { Task, TaskCreate, TaskUpdate, TaskFilter } from '@/types/task'
import { Status } from '@/types/task'
import type { Summary } from '@/types/api'

const getTomorrowStart = () => {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow
}

export class TaskService {
  static async getTasks(filter?: TaskFilter): Promise<Task[]> {
    return TauriService.getTasks(filter)
  }

  static async createTask(taskData: TaskCreate): Promise<Task> {
    return TauriService.createTask(taskData)
  }

  static async updateTask(id: number, update: TaskUpdate): Promise<Task> {
    return TauriService.updateTask(id, update)
  }

  static async deleteTask(id: number): Promise<void> {
    return TauriService.deleteTask(id)
  }

  static async getTask(id: number): Promise<Task> {
    return TauriService.getTask(id)
  }

  static async getInboxTasks(): Promise<Task[]> {
    const filter: TaskFilter = { project_id: null }
    return this.getTasks(filter)
  }

  static async getCompletedTasks(): Promise<Task[]> {
    const filter: TaskFilter = { status: Status.Done }
    return this.getTasks(filter)
  }

  static async getProjectTasks(projectId: number): Promise<Task[]> {
    const filter: TaskFilter = { project_id: projectId }
    return this.getTasks(filter)
  }

  static async getTodayTasks(): Promise<Task[]> {
    const allTasks = await this.getTasks()
    const tomorrow = getTomorrowStart()

    return allTasks.filter((task) => {
      if (!task.due_at || task.status === Status.Done) return false
      const dueDate = new Date(task.due_at)
      return dueDate < tomorrow
    })
  }

  static async toggleTaskStatus(id: number, currentStatus: Status): Promise<Task> {
    let newStatus: Status
    if (currentStatus === Status.Todo) newStatus = Status.Doing
    else if (currentStatus === Status.Doing) newStatus = Status.Done
    else newStatus = Status.Todo

    return this.updateTask(id, { status: newStatus })
  }

  static async moveToToday(taskId: number): Promise<Task> {
    const today = new Date()
    today.setHours(23, 59, 0, 0)
    const dueAt = today.toISOString()
    return this.updateTask(taskId, { due_at: dueAt })
  }

  static async getSummary(): Promise<Summary> {
    return TauriService.getSummary()
  }

  static async getStats(): Promise<{ inbox: number; today: number }> {
    const [inboxCount, todayCount] = await Promise.all([
      TauriService.getInboxCount(),
      TauriService.getTodayCount(),
    ])

    return {
      inbox: inboxCount,
      today: todayCount,
    }
  }
}

export default TaskService
