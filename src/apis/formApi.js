import tool from '../utils/tools.js'
import request from '../utils/request'
import * as formUtil from '../utils/formUtils'

class FormApi {
  /**
   * 传formname构建请求对象
   * @param {string} formName
   */
  constructor(formName) {
    if (tool.isBlank(formName)) {
      throw new Error('Form name is required')
    }
    this.formName = formName
  }

  /**
   * 获取当前的表单名称
   */
  getFormName() {
    return this.formName
  }

  /**
   * 处理definetions
   * @param {object} res 入参传网络请求的res
   * @return 返回解析好queryclass和resultclass的结果
   */
  static serverFormDefinetionCheck(definition) {
    if (!definition || tool.isBlank(definition.formClass) || tool.isUndefOrNull(definition.name) || tool.isUndefOrNull(definition.queries)) {
      throw new Error('Invalid form definition data responsed')
    }

    for (var q = definition.queries.length - 1; q >= 0; q--) {
      var query = definition.queries[q]
      query.formClass = FormApi.serverFormClassCheck(query.formClass)
      query.resultClass = FormApi.serverFormClassCheck(query.resultClass)
      definition.queries[q] = query
    }

    if (definition.actions) {
      for (var a = definition.actions.length - 1; a >= 0; a--) {
        definition.actions[a] = FormApi.serverFormActionCheck(definition.actions[a])
      }
    }

    if (definition.otherActions) {
      for (var o = definition.otherActions.length - 1; o >= 0; o--) {
        definition.otherActions[o] = FormApi.serverFormActionCheck(definition.otherActions[o])
      }
    }
    definition.formClass = FormApi.serverFormClassCheck(definition.formClass)
    return definition
  }

  static serverFormClassCheck(formClass) {
    return formUtil.parseFormClass(formClass)
  }

  /**
   * 解析并检查请求到的流程事件定义
   */
  static serverFormActionCheck(action) {
    action.formClass = FormApi.serverFormClassCheck(action.formClass)
    action.resultClass = FormApi.serverFormClassCheck(action.resultClass)
    action.formClass.eventFormType = action.eventFormType
    action.resultClass.eventFormType = action.eventFormType
    return action
  }

  /**
   * 解析并检查请求到的流程表单详情数据
   */
  static serverFormDetailCheck(detail) {
    if (!detail || !tool.isString(detail.formClass) || !tool.isPlainObject(detail.form)) {
      throw new Error('Invalid form detail data responsed')
    }
    detail.formClass = FormApi.serverFormClassCheck(detail.formClass)
    if (tool.isArray(detail.actions) && detail.actions.length > 0) {
      for (var i = detail.actions.length - 1; i >= 0; i--) {
        detail.actions[i] = FormApi.serverFormActionCheck(detail.actions[i])
      }
    }
    return detail
  }

  /**
   * 获取指定表单事件的定义
   * @returns 返回 promise
   */
  loadAction(formAction) {
    if (tool.isBlank(formAction)) {
      throw new Error('Form action is required.')
    }
    return request({
      url: `form/get/${this.formName}/actions/${formAction}`,
      method: 'get'
    }).then(res => {
      return Promise.resolve(FormApi.serverFormActionCheck(res.data))
    }).catch(res => {
      return Promise.reject(res)
    })
  }

  /**
   * 查询流程表单的详情数据及其定义
   */
  loadDetail(formId) {
    if (!tool.looksLikeInteger(formId)) {
      throw new Error('Invalid form id provided : ' + formId)
    }
    return request({
      url: `/form/get/${this.formName}/${formId}/withActions`,
      method: 'get'
    })
      .then(res => {
        return Promise.resolve(FormApi.serverFormDetailCheck(res.data))
      })
      .catch(res => {
        return Promise.reject(res)
      })
  }

  /**
   * 执行表达流程表单的事件
   */
  postTrigger(formAction, data) {
    return request({
      url: `/form/trigger/${this.formName}/${formAction}`,
      method: 'post',
      data: data
    })
  }

