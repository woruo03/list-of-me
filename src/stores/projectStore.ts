import { defineStore } from 'pinia'
import type { Project } from '@/types/project'
import ProjectService from '@/services/projectService'
import { useUIStore } from './uiStore'

export const useProjectStore = defineStore('projects', {
  state: () => ({
    projects: [] as Project[],
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchProjects() {
      this.isLoading = true
      this.error = null

      try {
        this.projects = await ProjectService.getProjects()
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取项目失败'
        console.error('Failed to fetch projects:', error)
      } finally {
        this.isLoading = false
      }
    },

    async createProject(name: string) {
      this.isLoading = true
      this.error = null
      const uiStore = useUIStore()

      try {
        const project = await ProjectService.createProject(name)
        this.projects.push(project)
        uiStore.addNotification({ type: 'success', message: '项目已创建' })
        return project
      } catch (error) {
        this.error = error instanceof Error ? error.message : '创建项目失败'
        uiStore.addNotification({ type: 'error', message: this.error })
        console.error('Failed to create project:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateProject(id: number, name: string) {
      this.isLoading = true
      this.error = null
      const uiStore = useUIStore()

      try {
        const project = await ProjectService.updateProject(id, name)
        const index = this.projects.findIndex((p) => p.id === id)
        if (index !== -1) this.projects[index] = project
        uiStore.addNotification({ type: 'success', message: '项目已更新' })
        return project
      } catch (error) {
        this.error = error instanceof Error ? error.message : '更新项目失败'
        uiStore.addNotification({ type: 'error', message: this.error })
        console.error('Failed to update project:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteProject(id: number) {
      this.isLoading = true
      this.error = null
      const uiStore = useUIStore()
      const previous = [...this.projects]
      this.projects = this.projects.filter((p) => p.id !== id)

      try {
        await ProjectService.deleteProject(id)
        uiStore.addNotification({ type: 'success', message: '项目已删除' })
      } catch (error) {
        this.projects = previous
        this.error = error instanceof Error ? error.message : '删除项目失败'
        uiStore.addNotification({ type: 'error', message: this.error })
        console.error('Failed to delete project:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async getProject(id: number) {
      try {
        return await ProjectService.getProject(id)
      } catch (error) {
        console.error('Failed to fetch project:', error)
        throw error
      }
    },
  },

  getters: {
    projectMap: (state) => {
      return state.projects.reduce(
        (map, project) => {
          map[project.id] = project
          return map
        },
        {} as Record<number, Project>,
      )
    },

    projectNameById: (state) => {
      return (projectId: number | null) => {
        if (!projectId) return '收集箱'
        const project = state.projects.find((p) => p.id === projectId)
        return project?.name || '未知项目'
      }
    },
  },
})
