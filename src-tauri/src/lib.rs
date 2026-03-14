pub mod commands;
pub mod db;
pub mod error;
pub mod models;
pub mod notifications;
pub mod shortcuts;

use crate::db::Database;
use crate::error::CommandError;
use tauri::{AppHandle, Manager};

/// 应用启动时的初始化设置
fn setup(app: &AppHandle) -> Result<(), CommandError> {
    // 初始化数据库并注册到状态管理
    let db = Database::new(app)?;
    app.manage(db);

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        // 注册插件
        .plugin(tauri_plugin_opener::init())
        // 设置应用启动钩子
        .setup(|app| {
            // 执行初始化设置
            if let Err(e) = setup(app.handle()) {
                eprintln!("应用初始化失败: {}", e);
                return Err(e.into());
            }
            Ok(())
        })
        // 注册所有命令
        .invoke_handler(tauri::generate_handler![
            // 项目管理命令 (5个)
            commands::create_project,
            commands::get_projects,
            commands::get_project,
            commands::update_project,
            commands::delete_project,
            
            // 任务管理命令 (5个)
            commands::create_task,
            commands::get_tasks,
            commands::get_task,
            commands::update_task,
            commands::delete_task,
            
            // 统计命令 (3个)
            commands::get_inbox_count,
            commands::get_today_count,
            commands::get_summary,
        ])
        // 运行应用
        .run(tauri::generate_context!())
        .expect("运行 Tauri 应用时出错");
}
