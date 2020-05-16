import Layout from '@/views/appLayout/main.vue'

const appRouter = {
  path: '/',
  name: 'Project',
  component: Layout,
  children: [
    {
      path: 'app/:app_id',
      component: () => import('@/views/application/detail/index'),
      name: 'Application',
      meta: { title: '应用详情' }
    },
    {
      path: 'subsystem/:sys_id',
      component: () => import('@/views/application/productline/subsystem'),
      name: 'Subsystem',
      meta: { title: '业务系统' }
    }
  ]
}
export default appRouter
