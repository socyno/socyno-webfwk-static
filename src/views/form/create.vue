<template>
  <div class="form-create">
    <el-page-header class="common-page-header" :content="headerPrefix + '表单创建'" @back="$router.go(-1)" />
    <BaseFormGenerator v-model="filterParams" type="submit" :data="fieldData" @input="handleSubmit" @cancle="$router.go(-1)" />
  </div>
</template>
<script>
import FormApi from '@/apis/formApi'
import BaseFormGenerator from '@/components/BaseFormGenerator'
export default {
  components: {
    BaseFormGenerator
  },
  data() {
    return {
      actionData: {},
      filterParams: {},
      fieldData: {},
      headerPrefix: ''
    }
  },
  mounted() {
    // console.log(this.$route.params)

    var api = new FormApi(this.$route.params.form_name)
    this.api = api
    this.api.loadDefinitions().then(res => {
      this.actionData = res.quickActions.filter((item) => { return item.name === this.$route.params.form_action.toLowerCase() })[0]
      this.actionData.formClass.eventFormType = this.actionData.eventFormType
      this.fieldData = this.actionData.formClass
      document.title = window.$title + ' - ' + (res.display || '表单创建')
      this.headerPrefix = res.display ? res.display + ' - ' : ''
    }).catch(res => {

    })
  },
  methods: {
    handleSubmit(e) {
      var params = e
      const loading = this.$loading({
        lock: true,
        text: 'Loading'
      })
      this.api.postCreate(this.$route.params.form_action, params).then(res => {
        loading.close()
        this.$message.success('表单提交成功')
        this.$router.go(-1)
      }).catch(res => {
        loading.close()
      })
    }
  }
}
</script>
<style lang='scss'>
.form-create {
    .form-generator {
    align-items: center;

    .el-select,
    .el-input,
    .el-textarea,
    .el-range-editor--mini.el-input__inner {
      width: 350px;
    }
}
}

</style>
