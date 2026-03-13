import { defineStore } from 'pinia'
import { invoke } from '@tauri-apps/api/core'
import type { Task, TaskCreate, TaskUpdate, TaskFilter, Status } from '@/types/task'
import type { Project } from '@/types/project'

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [] as Task[],
    projects: [] as Project[],
    currentFilter: {} as TaskFilter,
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    // 获取任务列表
    async fetchTasks(filter?: TaskFilter) {
      this.isLoading = true
      this.error = null

      try {
        const tasks = await invoke<Task[]>('get_tasks', {
          filter: filter || this.currentFilter,
        })
        this.tasks = tasks
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取任务失败'
        console.error('Failed to fetch tasks:', error)
      } finally {
        this.isLoading = false
      }
    },

    // 创建任务
    async createTask(taskData: TaskCreate) {
      this.isLoading = true
      this.error = null

      try {
        const task = await invoke<Task>('create_task', { task: taskData })
        this.tasks.unshift(task)
        return task
      } catch (error) {
        this.error = error instanceof Error ? error.message : '创建任务失败'
        console.error('Failed to create task:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 更新任务
    async updateTask(id: number, update: TaskUpdate) {
      this.isLoading = true
      this.error = null

      try {
        const task = await invoke<Task>('update_task', { id, update })
        const index = this.tasks.findIndex((t) => t.id === id)
        if (index !== -1) {
          this.tasks[index] = task
        }
        return task
      } catch (error) {
        this.error = error instanceof Error ? error.message : '更新任务失败'
        console.error('Failed to update task:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 删除任务
    async deleteTask(id: number) {
      this.isLoading = true
      this.error = null

      try {
        await invoke('delete_task', { id })
        this.tasks = this.tasks.filter((t) => t.id !== id)
      } catch (error) {
        this.error = error instanceof Error ? error.message : '删除任务失败'
        console.error('Failed to delete task:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 切换任务状态
    async toggleTaskStatus(id: number) {
      const task = this.tasks.find((t) => t.id === id)
      if (!task) return

      // 切换状态：todo -> doing -> done -> todo
      let newStatus: Status
      if (task.status === 'todo') newStatus = 'doing'
      else if (task.status === 'doing') newStatus = 'done'
      else newStatus = 'todo'

      return this.updateTask(id, { status: newStatus })
    },

    // 获取项目列表
    async fetchProjects() {
      try {
        const projects = await invoke<Project[]>('get_projects')
        this.projects = projects
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      }
    },

    // 设置筛选条件
    setFilter(filter: TaskFilter) {
      this.currentFilter = filter
    },

    // 清除筛选条件
    clearFilter() {
      this.currentFilter = {}
    },
  },

  getters: {
    // 收集箱任务
    inboxTasks: (state) => {
      return state.tasks.filter((t) => t.project_id === null && t.status !== 'done')
    },

    // 今日任务
    todayTasks: (state) => {
      return state.tasks.filter((t) => {
        if (!t.due_at || t.status === 'done') return false
        const dueDate = new Date(t.due_at)
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        return dueDate < tomorrow
      })
    },

    // 已完成任务
    completedTasks: (state) => {
      return state.tasks.filter((t) => t.status === 'done')
    },

    // 按项目筛选的任务
    tasksByProjectId: (state) => {
      return (projectId: number | null) => {
        return state.tasks.filter((t) => t.project_id === projectId)
      }
    },

    // 获取项目名称
    projectNameById: (state) => {
      return (projectId: number | null) => {
        if (!projectId) return '收集箱'
        const project = state.projects.find((p) => p.id === projectId)
        return project?.name || '未知项目'
      }
    },

    // 统计信息
    stats: (state) => {
      return {
        total: state.tasks.length,
        inbox: state.tasks.filter((t) => t.project_id === null && t.status !== 'done').length,
        today: state.tasks.filter((t) => {
          if (!t.due_at || t.status === 'done') return false
          const dueDate = new Date(t.due_at)
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          tomorrow.setHours(0, 0, 0, 0)
          return dueDate < tomorrow
        }).length,
        completed: state.tasks.filter((t) => t.status === 'done').length,
      }
    },
  },
})
