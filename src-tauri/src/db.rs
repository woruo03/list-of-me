use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use rusqlite::{Connection, params};
use std::fs;
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

use crate::models::{Project, Status, Task};

// SQL Constants
const SQL_CREATE_PROJECTS_TABLE: &str = "
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        is_system BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );";

const SQL_CREATE_TASKS_TABLE: &str = "
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        due_at DATETIME,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );";

const SQL_INSERT_PROJECT: &str = "INSERT INTO projects (name, is_system) VALUES (?, ?)";

const SQL_SELECT_PROJECTS: &str = "SELECT id, name, is_system, created_at, updated_at FROM projects ORDER BY is_system DESC, name ASC";

const SQL_SELECT_PROJECT_BY_ID: &str =
    "SELECT id, name, is_system, created_at, updated_at FROM projects WHERE id = ?";

const SQL_UPDATE_PROJECT: &str =
    "UPDATE projects SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";

const SQL_DELETE_PROJECT: &str = "DELETE FROM projects WHERE id = ? AND is_system = 0";

const SQL_INSERT_TASK: &str = "INSERT INTO tasks (project_id, title, description, status, due_at, notes) VALUES (?, ?, ?, ?, ?, ?)";

const SQL_SELECT_TASKS_BASE: &str = "SELECT id, project_id, title, description, status, due_at, notes, created_at, updated_at FROM tasks WHERE 1=1";

const SQL_SELECT_TASK_BY_ID: &str = "SELECT id, project_id, title, description, status, due_at, notes, created_at, updated_at FROM tasks WHERE id = ?";

const SQL_DELETE_TASK: &str = "DELETE FROM tasks WHERE id = ?";

const SQL_COUNT_INBOX_TASKS: &str =
    "SELECT COUNT(*) FROM tasks WHERE project_id IS NULL AND status != 'done'";

const SQL_COUNT_TODAY_TASKS: &str =
    "SELECT COUNT(*) FROM tasks WHERE date(due_at) <= date('now') AND status != 'done'";

pub struct Database {
    pub conn: Mutex<Connection>,
}

#[derive(serde::Deserialize)]
pub struct TaskCreate {
    pub project_id: Option<i64>,
    pub title: String,
    pub description: Option<String>,
    pub status: Status,
    pub due_at: Option<DateTime<Utc>>,
    pub notes: Option<String>,
}

#[derive(serde::Deserialize)]
pub struct TaskUpdate {
    pub project_id: Option<i64>,
    pub title: Option<String>,
    pub description: Option<String>,
    pub status: Option<Status>,
    pub due_at: Option<DateTime<Utc>>,
    pub notes: Option<String>,
}

#[derive(serde::Deserialize, Default)]
pub struct TaskFilter {
    pub project_id: Option<Option<i64>>, // Some(None) means Inbox (NULL)
    pub status: Option<Status>,
}

pub struct Summary {
    pub inbox_count: i64,
    pub today_count: i64,
}

impl Database {
    pub fn new(app_handle: &AppHandle) -> Result<Self> {
        let app_dir = app_handle
            .path()
            .app_data_dir()
            .context("Failed to get app data directory")?;

        if !app_dir.exists() {
            fs::create_dir_all(&app_dir).context("Failed to create app data directory")?;
        }

        let db_path = app_dir.join("list-of-me.db");
        let conn = Connection::open(db_path).context("Failed to open database")?;

        let db = Self {
            conn: Mutex::new(conn),
        };

        db.init_tables()?;
        Ok(db)
    }

    fn init_tables(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();

        conn.execute(SQL_CREATE_PROJECTS_TABLE, [])?;
        conn.execute(SQL_CREATE_TASKS_TABLE, [])?;

        Ok(())
    }

    // --- Project Management ---

    pub fn create_project(&self, name: &str, is_system: bool) -> Result<Project> {
        let conn = self.conn.lock().unwrap();
        conn.execute(SQL_INSERT_PROJECT, params![name, is_system])?;

        let id = conn.last_insert_rowid();
        self.get_project_with_conn(&conn, id)
    }

