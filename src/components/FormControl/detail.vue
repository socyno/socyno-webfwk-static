<template>
  <div>
    <el-form
      v-if="relyObj"
      ref="formref"
      label-position="right"
      style="width:90%;margin:0 auto;"
      :inline="true"
      label-width="130px"
      class="demo-ruleForm"
    >
      <span v-for="(item,key, index) in sortFields.wholeLine" :key="index" class="formrow33">
        <el-form-item :label="relyField[key].title+'：'" prop="name">
          {{ getFieldValue(item,relyObj.form[key]) }}
        </el-form-item>
      </span>
      <span v-for="(item,key, index) in sortFields.multiLine" :key="index" class="formrow100">
        <el-form-item :label="relyField[key].title+'：'" prop="name">
          {{ relyObj.form[key] }}
        </el-form-item>
      </span>
      <span v-for="(item, key, index) in sortFields.attachment" :key="index" class="formrow100 constyle">
        <el-form-item :label="relyField[key].title+'：'">
          <el-button v-if="hasUploadAdd" class="el-icon-upload" plain size="small" type="primary" @click="addAttachment(key)">添加</el-button>
          <UploadDisplay v-if="relyObj.form[key].length>0" :form-name="formName" :form-id="formId" :form-revision="relyObj.form['revision']" :files="relyObj.form[key]" :can-remove-file="hasUploadRemove" @operateResult="operateResult" />
        </el-form-item>
      </span>
    </el-form>
    <div v-if="actions" class="btnRegion">
      <el-button v-for="(item,index) in actions" :key="index" type="primary" @click="actionClick(item)">
        {{ item.display }}
      </el-button>
    </div>
    <el-dialog title="操作" :modal-append-to-body="false" :visible.sync="dialogActionVisible" width="700px">
      <FormControl :key="actionNames" :action-name="actionNames" :rely-field="relyField" :rely-obj="relyObj" :can-edit-fields="canEditFields" @submitForm="submitForm" @cancelClik="cancelClik" />
    </el-dialog>
    <el-dialog title="附件" :modal-append-to-body="false" :visible.sync="dialogAttachementVisible">
      <UploadControl :key="actionNames" :action-name="actionNames" :form-id="relyObj.form.id" :form-name="formName" :field-key="uploadFieldKey" @operateResult="operateResult" />
    </el-dialog>
  </div>
</template>
<script>
import FormControl from './index.vue'
import UploadControl from '../UploadControl/upload'
import UploadDisplay from '../UploadControl/display'
import { fieldOrder, formFieldOrder, getFieldType } from '@/utils/fromCommon'
import { getPrepareField } from '@/apis/formControl/index'
export default {
  components: { FormControl, UploadControl, UploadDisplay },
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
      actions: this.relyObj.actions.filter(t => ['upload_remove', 'upload'].indexOf(t.name) < 0),
      // 是否有添加附件功能
      hasUploadAdd: this.relyObj.actions.filter(t => t.name === 'upload').length > 0,
      // 是否有删除附件功能
      hasUploadRemove: this.relyObj.actions.filter(t => t.name === 'upload_remove').length > 0,
      actionNames: this.actionName,
      dialogActionVisible: false,
      dialogAttachementVisible: false,
      canEditFields: null,
      sortFields: formFieldOrder(this.relyField),
      uploadFieldKey: ''
    }
  },
  mounted() {
    this.initAction()
  },
  methods: {
    initAction() {
      if (this.actionNames) {
        var item = this.actions.filter(t => t.name === this.actionNames)
        if (item && item.length > 0) {
          this.canEditFields = fieldOrder(JSON.parse(item[0].formClass).properties)
          this.dialogActionVisible = true
        } else {
          this.$message.warning('该操作已完成或不存在')
        }
      }
    },
    actionClick(item) {
      this.actionNames = item.name
      if (item.prepareRequired) {
        getPrepareField(this.formName, this.formId, item.name).then(res => {
          this.canEditFields = fieldOrder(JSON.parse(item.formClass).properties)
          this.dialogActionVisible = true
        })
      } else {
        this.canEditFields = fieldOrder(JSON.parse(item.formClass).properties)
        this.dialogActionVisible = true
      }
      this.$emit('toAction', item.name)
    },
    getFieldValue(item, value) {
      if (getFieldType(item) === 'select') {
        var t = item.staticOptions.filter(t => t.value === value)
        if (t && t.length > 0) {
          return t[0].display
        }
      }
      return value
    },
    addAttachment(key) {
      // 上传需要指定对应的字段
      this.uploadFieldKey = key
      this.actionNames = 'upload'
      this.dialogAttachementVisible = true
    },
    operateResult(result) {
      this.dialogAttachementVisible = false
      this.$emit('refresh', true)
    },
    submitForm(reslut) {
      this.dialogActionVisible = false
      this.$emit('submitForm', reslut)
    },
    cancelClik() {
      this.dialogActionVisible = false
    }
  }
}
</script>
<style scoped lang="scss">
 .formrow33{
    display: inline-block;
    width: 33%;
 }
 .formrow100{
    display: inline-block;
    width: 100%;
 }
 .btnRegion{
    text-align: center;
    margin-top: 36px;
 }
</style>
<style lang="scss">
.constyle .el-form-item__content {
  width: 80%;
}
</style>
