import request from '../utils/request'

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function info() {
  return request({
    url: `/sys/info`,
    method: 'get'
  })
}

export function initialize(data) {
  return request({
    url: `/sys/init`,
    method: 'post',
    data: data
  })
}

export function login(username, password, proxied, token) {
  return request({
    url: `/user/login`,
    method: 'post',
    data: {
      username, password, proxied, token
    }
  })
}

export function getTodoList() {
  return request({
    url: 'user/todo/opend/list',
    method: 'get'
  })
}

export function getTodoCount() {
  return request({
    url: 'user/todo/opened/total',
    method: 'get'
  })
}

export function getTodoListCreated(data) {
  return request({
    url: 'user/todo/created/list',
    method: 'get',
    params: data
  })
}

export function getTodoListClosed(data) {
  return request({
    url: 'user/todo/closed/list',
    method: 'get',
    params: data
  })
}
