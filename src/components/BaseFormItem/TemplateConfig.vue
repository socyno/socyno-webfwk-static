<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div v-html="innerHTML" />
</template>
<script>
import laytpl from 'laytpl'
export default {
  props: {
    template: {
      type: String,
      default: ''
    },
    formData: {
      type: Object,
      default: null
    },
    fieldModel: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      innerHTML: ''
    }
  },
  watch: {
    formData: {
      immediate: true,
      handler(n, o) {
        this.initData(n || {})
        this.$forceUpdate()
      }
    }
  },
  methods: {
    initData() {
      if (this.template) {
        var tmpldata = this.fieldModel
        tmpldata.data = this.formData
        this.innerHTML = laytpl.render(decodeURIComponent(this.template), tmpldata)
      } else {
        this.innerHTML = this.formData
      }
    }
  }
}
</script>
<style scoped lang="scss">
</style>
