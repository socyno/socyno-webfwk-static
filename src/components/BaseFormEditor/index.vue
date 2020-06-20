<template>
  <div class="basic-form-editor">
    <BaseFormContent
      ref="editForm"
      :editable="true"
      :form-id="formId"
      :form-name="formName"
      :form-model="formModel"
      :parent-field-models="parentFieldModels"
      :default-data="formData"
    />
    <div class="basic-form-buttons">
      <el-button type="primary" size="mini" @click="onSubmit()">
        提交
      </el-button>
      <el-button type="info" style="float:right" size="mini" @click="onCancel()">
        取消
      </el-button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'BaseFormEditor',
  components: {
    BaseFormContent: () => import('../BaseFormContent')
  },
  props: {
    formModel: {
      type: Object,
      required: true
    },
    formData: {
      type: Object,
      default: null
    },
    formId: {
      type: [String, Number],
      default: null
    },
    formName: {
      type: String,
      default: null
    },
    parentFieldModels: {
      type: Array,
      default: null
    }
  },
  // watch: {
  //   parentFieldModels: {
  //     immediate: true,
  //     handler(newValue) {
  //       console.log('表单编辑组件结构的父表单数据模型：', newValue)
  //     }
  //   }
  // },
  methods: {
    onSubmit() {
      var params
      if (!(params = this.$refs.editForm.getFormValidData())) {
        return
      }
      this.$emit('input', params)
    },
    onCancel() {
      this.$emit('cancel')
    }
  }
}
</script>
<style lang="scss">
.basic-form-editor {
  background-color: #fff;
  color: #222;
  .basic-form-buttons {
    padding-bottom: 20px;
    margin-left: 135px;
    margin-right: 50px;
  }
}
</style>
