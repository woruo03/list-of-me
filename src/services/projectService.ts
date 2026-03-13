import TauriService from './tauriService';
import type { Project, ProjectCreate, ProjectUpdate } from '@/types/project';
import TaskService from './taskService';

export class ProjectService {
  // 获取项目列表
  static async getProjects(): Promise<Project[]> {
    return TauriService.getProjects();
  }
  
  // 创建项目
  static async createProject(projectData: ProjectCreate): Promise<Project> {
    return TauriService.createProject(projectData.name);
  }
  
  // 更新项目
  static async updateProject(id: number, update: ProjectUpdate): Promise<Project> {
    return TauriService.updateProject(id, update.name || '');
  }
  
  // 删除项目
  static async deleteProject(id: number): Promise<void> {
    return TauriService.deleteProject(id);
  }
  
  // 获取单个项目
  static async getProject(id: number): Promise<Project> {
    return TauriService.getProject(id);
  }
  
  // 获取项目统计信息
  static async getProjectStats(projectId: number) {
    const tasks = await TaskService.getProjectTasks(projectId);
    
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      doing: tasks.filter(t => t.status === 'doing').length,
      done: tasks.filter(t => t.status === 'done').length,
    };
  }
  
  // 获取所有项目统计
  static async getAllProjectsStats() {
    const projects = await this.getProjects();
    const statsPromises = projects.map(async (project) => {
      const stats = await this.getProjectStats(project.id);
      return {
        ...project,
        ...stats,
      };
    });
    
    return Promise.all(statsPromises);
  }
}

export default ProjectService;