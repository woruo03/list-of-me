import { defineStore } from 'pinia';
import { invoke } from '@tauri-apps/api/core';
import type { Project, ProjectCreate, ProjectUpdate } from '@/types/project';

export const useProjectStore = defineStore('projects', {
  state: () => ({
    projects: [] as Project[],
    isLoading: false,
    error: null as string | null,
  }),
  
  actions: {
    // 获取项目列表
    async fetchProjects() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const projects = await invoke<Project[]>('get_projects');
        this.projects = projects;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取项目失败';
        console.error('Failed to fetch projects:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    // 创建项目
    async createProject(projectData: ProjectCreate) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const project = await invoke<Project>('create_project', { 
          name: projectData.name 
        });
        this.projects.push(project);
        return project;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '创建项目失败';
        console.error('Failed to create project:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    // 更新项目
    async updateProject(id: number, update: ProjectUpdate) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const project = await invoke<Project>('update_project', { 
          id, 
          name: update.name || '' 
        });
        const index = this.projects.findIndex(p => p.id === id);
        if (index !== -1) {
          this.projects[index] = project;
        }
        return project;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '更新项目失败';
        console.error('Failed to update project:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    // 删除项目
    async deleteProject(id: number) {
      this.isLoading = true;
      this.error = null;
      
      try {
        await invoke('delete_project', { id });
        this.projects = this.projects.filter(p => p.id !== id);
      } catch (error) {
        this.error = error instanceof Error ? error.message : '删除项目失败';
        console.error('Failed to delete project:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    // 获取单个项目
    async getProject(id: number) {
      try {
        return await invoke<Project>('get_project', { id });
      } catch (error) {
        console.error('Failed to fetch project:', error);
        throw error;
      }
    },
  },
  
  getters: {
    // 项目统计
    projectStats: (state) => {
      return state.projects.map(project => ({
        ...project,
        taskCount: 0, // TODO: 需要从任务store获取
      }));
    },
    
    // 项目映射
    projectMap: (state) => {
      return state.projects.reduce((map, project) => {
        map[project.id] = project;
        return map;
      }, {} as Record<number, Project>);
    },
  },
});