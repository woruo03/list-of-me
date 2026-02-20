pub mod commands;
pub mod db;
pub mod error;
pub mod models;
pub mod notifications;
pub mod shortcuts;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {}
