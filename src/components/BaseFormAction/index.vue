<template>
  <div>
    <el-page-header
      class="common-page-header"
      title="关闭"
      :content="formTitle"
      @back="onFormActionCancel"
    />
    <BaseFormEditor
      v-if="formData"
      :editable="editable"
      :form-name="formName"
      :form-id="formId"
      :form-model="formModel"
      :form-data="formData"
      @input="submitFormAction"
      @cancel="onFormActionCancel"
    />
  </div>
</template>

<script>
import tool from '@/utils/tools'
import { Loading } from 'element-ui'
import FormApi from '@/apis/formApi'
import BaseFormEditor from '@/components/BaseFormEditor'
import { fixNoPlacementCompatibility } from '@/utils/formUtils'
export default {
  components: {
    BaseFormEditor
  },
  data() {
    return {
      formId: null,
      formApi: null,
      formData: null,
      formActon: null,
      formModel: null,
      formTitle: ''
    }
  },
  methods: {
    /**
     * 触发指定的表单事件
     * @param {String} action
     */
    trigger(formName, formAction, formId, formData) {
      this.editable = true
      this.formId = formId
      this.formName = formName
      this.formApi = new FormApi(formName)
      this.formData = tool.jsonCopy(formData || {})
      this.formAction = tool.jsonCopy(formAction)
      this.formModel = this.formAction.formClass
      /**
       * eventFormType == NULL 意味着事件无需显示表单页面
       */
      if (tool.toUpper(this.formAction.eventFormType) === 'NULL') {
        this.submitFormAction({})
        return
      }
      this.setActionFormTitle()
      if (!tool.isNull(this.formAction.messageRequired)) {
        // true必填备注 false选填 null不显示备注输入框
        this.formAction.formClass.properties._message = {
          type: 'string',
          title: '说明/意见',
          fieldType: 'TEXT',
          fieldTypeKey: '',
          fieldOptionsType: 'NULL',
          readonly: false,
          position: 999999999 // 确保显示在表单的最下方
        }
      }
      if (!this.formAction.formClass.required) {
        this.formAction.formClass.required = []
      }
      if (this.formAction.messageRequired) {
        this.formAction.formClass.required.push('_message')
      }
      /* 为兼容 placement 出现之前的默认事件表单样式，为设置的统一使用整行 */
      fixNoPlacementCompatibility(this.formAction.formClass)
      if (this.formAction.prepareRequired) {
        var loading = Loading.service({ fullscreen: true })
        this.formApi.loadActionPrepareData(this.formId, this.formAction.name).then(data => {
          Object.assign(this.formData, data || {})
          this.$emit('prepare', data, this.formName, this.formId, this.formAction, this.formData)
        }).finally(res => {
          loading.close()
        })
      } else {
        this.$emit('prepare', null, this.formName, this.formId, this.formAction, this.formData)
      }
    },

    /**
     * 提交事件表单，入参为表单内容
     * @param {Object} params
     */
    submitFormAction(params) {
      if (!params) {
        return
      }
      if (this.formAction.confirmRequired) {
        this.$confirm('请确认是否进行此操作?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this._submitFormAction(params)
        })
      } else {
        this._submitFormAction(params)
      }
    },

    /**
     * 提交操作事件表单内容
     * @param {Object} reslut
     */
    _submitFormAction(params) {
      var message = params._message
      params.id = this.formData.id
      params.revision = this.formData.revision
      var loading = Loading.service({ fullscreen: true })
      this.formApi.triggerAction(this.formAction.name, { form: params, message: message }).then((data) => {
        var eventResultType = ''
        if (data) {
          eventResultType = tool.toLower(data.eventResultViewType)
        }
        this.$nextTick(function() {
          this.$notify.success(eventResultType === 'messageview' ? data.message : '操作成功')
          this.$emit('commit', data, this.formName, this.formId, this.formAction, this.formData)
        })
        if (!data || tool.isBlank(eventResultType) || eventResultType === 'messageview') {
          return
        }
        if (eventResultType === 'simpleview') {
          this.editable = false
          this.formData = data.form
          this.formModel = data.formClass
          return
        }
        // console.log('跳转到结果展示页面：', data)
        var resultPage = this.$router.resolve({
          path: '/form/result/' + tool.encodeURI(data.eventResultViewType),
          query: { arg: window.$encodeResultPageArg(data) }
        })
        window.open(resultPage.href, '_blank')
      }).finally(res => {
        loading.close()
      })
    },

    /**
     * 事件取消的回调方法
     */
    onFormActionCancel() {
      this.$emit('cancel', this.formName, this.formId, this.formAction, this.formData)
    },

    /**
     *  设置当前操作表单的标题
     */
    setActionFormTitle() {
      var title = null
      if (this.formAction) {
        if (this.formAction.display) {
          title = this.formAction.display
        }
      }
      var summary = null
      if (this.formData) {
        if (this.formData.summary) {
          summary = this.formData.summary
        } else if (this.formData.id) {
          summary = tool.leftPad(this.formData.id, 8, 0)
        }
      }
      title = tool.stringify(title)
      if (!tool.isNullOrUndef(summary)) {
        title = title + ' - ' + summary
      }
      this.formTitle = title
    }
  }
}
</script>

<style>
</style>