use tauri::State;
use crate::db::Database;
use crate::models::*;
use crate::error::Result;

// --- Project Management Commands ---

#[tauri::command]
pub fn create_project(name: String, db: State<Database>) -> Result<Project> {
    Ok(db.create_project(&name)?)
}

#[tauri::command]
pub fn get_projects(db: State<Database>) -> Result<Vec<Project>> {
    Ok(db.get_projects()?)
}

#[tauri::command]
pub fn get_project(id: i64, db: State<Database>) -> Result<Project> {
    Ok(db.get_project(id)?)
}

#[tauri::command]
pub fn update_project(id: i64, name: String, db: State<Database>) -> Result<Project> {
    Ok(db.update_project(id, &name)?)
}

#[tauri::command]
pub fn delete_project(id: i64, db: State<Database>) -> Result<()> {
    Ok(db.delete_project(id)?)
}

// --- Task Management Commands ---

#[tauri::command]
pub fn create_task(task: TaskCreate, db: State<Database>) -> Result<Task> {
    Ok(db.create_task(task)?)
}

#[tauri::command]
pub fn get_tasks(filter: TaskFilter, db: State<Database>) -> Result<Vec<Task>> {
    Ok(db.get_tasks(filter)?)
}

#[tauri::command]
pub fn get_task(id: i64, db: State<Database>) -> Result<Task> {
    Ok(db.get_task(id)?)
}

#[tauri::command]
pub fn update_task(id: i64, update: TaskUpdate, db: State<Database>) -> Result<Task> {
    Ok(db.update_task(id, update)?)
}

#[tauri::command]
pub fn delete_task(id: i64, db: State<Database>) -> Result<()> {
    Ok(db.delete_task(id)?)
}

// --- Statistics Commands ---

#[tauri::command]
pub fn get_inbox_count(db: State<Database>) -> Result<i64> {
    Ok(db.get_inbox_count()?)
}

#[tauri::command]
pub fn get_today_count(db: State<Database>) -> Result<i64> {
    Ok(db.get_today_count()?)
}

#[tauri::command]
pub fn get_summary(db: State<Database>) -> Result<Summary> {
    Ok(db.get_summary()?)
}
