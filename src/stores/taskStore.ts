import { defineStore } from 'pinia'
import TaskService from '@/services/taskService'
import type { Task, TaskCreate, TaskUpdate, TaskFilter } from '@/types/task'
import { Status } from '@/types/task'
import type { Summary } from '@/types/api'
import { useUIStore } from './uiStore'

export type TaskSort =
  | 'created_desc'
  | 'created_asc'
  | 'due_asc'
  | 'due_desc'
  | 'title_asc'
  | 'title_desc'

const applyFilter = (tasks: Task[], filter: TaskFilter) => {
  return tasks.filter((task) => {
    if (filter.project_id !== undefined) {
      if (filter.project_id === null && task.project_id !== null) return false
      if (typeof filter.project_id === 'number' && task.project_id !== filter.project_id)
        return false
    }
    if (filter.status !== undefined && task.status !== filter.status) return false
    return true
  })
}

const applySearch = (tasks: Task[], query: string) => {
  const trimmed = query.trim()
  if (!trimmed) return tasks
  const needle = trimmed.toLowerCase()
  return tasks.filter((task) => {
    return (
      task.title.toLowerCase().includes(needle) ||
      (task.description || '').toLowerCase().includes(needle) ||
      (task.notes || '').toLowerCase().includes(needle)
    )
  })
}

const applySort = (tasks: Task[], sort: TaskSort) => {
  const sorted = [...tasks]
  sorted.sort((a, b) => {
    if (sort === 'title_asc') return a.title.localeCompare(b.title)
    if (sort === 'title_desc') return b.title.localeCompare(a.title)

    if (sort === 'due_asc') {
      if (!a.due_at && !b.due_at) return 0
      if (!a.due_at) return 1
      if (!b.due_at) return -1
      return new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
    }

    if (sort === 'due_desc') {
      if (!a.due_at && !b.due_at) return 0
      if (!a.due_at) return 1
      if (!b.due_at) return -1
      return new Date(b.due_at).getTime() - new Date(a.due_at).getTime()
    }

    const aCreated = new Date(a.created_at).getTime()
    const bCreated = new Date(b.created_at).getTime()
    return sort === 'created_asc' ? aCreated - bCreated : bCreated - aCreated
  })
  return sorted
}

