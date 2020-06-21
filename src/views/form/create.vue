<template>
  <br>
</template>
<script>
export default {
  mounted() {
    var formName = this.$route.params.formName
    var formAction = this.$route.params.formAction
    location.replace(`#/form/list/${formName}?_action=${formAction}`)
  }
}
</script>
