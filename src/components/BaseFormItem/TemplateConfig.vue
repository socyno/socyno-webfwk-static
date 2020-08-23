<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div v-html="innerHTML" />
</template>
<script>
import laytpl from 'laytpl'
import { getFieldValueDisplay, setFieldDefaultValue } from '@/utils/formUtils'

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
      handler: function(n, o) {
        this.initData(n || {})
        this.$forceUpdate()
      }
    }
  },
  methods: {
    initData() {
      if (this.template) {
        var tmpldata = {}
        Object.assign(tmpldata, this.fieldModel)
        tmpldata.data = this.formData
        setFieldDefaultValue(tmpldata, this.formData)
        tmpldata.textDisplay = getFieldValueDisplay(tmpldata, tmpldata.value)
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
