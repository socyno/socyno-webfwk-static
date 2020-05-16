<template>
  <div v-loading.fullscreen.lock="loading">
    <BaseFormDetailGenerator :columns="{properties:relyField}" :detail-data="relyObj.form" />
    <div v-if="actions" class="btnRegion">
      <el-button
        v-for="(item,index) in actions"
        :key="index"
        type="primary"
        @click="actionClick(item)"
      >
        {{ item.display }}
      </el-button>
    </div>
    <el-dialog
      :title="canEditFields && canEditFields.title ? canEditFields.title : (clickedAction.display || '操作')"
      :modal-append-to-body="true "
      append-to-body
      :visible.sync="dialogActionVisible"
      width="950px"
      @closed="isClosed = true"
    >
      <BaseFormGenerator
        v-if="!isClosed"
        v-model="filterParams"
        :is-submit-loading="isSubmitting"
        :data="canEditFields"
        :default-data="relyObj.form"
        type="submit"
        @input="submitForm"
        @cancle="cancleClick"
      />
    </el-dialog>
  </div>
</template>
<script>
import BaseFormGenerator from '@/components/BaseFormGenerator'
import BaseFormDetailGenerator from '@/components/BaseFormDetailGenerator'
import { getFieldType } from '@/utils/fromCommon'
import { getPrepareField } from '@/apis/formControl/index'
export default {
  components: { BaseFormGenerator, BaseFormDetailGenerator },
  props: {
    formId: {
      type: String,
      default: null
    },
    formName: {
      type: String,
      default: null
    },
    relyField: {
      type: Object,
      default: null
    },
    relyObj: {
      type: Object,
      default: null
    },
    actionName: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      // 附件功能特殊处理
      actions: this.relyObj.actions.filter(
        t => ['upload_remove', 'upload'].indexOf(t.name) < 0
      ),
      actionNames: this.actionName,
      dialogActionVisible: false,
      canEditFields: null,
      filterParams: {},
      clickedAction: {},
      showConfirm: false,
      loading: false,
      isClosed: false,
      isSubmitting: false
    }
  },
  watch: {
    relyObj(newv) {
      this.actions = newv.actions.filter(
        t => ['upload_remove', 'upload'].indexOf(t.name) < 0
      )
    }
  },
  mounted() {
    this.initAction()
  },
  methods: {
    getFieldValue(item, value) {
      if (getFieldType(item) === 'select') {
        var t = item.staticOptions.filter(t => t.value === value)
        if (t && t.length > 0) {
          return t[0].display
        }
      }
      if (typeof value === 'object') {
        // 如果是个object则取optionDisplay作为显示用
        if (value) {
          value = value.optionDisplay || value
        }
      }
      return value
    },
    initAction() {
      // if (this.actionNames) {
      //   var item = this.actions.filter(t => t.name === this.actionNames)
      //   if (item && item.length > 0) {
      //     var temp = item[0]
      //     this.clickedAction = temp.name
      //     this.auditFormClass(temp)
      //     this.showConfirm = temp.confirmRequired
      //     // this.dialogActionVisible = true
      //   } else {
      //     this.$message.warning('该操作已完成或不存在')
      //   }
      // }
    },
    parseFormClassToObj(formClassStr) {
      var formClass = {}
      try {
        formClass = JSON.parse(formClassStr) // 解析json
      } catch (error) {
        if (typeof formClassStr === 'object') {
          // 有可能已经被解析过了,catch到非object都是json有问题
          formClass = formClassStr
        } else {
          // eslint-disable-next-line
          console.error(error)
        }
      }
      return formClass
    },
    actionClick(item) {
      this.actionNames = item.name
      this.clickedAction = item
      this.showConfirm = item.confirmRequired
      this.auditFormClass(item)
      this.$emit('toAction', item.name)
    },
    /**
     * 处理formclass
     * param {object} item action对象
     * return {object} item.formClass 返回formclass
     */
    auditFormClass(item) {
      item.formClass = this.parseFormClassToObj(item.formClass)
      this.isClosed = false

      item.formClass.eventFormType = item.eventFormType // EDIT编辑页 VIEW只读查看 NULL直接操作  控制确认取消按钮

      if (item.eventFormType === 'NULL') {
        var params = {}
        for (const iterator of item.formClass.required) {
          if (!this.relyObj.form[iterator]) {
            continue
          }
          params[iterator] = this.relyObj.form[iterator]
        }
        this.submitForm(params)
        return item.formClass
      }

      if (item.messageRequired !== null) {
        // true必填备注 false选填 null不显示备注输入框
        item.formClass.properties._message = {
          // 手动注入个message
          type: 'string',
          title: '说明',
          fieldType: 'TEXT',
          fieldTypeKey: '',
          fieldOptionsType: 'NULL',
          readonly: false,
          position: 9999 // 放最下面
        }
      }
      if (!item.formClass.required) {
        item.formClass.required = []
      }
      if (item.messageRequired) {
        // 必填
        item.formClass.required.push('_message')
      }
      var prepareDataTemp = {}
      if (this.relyObj.form.hasOwnProperty('state') && this.relyField.hasOwnProperty('state')) {
        prepareDataTemp.state = this.getFieldValue(this.relyField.state, this.relyObj.form.state)
      }

      if (item.prepareRequired) {
        this.loading = true
        getPrepareField(this.formName, this.formId, item.name)
          .then(res => {
            this.dialogActionVisible = true
            this.loading = false

            item.formClass.prepareData = Object.assign(
              prepareDataTemp,
              res.data || {}
            )
            this.canEditFields = item.formClass
          })
          .catch(res => {
            this.loading = false
          })
      } else {
        this.dialogActionVisible = true
        item.formClass.prepareData = prepareDataTemp
        this.canEditFields = item.formClass
      }
      return item.formClass
    },
    addAttachment(key) {
      // 上传需要指定对应的字段
      this.actionNames = 'upload'
    },
    submitForm(result) {
      result.id = this.relyObj.form.id
      result.revision = this.relyObj.form.revision

      var temp = {
        action: this.clickedAction.name,
        formData: result,
        message: result._message
      }

      delete temp.formData._message

      if (this.showConfirm) {
        this.$confirm('请确认是否进行此操作?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.$emit('submitForm', temp)
            // eslint-disable-next-line
            // $('.el-message-box__wrapper').hide()
          })
          .catch(() => {
            // eslint-disable-next-line
            // $('.el-message-box__wrapper').hide()
          })
      } else {
        this.$emit('submitForm', temp)
      }
    },
    cancleClick() {
      this.dialogActionVisible = false
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
