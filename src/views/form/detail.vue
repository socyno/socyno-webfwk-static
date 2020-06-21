<template>
  <BaseFormDetail
    :form-top="60"
    :form-id="formId"
    :form-name="formName"
    @back="onFormClose"
    @loaded="onFormLoaded"
    @loading="onFormLoading"
  />
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
  top: 60px !important;
  .form-single-wrapper {
    display: block !important;
    width: 100% !important;
  }
}
</style>