  /**
   * 获取流程单的备注（讨论）列表
   */
  loadComments(formName, formId, fromId) {
    return request({
      url: `/form/comments/${this.formName}/${formId}?fromId=${tool.stringify(fromId)}`,
      method: 'get'
    })
  }

  /**
   * 获取流程表单的定义信息
   */
  loadDefinition() {
    return request({
      url: `form/definition/${this.formName}`,
      method: 'get'
    })
      .then(res => {
        return Promise.resolve(FormApi.serverFormDefinetionCheck(res.data))
      })
      .catch(res => {
        return Promise.reject(res)
      })
  }

  /**
   * 获取指定的界面视图模型
   */
  loadViewAttributes(formViewKey) {
    return request({
      url: `/form/setup/${formViewKey}/viewattrs`,
      method: 'get'
    })
      .then(res => {
        if (res.data && !tool.isString(res.data)) {
          return Promise.reject(res)
        }
        return Promise.resolve(res.data ? JSON.parse(res.data) : [])
      })
      .catch(res => {
        return Promise.reject(res)
      })
  }

  /**
   * 保存指定的界面视图模型数据
   */
  saveViewAttributes(formViewKey, formViewData) {
    return request({
      url: `/form/setup/${formViewKey}/viewattrs/update`,
      method: 'post',
      data: formViewData
    })
  }

  /**
   * 保存表单的关联视图模型清单
   */
  loadExtraViewNames() {
    return request({
      url: `/form/setup/${this.formName}/extraviews`,
      method: 'get'
    })
      .then(res => {
        if (res.data && !tool.isArray(res.data)) {
          return Promise.reject(res)
        }
        return Promise.resolve(res.data || [])
      })
      .catch(res => {
        return Promise.reject(res)
      })
  }

  /**
   * 保存表单的关联视图模型清单
   */
  saveExtraViewNames(extraViewNames) {
    return request({
      url: `/form/setup/${this.formName}/extraviews/update`,
      method: 'post',
      data: extraViewNames
    })
  }

  /**
   * 获取指定名称的视图界面模型数据
   */
  loadViewDefinition(formViewKey) {
    return request({
      url: `/form/view/${formViewKey}/construction`,
      method: 'get'
    })
      .then(res => {
        if (!tool.isString(res.data)) {
          return Promise.reject(res)
        }
        return Promise.resolve(FormApi.serverFormClassCheck(res.data))
      })
      .catch(res => {
        return Promise.reject(res)
      })
  }

  /**
   * 查询表单列表数据，结果集中包含查询结果的总条数
   * @param {object} params
   */
  queryFormPagedData(params, withTotal) {
    return request({
      url: `form/list/${this.formName} ${withTotal ? '/withTotal' : ''}`,
      method: 'post',
      data: params
    })
      .then((res) => {
        if (!res.data || !tool.isNumber(res.data.page) ||
             !tool.isNumber(res.data.limit) ||
             (res.data.list && !tool.isArray(res.data.list))) {
          return Promise.reject(res)
        }
        return Promise.resolve(res.data)
      })
  }

  /**
   * 根据fieldTypeKey获取options
   * @param {string} key fieldTypeKey
   * @param {string} keyword 筛选关键词
   */
  loadFormFieldOptionsWithQuery(key, keyword, formId, query) {
    return request({
      url: `form/field/${this.formName}/${key}/options/withQuery`,
      method: 'post',
      data: Object.assign({
        'keyword': keyword,
        'formName': this.formName,
        'formId': formId
      }, query)
    })
  }

  /**
   * 加载事件的预装配数据
   * @param {Object} formId
   * @param {Object} formAction
   */
  loadActionPrepareData(formId, formAction) {
    if (!tool.looksLikeInteger(formId) || tool.isBlank(formAction)) {
      throw new Error('IllegalArguments: the form id invalid or action is missing')
    }
    return request({
      url: `/form/prepare/${this.formName}/${formId}/${formAction}`,
      method: 'get'
    }).then((res) => {
      return Promise.resolve(res.data)
    })
  }
}
export default FormApi
