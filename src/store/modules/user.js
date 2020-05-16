import docCookies from '@/utils/cookies'
import { logout } from '@/apis/common'
import router from '@/router'
import tool from '@/utils/tools'

const tokenContentKey = 'socyno_webfwk_session_token_content'
const tokenHeaderKey = 'socyno_webfwk_session_token_header'
const baseApiUrlKey = 'socyno_webfwk_base_api_url'
const state = {
  info: {}
}
const getters = {
  getTokenContent: (state) => () => {
    return localStorage.getItem(tokenContentKey)
  },
  getTokenHeader: (state) => () => {
    return localStorage.getItem(tokenHeaderKey)
  },
  getBaseApiUrl: (state) => () => {
    return tool.remove(/[\s\/]+$/, sessionStorage.getItem(baseApiUrlKey)) +
                '/' + tool.remove(/(^[\s\/]+|[\s\/]+$)/, process.env.BASE_APIURL) + '/'
  }
}

const actions = {
  logout({ dispatch }) {
    logout().then(res => {
      dispatch('staticLogout')
    }).catch(res => {
      dispatch('staticLogout')
    })
  },
  staticLogout({ commit }) {
    docCookies.clear()
    localStorage.clear()
    commit('setUserInfo', {})
    router.push('/login')
  },
  sysInitialize({ commit }) {
    router.push('/init')
  },
  initUserInfo({ commit }) {
    var tokenStr = localStorage.getItem(tokenContentKey)
    if (tokenStr) {
      var jwt = require('jsonwebtoken')
      var decodedToken = jwt.decode(tokenStr)
      commit('setUserInfo', decodedToken)
    }
  },
  setUserByToken({ commit }, jmtoken) {
    var jwt = require('jsonwebtoken')
    localStorage.setItem(tokenContentKey, jmtoken)
    docCookies.setItem(tokenContentKey, jmtoken, 3 * 24 * 3600)
    var decodedToken = jwt.decode(jmtoken)
    commit('setUserInfo', decodedToken)
  },
  setTokenHeader({ commit }, tokenHeader) {
    localStorage.setItem(tokenHeaderKey, tokenHeader)
    commit('setTokenHeader', tokenHeader)
  }
}
const mutations = {
  setUserInfo(state, newValue) {
    state.info = newValue
  },
  setTokenHeader(state, newValue) {
    state.tokenHeader = newValue
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
