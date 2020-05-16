<template>
  <div class="event-callback">
    <el-page-header class="common-page-header" title="关闭" :content="callbackDetailData.title || '操作详情'" @back="onGoBack" />
    <BaseFormDetailGenerator :columns="callbackDetailData" :detail-data="socketMessages[socketMessages.length - 1]" :wsmessages="socketMessages" />
  </div>
</template>
<script>
import BaseFormDetailGenerator from '@/components/BaseFormDetailGenerator/index'
import { CommonWebSocket } from '@/utils/webSocket'
export default {
  components: {
    BaseFormDetailGenerator
  },
  data() {
    return {
      socketMessages: [],
      callbackDetailData: {},
      socketObj: {}
    }
  },
  mounted() {
    var obj = JSON.parse(atob(this.$route.query.arg))
    switch (obj.eventResultViewType) {
      case 'WebSocketViewLink':
        this.sokectConnection(obj.url, obj.parameters)
        break
      case 'FormCreateLink':
        this.$router.push({ path: `/form/create/${obj.formName}/${obj.formEvent}` })
        break
      case 'FormEventLink':
        this.$router.push({ path: `/form/detail/`, query: { formId: obj.formId, formName: obj.formName }})
        break
      case 'FormViewLink':
        this.$router.push({ path: `/form/detail/`, query: { formId: obj.formId, formName: obj.formName }})
        break
    }
  },
  beforeDestroy() {
    try {
      this.socketObj.close()
    } catch (error) {
      return
    }
  },
  methods: {
    sokectConnection(url, params) {
      const that = this
      that.callbackViewVisable = true
      CommonWebSocket(url, function(msg, ws, isOnOpen) {
        if (isOnOpen) {
          that.socketMessages = []
          that.socketObj = ws
          ws.send(params)
        }
        if (msg && msg.length) {
          var socketRet = null

          try {
            socketRet = JSON.parse(msg)

            if (socketRet.status === 204) {
              that.socketObj.close()
              return true
            }

            if (socketRet.status !== 0) {
              that.socketObj.close()
              return socketRet.message
            }

            if (Object.keys(that.callbackDetailData).length <= 0) { // 取第一条
              try {
                that.callbackDetailData = JSON.parse(socketRet.data.formClass)

                if (socketRet.data.singleResponse) {
                  that.socketObj.close()
                }
              } catch (error) {
                that.socketObj.close()
                that.$alert('页面解析错误, 未找到formClass').then(res => window.close())
                // eslint-disable-next-line
                console.error('解析columns错误:', error)
              }
            }
            if (that.socketMessages.length >= 300) {
              that.socketMessages = []
            }
            if (Object.keys(that.callbackDetailData).length > 0) {
              that.socketMessages.push(socketRet.data)
            }
          } catch (error) {
            // eslint-disable-next-line
            console.error('socket解析失败:', error)
          }
          return true
        }
      })
    },
    onGoBack() {
      window.close()
    }
  }
}
</script>
<style>

</style>
