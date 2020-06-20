import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/index'
import tool from './utils/tools'
import enums from './utils/enums'
import ElementUI from 'element-ui'
import { Base64 } from 'js-base64'
import 'element-ui/lib/theme-chalk/index.css'

Vue.prototype.$enums = enums
Vue.config.productionTip = false

/**
     * result arg 编码
     * @param {object} eventResult eventResult参数
     * @return {string} 编码后的arg参数
     */
window.$encodeResultPageArg = function(eventResult) {
  return Base64.encode(JSON.stringify(eventResult))
}

Vue.use(ElementUI)
Vue.prototype.$jian = {
  'tool': tool
}
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
