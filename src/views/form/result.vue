<template>
  <div v-if="formModel" class="event-callback">
    <el-page-header
      class="common-page-header"
      title="关闭"
      :content="formModel.title || '操作结果'"
      @back="onGoBack"
    />
    <BaseFormContent
      form-name="dynamic-websocket-form"
      :form-model="formModel"
      :default-data="lastFormData"
    />
  </div>
</template>
<script>
import tool from '@/utils/tools'
import { Base64 } from 'js-base64'
import { MessageBox } from 'element-ui'
import BaseFormContent from '@/components/BaseFormContent'
import { CommonWebSocket } from '@/utils/webSocket'
import { parseFormClass, getVisibleFieldModels } from '@/utils/formUtils'
export default {
  components: {
    BaseFormContent
  },
  data() {
    return {
      formModel: null,
      deltaFields: null,
      lastFormData: null,
      socketObj: null
    }
  },
  mounted() {
    var arg = this.$route.query.arg + ''
    if (arg.length >= 3 && arg.substring(0, 3) === 'ls:') {
      arg = sessionStorage.getItem(arg.substring(3))
    }
    var obj = null
    try {
      obj = JSON.parse(Base64.decode(arg))
    } catch (e) {
      MessageBox.alert('请求参数无法解析，请核实参数数据！', '入参错误', { 'type': 'error' })
      return
    }
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
          that.socketObj = ws
          ws.send(tool.isPlainObject(params) ? JSON.stringify(params) : params)
          return true
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
            /**
             * 当界面模型未定义时，将消息的第一条作为
             */
            if (!that.formModel) {
              try {
                that.deltaFields = []
                that.formModel = parseFormClass(socketRet.data.formClass)
                var fieldModels = getVisibleFieldModels(that.formModel)
                if (fieldModels && fieldModels.length > 0) {
                  for (const field of fieldModels) {
                    if (tool.toLower(field.fieldType) === 'textdelta') {
                      that.deltaFields.push(field)
                    }
                  }
                }
                // console.log('检索到的增量文本字段有：', that.deltaFields)
                return true
              } catch (error) {
                that.socketObj.close()
                that.$alert('界面视图模型解析失败').then(res => window.close())
                // eslint-disable-next-line
                console.error('界面视图模型解析失败：', error)
                return '界面视图模型解析失败'
              }
            }
            var newFormData = socketRet.data
            if (that.lastFormData && that.deltaFields) {
              for (const field of that.deltaFields) {
                newFormData[field.key] = tool.stringify(that.lastFormData[field.key]) +
                          '\n' + tool.stringify(newFormData[field.key])
                var textLines = newFormData[field.key].split(/[\r\n]+/)
                if (textLines && textLines.length > 1000) {
                  textLines = textLines.splice(0, textLines.length - 400)
                }
                newFormData[field.key] = textLines.join('\n')
              }
            }
            that.lastFormData = newFormData

            /**
             * 如果确认非持续性响应
             */
            if (socketRet.data.singleResponse) {
              that.socketObj.close()
              return true
            }
          } catch (error) {
            that.socketObj.close()
            // eslint-disable-next-line
            console.error('socket解析失败:', error)
            return false
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
