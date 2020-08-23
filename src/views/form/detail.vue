<template>
  <!--
    此处判断是否在 iframe 内嵌入来决定事件表单的顶部位置
   （ 此时菜单是不可见的, 也就无需预留其显示位置）
  -->
  <BaseFormDetail
    :form-id="formId"
    :form-name="formName"
    :form-top="inIframe() ? 0 : 60"
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
    '$route': function(to, from) {
      this.resetData()
    }
  },
  created() {
    this.resetData()
  },
  methods: {
    inIframe() {
      return tool.inIframe()
    },

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
