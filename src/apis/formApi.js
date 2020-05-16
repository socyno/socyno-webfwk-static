import request from '../utils/request'

class FormApi {
  /**
   * 传formname构建请求对象
   * @param {string} formName
   */
  constructor(formName) {
    this.url = 'form'
    this.formName = formName
  }

  /**
   * 处理definetions
   * @param {object} res 入参传网络请求的res
   * @return 返回解析好queryclass和resultclass的结果
   */
  static processDefinetions(res) {
    var temp = []
    for (const item of res.data.queries) {
      item.queryClass = JSON.parse(item.formClass)
      item.resultClass = JSON.parse(item.resultClass)
      temp.push(item)
    }

    var actionTemp = []
    var submitActions = []

    for (const item of res.data.actions) {
      item.formClass = JSON.parse(item.formClass)
      item.resultClass = JSON.parse(item.resultClass)
      actionTemp.push(item)
      for (const actionKey of res.data.allownActions) {
        if (item.name === actionKey) {
          submitActions.push(item)
        }
      }
    }
    res.data.quickActions = submitActions
    res.data.queries = temp
    return res.data
  }
  /**
   * 拉取definitions
   * @returns 返回promise
   */
  loadDefinitions() {
    return request({
      url: `${this.url}/definition/${this.formName}`,
      method: 'get'
    })
      .then(res => {
        return Promise.resolve(FormApi.processDefinetions(res))
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
      url: `${this.url}/list/${this.formName}`,
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
      url: `${this.url}/list/${this.formName}/withTotal`,
      method: 'post',
      data: data
    })
  }
  /**
 * 根据fieldTypeKey获取options
 * @param {string} key fieldTypeKey
 * @param {string} keyword 筛选关键词
 */
  loadFormFieldOptions(key, keyword, formId) {
    return request({
      url: `${this.url}/field/${this.formName}/${key}/options`,
      method: 'get',
      params: { 'keyword': keyword, 'formName': this.formName, 'formId': formId }
    })
  }

  loadFormFieldOptionsWithQuery(key, keyword, formId, query) {
    return request({
      url: `${this.url}/field/${this.formName}/${key}/options/withQuery`,
      method: 'post',
      data: Object.assign({ 'keyword': keyword, 'formName': this.formName, 'formId': formId }, query)
    })
  }

  /**
 * 执行表单创建事件
 * @param {string} formAction formAction
 * @param {object} params 提交的post的data
 */
  postCreate(formAction, params) {
    return request({
      url: `${this.url}/create/${this.formName}/${formAction}`,
      method: 'post',
      data: params
    })
  }
}
export default FormApi
