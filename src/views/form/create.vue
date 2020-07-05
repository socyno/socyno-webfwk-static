<template>
  <br>
</template>
<script>
import router from '@/router/index.js'
export default {
  created() {
    var formQuery = this.$route.query || {}
    var formName = this.$route.params.formName
    var formAction = this.$route.params.formAction
    router.push({
      path: `/form/list/${formName}`,
      query: Object.assign(formQuery, {
        '_action': formAction
      })
    })
  }
}
</script>
