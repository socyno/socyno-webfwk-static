<template>
  <div class="form-create">
    <el-page-header class="common-page-header" :content="action.display" @back="$router.go(-1)" />
    <BaseFormGenerator v-model="filterParams" type="submit" :data="action.formClass" @input="handleSubmit" @cancle="$router.go(-1)" />
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
      action: {
        formClass: {}
      },
      filterParams: {}
    }
  },
  created() {
    // console.log(this.$route.params)
    this.formApi = new FormApi(this.$route.params['form_name'])
    const loading = this.$loading({
      lock: true,
      text: 'Loading'
    })
    this.formApi.loadAction(this.$route.params['form_action']).then(action => {
      this.action = action
      // console.log(action)
      document.title = window.$title + ' - ' + action.display
    }).finally(res => {
      loading.close()
    })
  },
  methods: {
    handleSubmit(e) {
      var params = e
      const loading = this.$loading({
        lock: true,
        text: 'Loading'
      })
      this.formApi.postCreateAction(this.$route.params.form_action, params).then(res => {
        this.$message.success('表单提交成功')
        this.$router.go(-1)
      }).finally(res => {
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
