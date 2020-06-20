import Layout from '@/views/appLayout/main.vue'

const formRouter = {
  path: '/form',
  name: 'form',
  component: Layout,
  children: [
    {
      path: 'list/:form_name/:form_id/flowchart',
      name: 'FlowChartForCurrentForm',
      meta: { title: '指定表单流程图' },
      component: () => import('@/flowChart/pages/view.vue')
    },
    {
      path: 'list/:form_name/flowchart',
      name: 'FlowChart',
      meta: { title: '通用表单流程图' },
      component: () => import('@/flowChart/pages/view.vue')
    },
    {
      path: 'list/:form_name',
      name: 'List',
      meta: { title: '表单列表' },
      component: () => import('@/views/form/list.vue')
    },
    {
      path: 'detail',
      name: 'Detail',
      meta: { title: '表单详情' },
      component: () => import('@/views/form/detail.vue')
    },
    {
      path: 'create/:form_name/:form_action',
      name: 'Create',
      meta: { title: '表单创建' },
      component: () => import('@/views/form/create.vue')
    },
    {
      path: 'logs/:form_id/:form_name',
      name: 'Logs',
      meta: { title: '日志' },
      component: () => import('@/views/form/log.vue')
    },
    {
      path: 'setup/list',
      name: 'SetupList',
      meta: { title: '表单列表' },
      component: () => import('@/views/form/setupList.vue')
    },
    {
      path: 'setup/:form_name',
      name: 'Setup',
      meta: { title: '表单设置' },
      component: () => import('@/views/form/setup.vue')
    },
    {
      path: 'result/:result_type',
      name: 'Result',
      meta: { title: '操作结果' },
      component: () => import('@/views/form/result.vue')
    }
  ]
}
export default formRouter
