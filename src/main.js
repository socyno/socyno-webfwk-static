import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/index'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.config.productionTip = false

/**
     * result arg 编码
     * @param {object} eventResult eventResult参数
     * @return {string} 编码后的arg参数
     */
window.$encodeResultPageArg = function(eventResult) {
  return btoa(JSON.stringify(eventResult))
}

Vue.use(ElementUI)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
