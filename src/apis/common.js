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

export function getTodoListClosed(data) {
  return request({
    url: 'user/mytodo/closed',
    method: 'get',
    params: data
  })
}

export function getTodoListCreated(data) {
  return request({
    url: 'user/mytodo/created',
    method: 'get',
    params: data
  })
}

export function getTodoList() {
  return request({
    url: 'user/mytodo/list',
    method: 'get'
  })
}

export function getTodoCount(data) {
  return request({
    url: 'user/mytodo/total',
    method: 'get'
  })
}