    pub fn get_projects(&self) -> Result<Vec<Project>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(SQL_SELECT_PROJECTS)?;
        let project_iter = stmt.query_map([], |row| {
            Ok(Project {
                id: row.get(0)?,
                name: row.get(1)?,
                is_system: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })?;

        let mut projects = Vec::new();
        for project in project_iter {
            projects.push(project?);
        }
        Ok(projects)
    }

    pub fn get_project(&self, id: i64) -> Result<Project> {
        let conn = self.conn.lock().unwrap();
        self.get_project_with_conn(&conn, id)
    }

    fn get_project_with_conn(&self, conn: &Connection, id: i64) -> Result<Project> {
        conn.query_row(SQL_SELECT_PROJECT_BY_ID, [id], |row| {
            Ok(Project {
                id: row.get(0)?,
                name: row.get(1)?,
                is_system: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
        .context("Project not found")
    }

    pub fn update_project(&self, id: i64, name: &str) -> Result<Project> {
        let conn = self.conn.lock().unwrap();
        conn.execute(SQL_UPDATE_PROJECT, params![name, id])?;
        self.get_project_with_conn(&conn, id)
    }

    pub fn delete_project(&self, id: i64) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(SQL_DELETE_PROJECT, [id])?;
        Ok(())
    }

    // --- Task Management ---

    pub fn create_task(&self, task: TaskCreate) -> Result<Task> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            SQL_INSERT_TASK,
            params![
                task.project_id,
                task.title,
                task.description,
                task.status.as_str(),
                task.due_at,
                task.notes
            ],
        )?;

        let id = conn.last_insert_rowid();
        self.get_task_with_conn(&conn, id)
    }

    pub fn get_tasks(&self, filter: TaskFilter) -> Result<Vec<Task>> {
        let conn = self.conn.lock().unwrap();
        let mut query = SQL_SELECT_TASKS_BASE.to_string();
        let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

        if let Some(project_id_opt) = filter.project_id {
            match project_id_opt {
                Some(id) => {
                    query.push_str(" AND project_id = ?");
                    params.push(Box::new(id));
                }
                None => {
                    query.push_str(" AND project_id IS NULL");
                }
            }
        }

        if let Some(status) = filter.status {
            query.push_str(" AND status = ?");
            params.push(Box::new(status.as_str().to_string()));
        }

        query.push_str(" ORDER BY created_at DESC");

        let mut stmt = conn.prepare(&query)?;
        let task_iter = stmt.query_map(rusqlite::params_from_iter(params), |row| {
            let status_str: String = row.get(4)?;

            Ok(Task {
                id: row.get(0)?,
                project_id: row.get(1)?,
                title: row.get(2)?,
                description: row.get(3)?,
                status: Status::from(status_str.as_str()),
                due_at: row.get(5)?,
                notes: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })?;

        let mut tasks = Vec::new();
        for task in task_iter {
            tasks.push(task?);
        }
        Ok(tasks)
    }

    pub fn get_task(&self, id: i64) -> Result<Task> {
        let conn = self.conn.lock().unwrap();
        self.get_task_with_conn(&conn, id)
    }

    fn get_task_with_conn(&self, conn: &Connection, id: i64) -> Result<Task> {
        conn.query_row(SQL_SELECT_TASK_BY_ID, [id], |row| {
            let status_str: String = row.get(4)?;

            Ok(Task {
                id: row.get(0)?,
                project_id: row.get(1)?,
                title: row.get(2)?,
                description: row.get(3)?,
                status: Status::from(status_str.as_str()),
                due_at: row.get(5)?,
                notes: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .context("Task not found")
    }

    pub fn update_task(&self, id: i64, update: TaskUpdate) -> Result<Task> {
        let conn = self.conn.lock().unwrap();

        let mut sets = Vec::new();
        let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

        if let Some(title) = update.title {
            sets.push("title = ?");
            params.push(Box::new(title));
        }
        if let Some(description) = update.description {
            sets.push("description = ?");
            params.push(Box::new(description));
        }
        if let Some(status) = update.status {
            sets.push("status = ?");
            params.push(Box::new(status.as_str().to_string()));
        }
        if let Some(due_at) = update.due_at {
            sets.push("due_at = ?");
            params.push(Box::new(due_at));
        }
        if let Some(notes) = update.notes {
            sets.push("notes = ?");
            params.push(Box::new(notes));
        }
        if let Some(project_id) = update.project_id {
            sets.push("project_id = ?");
            params.push(Box::new(project_id));
        }

        if !sets.is_empty() {
            sets.push("updated_at = CURRENT_TIMESTAMP");
            let query = format!("UPDATE tasks SET {} WHERE id = ?", sets.join(", "));
            params.push(Box::new(id));
            conn.execute(&query, rusqlite::params_from_iter(params))?;
        }

        self.get_task_with_conn(&conn, id)
    }

    pub fn delete_task(&self, id: i64) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(SQL_DELETE_TASK, [id])?;
        Ok(())
    }

    // --- Statistics ---

    pub fn get_inbox_count(&self) -> Result<i64> {
        let conn = self.conn.lock().unwrap();
        let count: i64 = conn.query_row(SQL_COUNT_INBOX_TASKS, [], |row| row.get(0))?;
        Ok(count)
    }

    pub fn get_today_count(&self) -> Result<i64> {
        let conn = self.conn.lock().unwrap();
        let count: i64 = conn.query_row(SQL_COUNT_TODAY_TASKS, [], |row| row.get(0))?;
        Ok(count)
    }

    pub fn get_summary(&self) -> Result<Summary> {
        Ok(Summary {
            inbox_count: self.get_inbox_count()?,
            today_count: self.get_today_count()?,
        })
    }
}
