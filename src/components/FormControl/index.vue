<template>
  <el-form v-if="formData" ref="formref" :model="formData.form" label-position="right" :rules="rules" style="width: 550px;" label-width="140px" :inline="false" class="demo-form-inline">
    <div v-if="rules">
      <el-form-item v-for="(item, key, index) in canEditFields" :key="index" :label="item.title+'：'" :prop="key">
        <ChildControl :resource="formData.form" :vkey="key" :type="getFieldTypeInfo(item)" :options="relyField[key].staticOptions||null" :disabled="item.readonly||false" :placeholder="canEditFields[key].title" />
      </el-form-item>
      <el-form-item v-if="showMessage" prop="message" label="说明：">
        <el-input v-model="formData.form['message']" placeholder="请输入说明" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item label>
        <el-button type="primary" size="small" @click="submitForm('formref')">
          确认
        </el-button>
        <el-button size="small" @click="cancelClick()">
          取消
        </el-button>
      </el-form-item>
    </div>
  </el-form>
</template>
<script>
import ChildControl from './ChildControl/index.vue'
import { getFieldType } from '@/utils/fromCommon'
export default {
  components: { ChildControl },
  props: {
    relyField: {
      type: Object,
      default: null
    },
    relyObj: {
      type: Object,
      default: null
    },
    canEditFields: {
      type: Object,
      default: null
    },
    actionName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showMessage: false,
      showEnclosure: false,
      formData: JSON.parse(JSON.stringify(this.relyObj)),
      rules: null
    }
  },
  created() {
    this.getInitData()
  },

  methods: {
    getInitData() {
      var newObj = JSON.parse(JSON.stringify(this.relyObj))
      // 添加表单校验
      newObj.form.message = ''
      this.formData = newObj
      var dl = this.formData.actions.filter(t => t.name === this.actionName)
      if (!dl || dl.length <= 0) {
        this.rules = {}
      } else {
        this.showMessage = dl[0].messageRequired !== undefined && dl[0].messageRequired !== null
        var jsonStr = dl[0].messageRequired ? `message: [{ required: true, message: '内容不能为空', trigger: 'blur' }]` : 'a:[]'
        for (var key in this.canEditFields) {
          if (!this.canEditFields[key].readonly) {
            jsonStr += `,${key}: [{ required: true, message: '内容不能为空', trigger: 'blur' }]`
          }
        }
        // eslint-disable-next-line no-eval
        this.rules = eval('(' + '{' + jsonStr + '}' + ')')
      }
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (!valid) {
          return false
        } else {
          var acname = this.formData.actions.filter(t => t.name === this.actionName)[0].display
          this.$confirm(`是否确认${acname}?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            var message = this.formData.form.message
            for (var key in this.formData.form) {
              // id和版本 字段在任何时候都要
              if (!this.canEditFields[key] && ['id', 'revision'].indexOf(key) < 0) {
                delete this.formData.form[key]
              }
            }
            this.$emit('submitForm', { action: this.actionName, formData: this.formData.form, message: message })
          })
        }
      })
    },
    getFieldTypeInfo(item) {
      return getFieldType(item)
    },
    cancelClick() {
      this.$emit('cancelClik')
    }
  }
}
</script>
<style lang="scss">

</style>
