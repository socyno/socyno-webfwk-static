import request from '@/utils/request'

// 获取流程单的定义
export function getDefinition(formName) {
  return request({
    url: `/form/definition/${formName}`,
    method: 'get'
  })
}

// 查询流程单列表（使用默认查询）
export function getList(formName, data) {
  return request({
    url: `/form/list/${formName}`,
    method: 'post',
    data
  })
}

// 查询流程单列表（使用默认查询）
export function getListWithTotal(formName, data) {
  return request({
    url: `/form/list/${formName}/withTotal`,
    method: 'post',
    data
  })
}

// 查询流程单详情
export function getDateil(formName, formId) {
  return request({
    url: `/form/get/${formName}/${formId}`,
    method: 'get'
  })
}

// 查询流程单详情(返回当前可执行操作)
export function getDateilWithActions(formName, formId) {
  return request({
    url: `/form/get/${formName}/${formId}/withActions`,
    method: 'get'
  })
}

// 执行表单创建事件
export function create(formName, formAction, data) {
  return request({
    url: `/form/create/${formName}/${formAction}`,
    method: 'post',
    data
  })
}

// 获取预定义表单的结构数据
export function getConstruction(formTypeKey) {
  return request({
    url: `/form/form/${formTypeKey}/construction`,
    method: 'get'
  })
}

// 执行流程单事件(响应数据参照流程单的定义)
export function trigger(formName, formAction, data) {
  return request({
    url: `/form/trigger/${formName}/${formAction}`,
    method: 'post',
    data
  })
}

// 获取流程单的备注（讨论）列表
export function getComments(formName, formId) {
  return request({
    url: `/form/comments/${formName}/${formId}`,
    method: 'get'
  })
}

// 查询流程单列表（使用指定查询）
export function getListByQueryName(formName, queryName, data) {
  return request({
    url: `/form/list/${formName}/${queryName}`,
    method: 'post',
    data
  })
}

// 查询流程单列表（使用指定查询，同时提供数据集总条数）
export function getListByQNWithTotal(formName, queryName, data) {
  return request({
    url: `/form/list/${formName}/${queryName}/withTotal`,
    method: 'post',
    data
  })
}

// 获取流程单的操作记录
export function getLogs(formName, formId) {
  return request({
    url: `/form/logs/${formName}/${formId}`,
    method: 'get'
  })
}

// 获取可用的流程单指定操作的前后明细
export function getLogsDetail(formName, formId, detailId) {
  return request({
    url: `/form/logs/${formName}/${formId}/${detailId}/detail`,
    method: 'get'
  })
}

// 获取流程表单特定事件的执行前准备数据
export function getPrepareField(formName, formId, formAction) {
  return request({
    url: `/form/prepare/${formName}/${formId}/${formAction}`,
    method: 'get'
  })
}

// 获取所有的已注册通用流程单
export function getFormList() {
  return request({
    url: `/form/form/list`,
    method: 'get'
  })
}

// 注册通用流程单
export function addForm(data) {
  return request({
    url: `/form/form/add`,
    method: 'post',
    data
  })
}

// 修改通用流程单
export function updateForm(data) {
  return request({
    url: `/form/form/update`,
    method: 'post',
    data
  })
}

// 禁用/启动通用流程单
export function disabledForm(formName) {
  return request({
    url: `/form/form/toggle/${formName}`,
    method: 'post'
  })
}

// 删除通用流程单
export function deleteForm(formName) {
  return request({
    url: `/form/form/delete/${formName}`,
    method: 'post'
  })
}

// 获取显示/编辑界面的排版定义数据
export function getViewattrs(formName, formTypeKey) {
  return request({
    url: `/form/form/${formName}/${formTypeKey}/viewattrs`,
    method: 'get'
  })
}

// 检查或预览显示/编辑界面的排版定义数据
export function previewViewattrs(formName, formTypeKey, data) {
  return request({
    url: `/form/form/${formName}/${formTypeKey}/viewattrs/preview`,
    method: 'post',
    data
  })
}

// 更新显示/编辑界面的排版定义数据
export function updateViewattrs(formName, formTypeKey, data) {
  return request({
    url: `/form/form/${formName}/${formTypeKey}/viewattrs/update`,
    method: 'post',
    data
  })
}

// 获取关联的视图界面列表
export function getExtraviews(formName) {
  return request({
    url: `/form/form/${formName}/extraviews`,
    method: 'get'
  })
}

// 添加或更新关联的视图界面列表
export function updateExtraviews(formName, data) {
  return request({
    url: `/form/form/${formName}/extraviews/update`,
    method: 'post',
    data
  })
}

// 获取关联的视图界面配置列表
export function getExtraviewsDefinition(formName) {
  return request({
    url: `/form/form/${formName}/extraviews/definition`,
    method: 'get'
  })
}