const getTomorrowStart = () => {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow
}

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [] as Task[],
    isLoading: false,
    error: null as string | null,
    userFilter: {} as TaskFilter,
    searchQuery: '',
    sort: 'created_desc' as TaskSort,
    selectedIds: [] as number[],
    focusedTaskId: null as number | null,
    summary: null as Summary | null,
  }),

  actions: {
    async fetchAll(filter?: TaskFilter) {
      this.isLoading = true
      this.error = null

      try {
        this.tasks = await TaskService.getTasks(filter)
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取任务失败'
        console.error('Failed to fetch tasks:', error)
        useUIStore().addNotification({ type: 'error', message: this.error })
      } finally {
        this.isLoading = false
      }
    },

    async refreshSummary() {
      try {
        this.summary = await TaskService.getSummary()
      } catch (error) {
        console.error('Failed to refresh summary:', error)
      }
    },

    async fetchTaskById(id: number) {
      const existing = this.tasks.find((task) => task.id === id)
      if (existing) return existing

      try {
        const task = await TaskService.getTask(id)
        const index = this.tasks.findIndex((item) => item.id === id)
        if (index >= 0) this.tasks[index] = task
        else this.tasks.unshift(task)
        return task
      } catch (error) {
        console.error('Failed to fetch task:', error)
        throw error
      }
    },

    async createTask(taskData: TaskCreate) {
      this.error = null
      const uiStore = useUIStore()

      try {
        const created = await TaskService.createTask(taskData)
        this.tasks.unshift(created)
        uiStore.addNotification({ type: 'success', message: '任务已创建' })
        return created
      } catch (error) {
        this.error = error instanceof Error ? error.message : '创建任务失败'
        uiStore.addNotification({ type: 'error', message: this.error })
        console.error('Failed to create task:', error)
        throw error
      }
    },

    async updateTask(id: number, update: TaskUpdate, options?: { optimistic?: boolean }) {
      this.error = null
      const uiStore = useUIStore()
      const optimistic = options?.optimistic !== false

      const index = this.tasks.findIndex((task) => task.id === id)
      if (index === -1) return

      const previous = { ...this.tasks[index] }
      if (optimistic) {
        this.tasks[index] = { ...this.tasks[index], ...update }
      }

      try {
        const updated = await TaskService.updateTask(id, update)
        this.tasks[index] = updated
        uiStore.addNotification({ type: 'success', message: '任务已更新' })
        return updated
      } catch (error) {
        if (optimistic) {
          this.tasks[index] = previous
        }
        this.error = error instanceof Error ? error.message : '更新任务失败'
        uiStore.addNotification({ type: 'error', message: this.error })
        console.error('Failed to update task:', error)
        throw error
      }
    },

    async deleteTask(id: number, options?: { optimistic?: boolean }) {
      this.error = null
      const uiStore = useUIStore()
      const optimistic = options?.optimistic !== false

      const previous = [...this.tasks]
      if (optimistic) {
        this.tasks = this.tasks.filter((task) => task.id !== id)
      }

      try {
        await TaskService.deleteTask(id)
        uiStore.addNotification({ type: 'success', message: '任务已删除' })
      } catch (error) {
        if (optimistic) this.tasks = previous
        this.error = error instanceof Error ? error.message : '删除任务失败'
        uiStore.addNotification({ type: 'error', message: this.error })
        console.error('Failed to delete task:', error)
        throw error
      }
    },

    async toggleTaskStatus(id: number) {
      const task = this.tasks.find((t) => t.id === id)
      if (!task) return

      let newStatus: Status
      if (task.status === Status.Todo) newStatus = Status.Doing
      else if (task.status === Status.Doing) newStatus = Status.Done
      else newStatus = Status.Todo

      return this.updateTask(id, { status: newStatus }, { optimistic: true })
    },

    async moveToToday(id: number) {
      const today = new Date()
      today.setHours(23, 59, 0, 0)
      const dueAt = today.toISOString()
      return this.updateTask(id, { due_at: dueAt }, { optimistic: true })
    },

    async moveToProject(id: number, projectId: number | null) {
      return this.updateTask(id, { project_id: projectId }, { optimistic: true })
    },

    async bulkUpdateStatus(ids: number[], status: Status) {
      for (const id of ids) {
        await this.updateTask(id, { status }, { optimistic: true })
      }
      this.clearSelection()
    },

    async bulkMoveToToday(ids: number[]) {
      for (const id of ids) {
        await this.moveToToday(id)
      }
      this.clearSelection()
    },

    async bulkMoveToProject(ids: number[], projectId: number | null) {
      for (const id of ids) {
        await this.moveToProject(id, projectId)
      }
      this.clearSelection()
    },

    async bulkDelete(ids: number[]) {
      for (const id of ids) {
        await this.deleteTask(id, { optimistic: true })
      }
      this.clearSelection()
    },

    setUserFilter(filter: TaskFilter) {
      this.userFilter = { ...filter }
    },

    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    setSort(sort: TaskSort) {
      this.sort = sort
    },

    toggleSelect(id: number) {
      if (this.selectedIds.includes(id)) {
        this.selectedIds = this.selectedIds.filter((value) => value !== id)
      } else {
        this.selectedIds = [...this.selectedIds, id]
      }
    },

    selectAll(ids: number[]) {
      this.selectedIds = [...new Set(ids)]
    },

    clearSelection() {
      this.selectedIds = []
    },

    setFocusedTask(id: number | null) {
      this.focusedTaskId = id
    },

    filterTasks(tasks: Task[]) {
      const filtered = applyFilter(tasks, this.userFilter)
      const searched = applySearch(filtered, this.searchQuery)
      return applySort(searched, this.sort)
    },
  },

  getters: {
    inboxTasks: (state) =>
      state.tasks.filter((t) => t.project_id === null && t.status !== Status.Done),

    todayTasks: (state) => {
      const tomorrow = getTomorrowStart()
      return state.tasks.filter((t) => {
        if (!t.due_at || t.status === Status.Done) return false
        const dueDate = new Date(t.due_at)
        return dueDate < tomorrow
      })
    },

    completedTasks: (state) => state.tasks.filter((t) => t.status === Status.Done),

    tasksByProjectId: (state) => {
      return (projectId: number) => state.tasks.filter((t) => t.project_id === projectId)
    },

    selectedCount: (state) => state.selectedIds.length,

    selectedTasks: (state) => state.tasks.filter((t) => state.selectedIds.includes(t.id)),

    isSelected: (state) => {
      return (taskId: number) => state.selectedIds.includes(taskId)
    },
  },
})
