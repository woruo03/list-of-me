// 项目接口
interface Project {
  id: number
  name: string
  description?: string
  color?: string
  created_at?: string
  updated_at?: string
}

// 项目创建参数
interface ProjectCreate {
  name: string
  description?: string
  color?: string
}

// 项目更新参数
interface ProjectUpdate {
  name?: string
  description?: string | null
  color?: string | null
}

// 项目统计
interface ProjectStats {
  id: number
  name: string
  task_count: number
  todo_count: number
  doing_count: number
  done_count: number
}

export type { Project, ProjectCreate, ProjectUpdate, ProjectStats }
