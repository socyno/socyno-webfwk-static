<template>
  <div v-loading.fullscreen.lock="loading">
    <BaseFormDetailGenerator
      :columns="{properties:formDetail.formClass.properties}"
      :detail-data="formDetail.form"
    />
    <div v-if="formDetail.actions" class="btnRegion">
      <el-button
        v-for="(item,index) in formDetail.actions"
        :key="index"
        type="primary"
        @click="showActionDialog(item)"
      >
        {{ item.display }}
      </el-button>
    </div>
    <el-dialog
      :visible.sync="clickedActionVisible"
      :title="clickedAction.title || '操作'"
      :modal-append-to-body="true "
      append-to-body
      width="800px"
    >
      <BaseFormGenerator
        v-if="clickedActionVisible"
        v-model="clickedAction.filterParams"
        :form-class="clickedAction.formClass"
        :default-data="clickedAction.defaultData"
        type="submit"
        @input="submitForm"
        @cancle="closeActionDialog"
      />
    </el-dialog>
  </div>
</template>
<script>
import BaseFormGenerator from '@/components/BaseFormGenerator'
import BaseFormDetailGenerator from '@/components/BaseFormDetailGenerator'
import tool from '@/utils/tools.js'
export default {
  components: {
    BaseFormGenerator,
    BaseFormDetailGenerator
  },
  props: {
    formId: {
      type: String,
      required: true
    },
    formName: {
      type: String,
      required: true
    },
    formDetail: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      clickedAction: {
        title: '',
        filterParams: {},
        defaultData: {}
      },
      clickedActionVisible: false,
      loading: false
    }
  },
  methods: {
    showActionDialog(action) {
      /**
       * 事件在页面上会被重复点击，
       * 为避免多次操作后数据异常
       * 这里对其进行复制后再修改
       */
      console.log('点击事件:')
      console.log(action)
      action = tool.jsonCopy(action)
      /**
       * 明确定义为无需编辑时，直接执行事件
       */
      if (action.eventFormType === 'NULL') {
        this.clickedAction = action
        this.submitForm({
          id: this.formDetail.form.id,
          revision: this.formDetail.form.revision
        })
        return
      }
      /**
       * 要求填写操作说明。
       * true - 必填; false - 选填; null - 不填
       */
      if (!tool.isUndefOrNull(action.messageRequired)) {
        action.formClass.properties._message = {
          type: 'string',
          title: '操作说明',
          fieldType: 'text',
          fieldTypeKey: '',
          fieldOptionsType: 'NULL',
          readonly: false,
          position: 2000000 // 确保在底部
        }
        if (action.messageRequired) {
          if (!tool.isArray(action.formClass.required)) {
            action.formClass.required = []
          }
          action.formClass.required.push('_message')
        }
      }
      if (action.prepareRequired) {
        this.loading = true
        this.formApi.loadActionPrepareData(this.formId, action.name)
          .then(data => {
            action.defaultData = Object.assign(
              tool.jsonCopy(this.formDetail.form),
              data || {}
            )
            this.clickedAction = action
            this.clickedActionVisible = true
          })
          .finally(res => {
            this.loading = false
          })
      } else {
        action.defaultData = tool.jsonCopy(this.formDetail.form)
        this.clickedAction = action
        this.clickedActionVisible = true
      }
      this.$emit('toAction', action.name)
    },
    /**
     * 提交事件表单并处理响应
     */
    submitForm(params) {
      params.id = this.formDetail.form.id
      params.revision = this.formDetail.form.revision
      var body = {
        action: this.clickedAction.name,
        formData: params,
        message: params._message,
        onSuccess: this.closeActionDialog
      }
      delete body.formData._message

      if (this.clickedAction.confirmRequired) {
        this.$confirm('请确认是否进行此操作?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.$emit('submitForm', body)
          })
      } else {
        this.$emit('submitForm', body)
      }
    },
    /**
     * 关闭事件视图窗口
     */
    closeActionDialog() {
      // console.log('正在关闭事件视图窗口...')
      this.clickedActionVisible = false
    }
  }
}
</script>
<style scoped lang="scss">
.formrow33 {
  display: inline-block;
  width: 33%;
}
.formrow100 {
  display: inline-block;
  width: 100%;
}
.btnRegion {
  text-align: center;
  margin-top: 36px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 0 30px 10px;

  .el-button--primary {
    color: #fff;
    background-color: #409eff;
    border-color: #409eff;
    margin-top: 5px;
    flex: 0 1 100px;
  }
}
</style>
<style lang="scss">
.constyle .el-form-item__content {
  width: 80%;
}
</style>
