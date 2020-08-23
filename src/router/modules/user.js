import Layout from '@/views/appLayout/main.vue'

const userRouter = {
  path: '/user',
  name: 'User',
  component: Layout,
  children: [
    {
      path: 'setting',
      component: () => import('@/views/user/setting/index'),
      name: 'Setting',
      meta: { title: '个人设置' }
    }
  ]
}
export default userRouter
