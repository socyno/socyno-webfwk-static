<template>
  <div class="form-detail-wrapper">
    <div class="form-detail-content">
      <el-page-header
        class="common-page-header"
        title="关闭"
        :content="formTitle"
        @back="onFormClose"
      />
      <BaseFormContent
        v-if="formModel"
        :form-id="formId"
        :form-name="formName"
        :form-model="formModel"
        :default-data="formData"
      />
      <Comments
        ref="formComments"
        :form-name="formName"
        :form-id="formId"
      />
    </div>
    <div v-if="formActions" class="form-detail-btnpane">
      <el-button
        v-for="(action, index) in formActions"
        :key="`${action.name}-${index}`"
        type="primary"
        @click="triggerFormAction(action)"
      >
        {{ action.display }}
      </el-button>
      <el-button type="info" @click="showChangeLogs()">
        变更日志
      </el-button>
      <el-button type="info" @click="load()">
        刷新页面
      </el-button>
    </div>
    <el-drawer
      :visible.sync="actionDrawer.visible"
      class="form-action-drawer"
      custom-class="form-action-wrapper"
      :modal="true"
      :with-header="false"
      :wrapper-closable="false"
      direction="ltr"
      :append-to-body="true"
      :modal-append-to-body="true"
      @open="onActionDrawerOpen"
    >
      <div v-if="actionDrawer.showChangeLogs">
        <Logs
          ref="formLogs"
          class="form-action-content"
          :form-name="formName"
          :form-id="formId"
          @back="onActionFormCancel"
        />
      </div>
      <BaseFormAction
        v-else
        ref="actionForm"
        class="form-action-content"
        @cancel="onActionFormCancel"
        @prepare="onActionFormPrepare"
        @delete="onFormDelete"
        @change="onFormCommit"
      />
    </el-drawer>
  </div>
</template>
<script>

import '@/styles/form.scss'
import Logs from './log'
import Comments from './comment'
import tool from '@/utils/tools'
import FormApi from '@/apis/formApi'
import BaseFormAction from '@/components/BaseFormAction'
import BaseFormContent from '@/components/BaseFormContent'
export default {
  components: {
    Logs,
    Comments,
    BaseFormAction,
    BaseFormContent
  },
  props: {
    formId: {
      type: [Number, String],
      required: true
    },
    formName: {
      type: [String],
      required: true
    },
    formTop: {
      type: [Number],
      default: 0
    },
    /**
     * 是否自动加载数据。
     * 如果启用该功能，在任何事件完成后也会自动刷新数据。
     */
    enableAutoLoad: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      formTitle: '',
      formModel: null,
      formData: {},
      formActions: [],
      actionDrawer: null
    }
  },
  watch: {
    formId: {
      handler: function() {
        if (this.formId && this.enableAutoLoad) {
          this.load()
        }
      }
    }
  },
  created() {
    if (this.enableAutoLoad) {
      this.load()
    } else {
      this.resetAllData()
    }
  },
  methods: {
    /**
     * 重置所有数据
     */
    resetAllData() {
      this.actionDrawer = {
        visible: false,
        showChangeLogs: false
      }
      this.formModel = null
      this.formData = {}
      this.formActions = []
    },

    /**
     * 加载并显示操作事件面板
     */
    load() {
      this.resetAllData()
      this.formApi = new FormApi(this.formName)
      this.$emit('loading', this.formName, this.formId)
      this.formApi.loadDetailWithActions(this.formId).then((data) => {
        this.formId = this.formId
        this.formData = data.form
        this.formModel = data.formClass
        this.formActions = data.actions
        this.setFormTitle()
        this.$nextTick(function() {
          this.$refs.formComments.load()
        })
        this.$emit('loaded', data.form, this.formName, this.formId)
      })
    },

    /**
     * 执行指定的事件
     */
    triggerFormAction(formAction) {
      // console.log('点击操作：', formAction)
      this.actionDrawer.visible = true
      this.actionDrawer.showChangeLogs = false
      this.actionDrawer.formAction = formAction
      this.$nextTick(function() {
        this.$refs.actionForm.trigger(this.formName, this.actionDrawer.formAction, this.formId, this.formData)
      })
    },

    /**
     * 页面关闭的回调
     */
    onFormClose() {
      this.$emit('back', this.formName, this.formId)
    },

    /**
     * 表单操作的取消回调
     */
    onActionFormCancel() {
      this.actionDrawer.visible = false
    },

    /**
     * 表单操作的就绪回调
     */
    onActionFormPrepare() {

    },

    /**
     * 表单删除操作的回调
     */
    onFormDelete(resData, formName, formId, formAction) {
      this.actionDrawer.visible = false
      this.$emit('delete', resData, formName, formId, formAction)
    },

    /**
     * 表单更新操作的回调
     */
    onFormCommit(resData, formName, formId, formAction) {
      this.actionDrawer.visible = false
      this.load()
    },

    /**
     *  设置当前表单的标题
     */
    setFormTitle() {
      var title = null
      if (this.formModel) {
        if (this.formModel.title) {
          title = this.formModel.title
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
    },

    /**
     * 展示变更日志
     */
    showChangeLogs() {
      this.actionDrawer.visible = true
      this.actionDrawer.showChangeLogs = true
      this.$nextTick(function() {
        this.$refs.formLogs.load()
      })
    },

    /**
     * 强制操作界面的顶部位置
     */
    onActionDrawerOpen() {
      this.$nextTick(function() {
        document.getElementsByClassName('form-action-drawer')[0].style.top = this.formTop + 'px'
      })
    }
  }
}
</script>
<style lang="scss">
.form-detail-wrapper {
  position:absolute !important;
  top: 0px !important;
  left: 0px !important;
  bottom: 0px !important;
  display: block !important;
  background-color: #FFF !important;
  opacity: initial !important;
  width: 100% !important;
  .form-detail-content {
    position: absolute !important;
    top: 0px !important;
    left: 0px !important;;
    bottom: 0px !important;
    overflow-y: auto;
    width: calc(100% - 210px) !important;
  }
  .form-detail-btnpane {
    padding-top: 20px;
    position:absolute !important;
    top: 0px !important;
    right: 0px !important;;
    bottom: 0px !important;
    width: 200px !important;
    border-left:2px #EEE solid;
  }
  .form-detail-btnpane .el-button {
     display: block;
     margin-left: 10px;
     width: 180px;
   }
}
.form-action-drawer {
    background-color: #FFF;
    // right: 0px !important;
    width: 100% !important;
  .form-action-wrapper {
     width: 99% !important;
    .form-action-content {
      position: absolute !important;
      top: 0px !important;
      left: 0px !important;
      right: 0px !important;
      bottom: 0px !important;
      overflow-y: auto;
    }
  }
}
</style>
