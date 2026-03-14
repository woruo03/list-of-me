# List of Me - 个人任务管理应用

一个基于 Tauri + Vue 3 + TypeScript 构建的现代化桌面任务管理应用，采用 GTD（Getting Things Done）方法论设计。

## ✨ 功能特性

### 📋 核心功能
- **任务管理**：创建、编辑、删除任务，支持标题、描述、截止日期、优先级、标签等
- **项目管理**：将任务组织到项目中，支持项目进度跟踪
- **智能视图**：
  - 📥 收集箱：快速捕获新想法和任务
  - 📅 今日：显示今天到期的任务
  - 📁 项目：按项目组织任务
  - ✅ 已完成：查看已完成的任务
- **任务筛选与排序**：按状态、项目、优先级、截止日期等筛选和排序
- **搜索功能**：全文搜索任务标题、描述和备注

### 🎨 用户体验
- **响应式设计**：适配桌面和移动端
- **暗色/亮色主题**：支持主题切换
- **实时更新**：任务状态变更即时同步
- **键盘快捷键**：提高操作效率
- **本地存储**：数据安全存储在本地SQLite数据库

### 🔧 技术特性
- **离线优先**：完全离线工作，无需网络连接
- **自动更新**：内置应用更新机制
- **系统通知**：任务到期提醒
- **数据备份**：支持数据导出/导入
- **多平台支持**：Windows、macOS、Linux

## 🚀 快速开始

### 系统要求
- Node.js 18+ 或更高版本
- Rust 1.70+（用于Tauri构建）
- pnpm 8+（推荐包管理器）

### 安装与运行

1. **克隆仓库**
   ```bash
   git clone https://github.com/woruo03/list-of-me.git
   cd list-of-me
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **开发模式运行**
   ```bash
   pnpm tauri dev
   ```

4. **构建应用**
   ```bash
   pnpm tauri build
   ```

### 打包为Arch Linux包

项目包含PKGBUILD文件，可用于构建Arch Linux包：

```bash
makepkg -si
```

## 📁 项目结构

```
list-of-me/
├── src/                    # Vue前端源代码
│   ├── components/        # Vue组件
│   │   ├── layout/       # 布局组件
│   │   ├── projects/     # 项目相关组件
│   │   ├── tasks/        # 任务相关组件
│   │   └── ui/           # UI通用组件
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia状态管理
│   ├── services/         # API服务层
│   ├── types/            # TypeScript类型定义
│   ├── utils/            # 工具函数
│   └── views/            # 页面视图
├── src-tauri/            # Tauri后端源代码
│   ├── src/              # Rust源代码
│   │   ├── commands.rs   # Tauri命令
│   │   ├── db.rs         # 数据库操作
│   │   ├── models.rs     # 数据模型
│   │   └── ...
│   └── tauri.conf.json   # Tauri配置
├── package.json          # 前端依赖和脚本
├── vite.config.ts        # Vite配置
├── tsconfig.json         # TypeScript配置
└── PKGBUILD             # Arch Linux打包配置
```

## 🛠️ 技术栈

### 前端
- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript超集
- **Pinia** - Vue状态管理
- **Vue Router** - 路由管理
- **Tailwind CSS** - 实用优先的CSS框架
- **DaisyUI** - Tailwind CSS组件库

### 后端
- **Tauri** - 使用Rust构建小型、快速的桌面应用
- **SQLite** - 轻量级嵌入式数据库
- **Rust** - 系统编程语言

### 开发工具
- **Vite** - 下一代前端构建工具
- **pnpm** - 快速、节省磁盘空间的包管理器
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化

## 📦 构建与部署

### 开发构建
```bash
pnpm build
```

### Tauri构建
```bash
pnpm tauri build
```

### 支持的平台
- Windows (x64)
- macOS (x64, ARM64)
- Linux (x64, ARM64)
- Android (实验性支持)
- iOS (实验性支持)

## 🔌 API接口

应用通过Tauri命令提供以下API：

### 项目管理
- `create_project` - 创建新项目
- `get_projects` - 获取所有项目
- `get_project` - 获取单个项目
- `update_project` - 更新项目
- `delete_project` - 删除项目

### 任务管理
- `create_task` - 创建新任务
- `get_tasks` - 获取任务列表
- `get_task` - 获取单个任务
- `update_task` - 更新任务
- `delete_task` - 删除任务

### 统计功能
- `get_summary` - 获取任务统计摘要
- `get_today_tasks` - 获取今日任务
- `get_upcoming_tasks` - 获取即将到期的任务

## 🤝 贡献

欢迎提交Issue和Pull Request！

1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系

- GitHub: [@woruo03](https://github.com/woruo03)
- 项目主页: [https://github.com/woruo03/list-of-me](https://github.com/woruo03/list-of-me)

## 🙏 致谢

- [Tauri](https://tauri.app/) - 优秀的桌面应用框架
- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用的CSS框架
- 所有贡献者和用户
