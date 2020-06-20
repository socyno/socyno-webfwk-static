<template>
  <div class="form-instance-creator">
    <el-page-header
      title="关闭"
      class="common-page-header"
      :content="formTitle"
      @back="$router.go(-1)"
    />
    <BaseFormEditor
      v-if="actionModel"
      :form-name="formName"
      :form-data="actionData"
      :form-model="actionModel.formClass"
      @input="submitFormAction"
      @cancel="closeActionForm"
    />
  </div>
</template>
<script>
import tool from '@/utils/tools'
import FormApi from '@/apis/formApi'
import { fixNoPlacementCompatibility } from '@/utils/formUtils'
import BaseFormEditor from '@/components/BaseFormEditor'
export default {
  components: {
    BaseFormEditor
  },
  data() {
    return {
      formName: '',
      formAction: '',
      formApi: null,
      formTitle: '创建',
      actionModel: null,
      actionData: null
    }
  },
  mounted() {
    this.formName = this.$route.params.form_name
    this.formAction = this.$route.params.form_action
    this.formApi = new FormApi(this.formName)
    var loading = this.$loading({ lock: true, text: 'Loading' })
    this.formApi.loadDefinition().then((data) => {
      var actionIndex = tool.inArray(this.formAction, data.quickActions, function(a, v) {
        return a.name === v
      })
      if (actionIndex < 0) {
        this.$message.error('当前操作不存在或未经授权')
        return
      }
      var actionModel = data.quickActions[actionIndex]
      /* 为兼容 placement 出现之前的默认事件表单样式，为设置的统一使用整行 */
      fixNoPlacementCompatibility(actionModel.formClass)
      this.formTitle = `${data.title} / ${actionModel.display}`
      tool.title(this.formTitle, true)
      return Promise.resolve(actionModel)
    }).then((actionModel) => {
      if (!actionModel.prepareRequired) {
        this.actionModel = actionModel
        loading.close()
        return
      }
      this.formApi.loadActionPrepareData(-1, actionModel.name, this.$route.query)
        .then(data => {
          this.actionData = data || {}
          this.actionModel = actionModel
        })
        .finally(res => {
          loading.close()
        })
    }).catch((e) => {
      loading.close()
      return Promise.reject(e)
    })
  },
  methods: {
    submitFormAction(params) {
      if (!params) {
        return
      }
      var loading = this.$loading({
        lock: true,
        text: 'Loading'
      })
      this.formApi.triggerAction(this.formAction, params).then(res => {
        this.$message.success('提交成功')
        this.closeActionForm()
      }).finally(res => {
        loading.close()
      })
    },
    closeActionForm() {
      this.$router.go(-1)
    }
  }
}
</script>
<style lang='scss'>
  .form-instance-creator {
  }
</style>
