<template>
  <!-- eslint-disable-next-line vue/no-v-html  -->
  <div v-html="innerHTML" />
</template>
<script>
import laytpl from 'laytpl'
export default {
  props: {
    template: {
      type: String,
      default: ``
    },
    data: {
      type: Object,
      default: null
    },
    options: {
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
    data: {
      immediate: true,
      handler(n, o) {
        if (n !== null) {
          this.initData()
          this.$forceUpdate()
        }
      }
    }
  },
  mounted() {

  },
  methods: {
    initData() {
      if (this.template) {
        var temp = this.options
        temp.data = this.data
        this.innerHTML = laytpl.render(decodeURIComponent(this.template), temp)
      } else {
        this.innerHTML = this.data
      }
    }
  }
}
</script>
<style scoped lang="scss">
</style>
