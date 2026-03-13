// 状态枚举
enum Status {
  Todo = 'todo',
  Doing = 'doing',
  Done = 'done',
}

// 任务接口
interface Task {
  id: number
  project_id: number | null
  title: string
  description: string | null
  status: Status
  due_at: string | null // ISO 8601 UTC 字符串
  notes: string | null
  created_at: string
  updated_at: string
}

// 项目接口
interface Project {
  id: number
  name: string
}

// 任务创建参数
interface TaskCreate {
  project_id?: number | null
  title: string
  description?: string | null
  status: Status
  due_at?: string | null
  notes?: string | null
}

// 任务更新参数（所有字段可选）
interface TaskUpdate {
  project_id?: number | null | undefined
  title?: string
  description?: string | null | undefined
  status?: Status
  due_at?: string | null | undefined
  notes?: string | null | undefined
}

// 任务过滤条件
interface TaskFilter {
  project_id?: number | null | undefined // Some(None) 表示 Inbox (NULL)
  status?: Status
}

// 统计摘要
interface Summary {
  inbox_count: number
  today_count: number
}

export type { Status, Task, Project, TaskCreate, TaskUpdate, TaskFilter, Summary }
