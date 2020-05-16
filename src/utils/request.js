import axios from 'axios'
import {
  Message
} from 'element-ui'
import store from '@/store'

// 创建axios实例
const service = axios.create({
  withCredentials: true, // 设置axios跨域
  timeout: 120000 // 请求超时时间
})

// request 拦截器
service.interceptors.request.use((config) => {
  config.baseURL = store.getters['user/getBaseApiUrl']()
  var tokenContent = store.getters['user/getTokenContent']()
  var tokenHeader = store.getters['user/getTokenHeader']()
  if (tokenHeader && tokenContent) {
    config.headers[tokenHeader] = tokenContent
  }
  return config
}, error => {
  if (error.message) {
    // 登录超时
    if (error.message === 'Network Error') {
      Message.error('网络错误，请检查你的网络')
    }
  }
  return Promise.reject(error)
})

// respone拦截器
service.interceptors.response.use((response) => {
  if (!response.data) {
    Message.error('请求响应异常: 响应状态 ' + response.status + ' - ' + response.statusText)
    return Promise.reject(response.data)
  }
  if (response.data.status === 401) {
    Message.error('未登录或已过期，请重新登录')
    store.dispatch('user/staticLogout')
  }
  if (response.data.status !== 0) {
    Message.error('请求响应异常: 响应状态 ' + (response.data.status || response.status) +
      ' - ' + (response.data.message || response.statusText))
    return Promise.reject(response.data)
  }
  return Promise.resolve(response.data)
}, (error) => {
  if (error.message) {
    // 登录超时
    if (error.message === 'Network Error') {
      Message.error('网络错误，请检查你的网络')
    }
  }
  return Promise.reject(error)
})

export default service
