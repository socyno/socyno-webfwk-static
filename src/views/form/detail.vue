<template>
  <div class="detail">
    <el-page-header class="common-page-header" :title="getPageHeaderTitle()" :content="headerPrefix + '详情信息'" @back="onGoBack" />
    <el-tabs v-model="currentTab" class="detail-tabs" type="card">
      <el-tab-pane v-if="formData" label="详情信息">
        <FormDetail ref="formDetail" :form-id="formId" :form-name="formName" :action-name="action" :rely-field="formData.formClass.properties" :rely-obj="formData" @submitForm="submitForm" @toAction="toAction" />
      </el-tab-pane>
      <el-tab-pane v-if="formData" label="备注">
        <Comments :data="commentsData" />
      </el-tab-pane>
      <el-tab-pane v-if="formData" label="日志">
        <Logs v-if="currentTab === '2'" />
      </el-tab-pane>
    </el-tabs>
    <!--
      当操作事件响应未 SimpleView 时，使用以下的弹窗进行展示
    -->
    <el-dialog
      :title="'详情信息'"
      :visible.sync="callbackViewVisable"
      width="80%"
      append-to-body
      @closed="onCallbackDialogClose"
    >
      <BaseFormDetailGenerator :columns="simpleViewFormClass" :detail-data="formData" />
    </el-dialog>
  </div>
</template>
<script>
import { Loading } from 'element-ui'
import FormApi from '@/apis/formApi'
import FormDetail from '../../components/BaseFormDetail/index'
import Comments from '../../components/BaseFormItem/Comments'
import BaseFormDetailGenerator from '../../components/BaseFormDetailGenerator/index'
import Logs from './log'
import tool from '@/utils/tools'
export default {
  components: { FormDetail, Comments, Logs, BaseFormDetailGenerator },
  data() {
    return {
      formId: this.$route.query.formId,
      formName: this.$route.query.formName,
      action: this.$route.query.action || '',
      formData: {
        form: {},
        actions: [],
        formClass: {}
      },
      headerPrefix: '',
      commentsData: [],
      callbackViewVisable: false,
      currentTab: '',
      simpleViewFormClass: null
    }
  },
  watch: {
    '$route'(to, from) {
      this.formName = to.query.formName
      this.formId = to.query.formId
      this.formApi = new FormApi(this.formName)
      this.formData = null
      this.loadFormData()
    }
  },
  created() {
    this.formApi = new FormApi(this.formName)
    this.loadFormData()
  },
  methods: {
    getPageHeaderTitle() {
      return history.length <= 1 && !tool.isFirefox() ? '关闭' : '返回'
    },
    onGoBack() {
      if (history.length <= 1 && !tool.isFirefox()) {
        window.close()
      } else {
        this.$router.replace({ path: '/form/list/' + this.$route.query.formName })
      }
    },
    onCallbackDialogClose() {
      this.loadFormData()
      this.socketObj.close()
    },
    loadFormData() {
      var loading = Loading.service({
        fullscreen: true
      })
      this.formApi.loadFormEntry(this.formId).then(detail => {
        this.formData = detail
      }).catch(e => {
        this.$message.error('请求失败' + e.message)
      }).finally(res => {
        loading.close()
      })
      this.formApi.loadComments(this.formName, this.formId).then(res => {
        this.commentsData = res.data
      })
    },
    toAction(actionName) {
      this.addParamsToLocation({ formId: this.formId, formName: this.formName, action: actionName })
    },
    addParamsToLocation(params) {
      history.replaceState(
        {},
        null,
        '#' + this.$route.path +
      '?' +
      Object.keys(params)
        .map(key => {
          return (
            encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
          )
        })
        .join('&')
      )
    },
    submitForm(reslut) {
      // var loadObj = Loading.service({
      //   fullscreen: true
      // })
      this.$refs.formDetail.isSubmitting = true
      this.formApi.postTrigger(this.formName, reslut.action, { form: reslut.formData, message: reslut.message }).then(res => {
        // loadObj.close()
        this.$refs.formDetail.dialogActionVisible = false
        this.$refs.formDetail.isSubmitting = false

        setTimeout(() => {
          this.$message.success('操作成功')
        }, 200)

        if (res.data && res.data.eventResultViewType) { // jump to event
          if (res.data.eventResultViewType === 'SimpleView') {
            this.simpleViewFormClass = res.data.formClass
            this.relyObj = res.data.form
            this.callbackViewVisable = true
            return
          }
          var lct = this.$router.resolve({ path: '/form/result/' + res.data.eventResultViewType, query: { arg: window.$encodeResultPageArg(res.data) }})
          window.open(lct.href, '_blank')
        } else {
          this.loadFormData()
        }
      }).catch(e => {
        this.$refs.formDetail.isSubmitting = false
        this.$message.error('操作失败' + e.message)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.detail {
  .detail-tabs {
    background: #fff;
  }
}
</style>
