export enum Status {
  Todo = 'todo',
  Doing = 'doing',
  Done = 'done',
}

export interface Task {
  id: number
  project_id: number | null
  title: string
  description: string | null
  status: Status
  due_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface TaskCreate {
  project_id?: number | null
  title: string
  description?: string | null
  status: Status
  due_at?: string | null
  notes?: string | null
}

export interface TaskUpdate {
  project_id?: number | null | undefined
  title?: string
  description?: string | null | undefined
  status?: Status
  due_at?: string | null | undefined
  notes?: string | null | undefined
  clear_due_at?: boolean
}

export interface TaskFilter {
  project_id?: number | null | undefined
  status?: Status
}
