import TauriService from './tauriService'
import type { Project } from '@/types/project'

export class ProjectService {
  static async getProjects(): Promise<Project[]> {
    return TauriService.getProjects()
  }

  static async createProject(name: string): Promise<Project> {
    return TauriService.createProject(name)
  }

  static async updateProject(id: number, name: string): Promise<Project> {
    return TauriService.updateProject(id, name)
  }

  static async deleteProject(id: number): Promise<void> {
    return TauriService.deleteProject(id)
  }

  static async getProject(id: number): Promise<Project> {
    return TauriService.getProject(id)
  }
}

export default ProjectService
