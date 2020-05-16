import request from '../utils/request'

export function syncVirtualAppInfo(applicationId) {
  // return
  return request({
    url: `/syncAppInfo/syncVirtualAppInfo/${applicationId}`,
    method: 'get'
  })
}

export function syncVirtualMachineAllAppInfo() {
  // return
  return request({
    url: `/syncAppInfo/syncVirtualMachineAllAppInfo`,
    method: 'get'
  })
}

export function syncAppK8sInfo(applicationId) {
  // return
  return request({
    url: `/syncAppInfo/syncAppK8sInfo/${applicationId}`,
    method: 'get'
  })
}

export function syncAllAppK8sInfo() {
  // return
  return request({
    url: `/syncAppInfo/syncAllAppK8sInfo`,
    method: 'get'
  })
}
