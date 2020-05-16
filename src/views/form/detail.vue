<template>
  <div class="detail">
    <el-page-header class="common-page-header" :title="getPageHeaderTitle()" :content="headerPrefix + '详情信息'" @back="onGoBack" />
    <el-tabs v-model="currentTab" class="detail-tabs" type="card">
      <el-tab-pane v-if="relyObj" label="详情信息">
        <FormDetail ref="formDetail" :form-id="formId" :form-name="formName" :action-name="action" :rely-field="relyField" :rely-obj="relyObj" @submitForm="submitForm" @toAction="toAction" />
      </el-tab-pane>
      <el-tab-pane v-if="relyObj" label="备注">
        <Comments :data="commentsData" />
      </el-tab-pane>
      <el-tab-pane v-if="relyObj" label="日志">
        <Logs v-if="currentTab === '2'" />
      </el-tab-pane>
    </el-tabs>
    <el-dialog
      :title="'详情信息'"
      :visible.sync="callbackViewVisable"
      width="80%"
      append-to-body
      @closed="onCallbackDialogClose"
    >
      <BaseFormDetailGenerator :columns="simpleViewFormClass" :detail-data="relyObj" />
    </el-dialog>
  </div>
</template>
<script>
import { Loading } from 'element-ui'
import * as API from '@/apis/formControl/index'
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
      relyObj: null,
      relyField: null,
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
      this.relyObj = null
      this.getById()
    }
  },
  mounted() {
    this.getById()
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
      this.getById()
      this.socketObj.close()
    },
    getById() {
      var loadObj = Loading.service({
        fullscreen: true
      })
      API.getDateilWithActions(this.formName, this.formId).then(res => {
        loadObj.close()

        this.relyObj = res.data
        this.relyField = JSON.parse(res.data.formClass).properties
        this.headerPrefix = res.display ? res.display + ' - ' : ''
      }).catch(e => {
        loadObj.close()
        this.$message.error('请求失败' + e.message)
      })
      API.getComments(this.formName, this.formId).then(res => {
        this.commentsData = res.data
      })
    },
    toAction(actionName) {
      // this.$router.push({ path: '/form/detail', query: { formId: this.formId, formName: this.formName, action: actionName }})
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
      API.trigger(this.formName, reslut.action, { form: reslut.formData, message: reslut.message }).then(res => {
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
          this.getById()
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

