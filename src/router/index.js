import Vue from 'vue'
import Router from 'vue-router'
import formRouter from './modules/form'
import Layout from '@/views/appLayout/main.vue'
import userRouter from './modules/user'
import appRouter from './modules/project'
import store from '@/store'
import tool from '@/utils/tools.js'

Vue.use(Router)

export const defaultRouters = [{
  path: '/',
  component: Layout,
  redirect: '/dashboard',
  children: [
    {
      path: 'dashboard',
      component: () => import('@/views/index/index'),
      name: 'Dashboard',
      meta: { title: '首页' }
    }
  ]
},
{
  path: '/index',
  component: Layout,
  children: [
    {
      path: '/',
      component: () => import('@/views/index/index'),
      name: 'Index',
      meta: { title: '首页' }
    },
    {
      path: '/dev',
      component: () => import('@/views/dev'),
      name: 'Dev',
      meta: { title: 'Dev' }
    }
  ]
},
{
  path: '/init',
  component: () => import('@/views/init'),
  name: 'Initialize',
  meta: { title: '系統初始化' }
},
{
  path: '/login',
  component: () => import('@/views/login/index'),
  name: 'Login',
  meta: { title: '登录' }
},
{
  path: '*',
  component: Layout,
  redirect: '/404',
  children: [{
    path: '404',
    component: () => import('@/views/errorPage/404'),
    name: '404',
    props: true,
    meta: { title: '404' }
  }]
}]

const RouterConfig = {
  routes: [...defaultRouters, formRouter, userRouter, appRouter]
}

const router = new Router(RouterConfig)

export default router

router.beforeEach((to, from, next) => {
  if (to.name === 'Login' && from.name !== 'Login' && !to.query.redirect) { // 跳登录把redirect页面带过去
    next({ path: '/Login', query: { redirect: from.fullPath }})
    return
  }

  if (to.name === 'Dashboard') {
    store.commit('uiControl/setCurrentMenuInit')
  }
  document.title = tool.title(to.meta.title || to.query.name, true)
  next()
})
