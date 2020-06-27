<template>
  <el-popover v-if="tooltip && !fieldModel.contentip && fieldModel.description" placement="top-start" width="400" trigger="hover">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-html="fieldModel.description" />
    <span slot="reference">
      {{ fieldModel.title }}
      <i class="el-icon-question" />
      <span v-if="!withoutColon && !fieldModel.smallTitle">：</span>
    </span>
  </el-popover>
  <span v-else>{{ fieldModel.title }}<span v-if="!withoutColon && !fieldModel.smallTitle">：</span></span>
</template>
<script>
export default {
  name: 'BaseFormLabel',
  components: {
  },
  props: {
    fieldModel: {
      type: Object,
      required: true
    },
    tooltip: {
      type: Boolean,
      default: false
    },
    withoutColon: {
      type: Boolean,
      default: false
    }
  }
}
</script>
<style lang='scss'>
  .el-popover {
    overflow: auto !important;
    max-width: 600px !important;
    min-height: 50px !important;
    max-height: 500px !important;
    background: #FBFBFB !important;
  }
</style>
