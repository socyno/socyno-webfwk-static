import tool from '../utils/tools.js'
import request from '../utils/request'

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
   * 处理definetions
   * @param {object} res 入参传网络请求的res
   * @return 返回解析好queryclass和resultclass的结果
   */
  static serverFormDefinetionCheck(definition) {
    if (!definition || tool.isUndefOrNull(definition.name) || tool.isUndefOrNull(definition.queries)) {
      throw new Error('Invalid form definition data responsed')
    }

    for (var q = definition.queries.length - 1; q >= 0; q--) {
      var query = definition.queries[q]
      query.queryClass = FormApi.serverFormClassCheck(query.formClass)
      query.resultClass = FormApi.serverFormClassCheck(query.resultClass)
      definition.queries[q] = query
    }

    if (definition.actions) {
      for (var a = definition.actions.length - 1; a >= 0; a--) {
        definition.actions[a] = FormApi.serverFormActionCheck(definition.actions[a])
      }
    }
    return definition
  }

  static serverFormClassCheck(formClass) {
    formClass = JSON.parse(formClass)
    if (!formClass.properties) {
      return formClass
    }
    for (const fieldKey in formClass.properties) {
      var fieldDef = formClass.properties[fieldKey]
      // console.log(fieldDef)
      fieldDef.fieldType = tool.toLower(fieldDef.fieldType) || 'string'
    }
    return formClass
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
    if (!detail || tool.isUndefOrNull(detail.formClass) || tool.isUndefOrNull(detail.form)) {
      throw new Error('Invalid form detail data responsed')
    }
    detail.formClass = FormApi.serverFormClassCheck(detail.formClass)
    if (detail.actions && detail.actions.length > 0) {
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
   * 执行表单创建事件
   * @param {string} formAction formAction
   * @param {object} params 提交的post的data
   */
  postCreateAction(formAction, params) {
    return request({
      url: `form/create/${this.formName}/${formAction}`,
      method: 'post',
      data: params
    })
  }

  /**
   * 查询流程表单的详情数据及其定义
   */
  loadFormEntry(formId) {
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
  postTrigger(formName, formAction, data) {
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
   * 拉取列表
   * @param {object} data
   */
  loadFormList(data) {
    return request({
      url: `form/list/${this.formName}`,
      method: 'post',
      data: data
    })
  }
  /**
   * 拉取列表带数量
   * @param {object} data
   */
  loadFormListWithTotal(data) {
    return request({
      url: `form/list/${this.formName}/withTotal`,
      method: 'post',
      data: data
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
}
export default FormApi
