import { createRouter, createWebHashHistory } from 'vue-router'

const Editor = () => import('@/views/editor/Editor.vue')
const Play = () => import('@/views/play/Play.vue')

const routes = [
  {
    path: '/',
    redirect: '/editor',
  },
  {
    path: '/editor',
    name: 'editor',
    component: Editor,
    meta: {
      title: 'threejs编辑器',
    },
  },
  {
    path: '/play',
    name: 'play',
    component: Play,
    meta: {
      title: 'threejs查看器',
    },
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return {
        top: 0,
      }
    }
  },
})

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

export default router
