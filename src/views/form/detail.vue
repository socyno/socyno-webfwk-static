<template>
  <el-drawer
    :visible.sync="visible"
    class="form-single-drawer"
    custom-class="form-single-wrapper"
    :with-header="false"
    :modal="false"
    :append-to-body="true"
  >
    <BaseFormDetail
      :form-id="formId"
      :form-name="formName"
      @back="onFormClose"
      @loaded="onFormLoaded"
      @loading="onFormLoading"
  />
  </el-drawer>
</template>
<script>
import tool from '@/utils/tools'
import BaseFormDetail from '@/components/BaseFormDetail'
export default {
  components: {
    BaseFormDetail
  },
  data() {
    return {
      formId: '',
      formName: '',
      respData: null,
      visible: true
    }
  },
  watch: {
    '$route'(to, from) {
      this.resetData()
    }
  },
  created() {
    this.resetData()
  },
  methods: {
    resetData() {
      this.formId = this.$route.query.formId
      this.formName = this.$route.query.formName
    },

    onFormLoading(formName, formId) {
      this.visible = false
    },

    onFormLoaded(data) {
      this.visible = true
    },

    onFormClose(formName, formId) {
      tool.close()
    }
  }
}
</script>
<style lang="scss">
.form-single-drawer {
  .form-single-wrapper {
    display: block !important;
    width: 100% !important;
  }
}
</style>
