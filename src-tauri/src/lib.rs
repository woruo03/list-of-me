pub mod commands;
pub mod db;
pub mod error;
pub mod models;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {}
