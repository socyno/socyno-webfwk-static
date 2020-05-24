<template>
  <div class="detail">
    <el-tabs v-model="currentTab" class="detail-tabs" type="card">
      <el-tab-pane v-if="formDetail" label="详情信息">
        <FormDetail
          ref="formDetail"
          :form-id="formId"
          :form-name="formName"
          :action-name="action"
          :form-detail="formDetail"
          @submitForm="submitForm"
          @toAction="toAction"
        />
      </el-tab-pane>
      <el-tab-pane v-if="formDetail" label="备注">
        <Comments :data="commentsData" />
      </el-tab-pane>
      <el-tab-pane v-if="formDetail" label="日志">
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
    >
      <BaseFormDetailGenerator :columns="simpleViewFormClass" :detail-data="formDetail" />
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
export default {
  components: { FormDetail, Comments, Logs, BaseFormDetailGenerator },
  data() {
    return {
      formId: this.$route.query.formId,
      formName: this.$route.query.formName,
      action: this.$route.query.action || '',
      formDetail: null,
      headerPrefix: '',
      commentsData: [],
      callbackViewVisable: false,
      currentTab: '',
      simpleViewFormClass: null
    }
  },
  watch: {
    '$route'(to, from) {
      this.formDetail = null
      this.formId = to.query.formId
      this.formName = to.query.formName
      this.formApi = new FormApi(this.formName)
      this.loadFormData()
    }
  },
  created() {
    this.formApi = new FormApi(this.formName)
    this.loadFormData()
  },
  methods: {
    loadFormData() {
      var loading = Loading.service({
        fullscreen: true
      })
      this.formApi.loadDetail(this.formId).then(detail => {
        this.formDetail = detail
      }).catch(e => {
        this.$message.error('请求失败' + e.message)
        return Promise.reject(e)
      }).finally(res => {
        loading.close()
      })
      this.formApi.loadComments(this.formName, this.formId).then(res => {
        this.commentsData = res.data
      })
    },
    toAction(actionName) {
      var params = {
        formId: this.formId,
        formName: this.formName,
        action: actionName
      }
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
      var loading = Loading.service({
        fullscreen: true
      })
      this.formApi.postTrigger(reslut.action, {
        form: reslut.formData,
        message: reslut.message
      }).then(res => {
        setTimeout(() => {
          this.$message.success('操作成功')
        }, 200)
        if (this.$jian.tool.isFunction(reslut.onSuccess)) {
          reslut.onSuccess()
        }
        if (res.data && res.data.eventResultViewType) {
          if (res.data.eventResultViewType === 'SimpleView') {
            this.simpleViewFormClass = res.data.formClass
            this.relyObj = res.data.form
            this.callbackViewVisable = true
            return
          }
          var lct = this.$router.resolve({ path: '/form/result/' + res.data.eventResultViewType, query: { arg: window.$encodeResultPageArg(res.data) }})
          window.open(lct.href, '_blank')
          return
        }
        this.loadFormData()
      }).catch(e => {
        this.$message.error('操作失败' + e.message)
      }).finally(res => {
        loading.close()
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
