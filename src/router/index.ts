import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/inbox',
  },
  {
    path: '/inbox',
    name: 'Inbox',
    component: () => import('@/views/InboxView.vue'),
    meta: { title: '收集箱' },
  },
  {
    path: '/today',
    name: 'Today',
    component: () => import('@/views/TodayView.vue'),
    meta: { title: '今日' },
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('@/views/ProjectsView.vue'),
    meta: { title: '项目' },
  },
  {
    path: '/projects/:id',
    name: 'ProjectDetail',
    component: () => import('@/views/ProjectDetailView.vue'),
    meta: { title: '项目详情' },
  },
  {
    path: '/completed',
    name: 'Completed',
    component: () => import('@/views/CompletedView.vue'),
    meta: { title: '已完成' },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: '设置' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫：更新页面标题
router.beforeEach((to) => {
  const title = (to.meta.title as string) || 'List-of-Me'
  document.title = `${title} - List-of-Me`
})

export default router
