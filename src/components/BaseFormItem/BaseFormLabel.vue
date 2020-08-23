<template>
  <el-tooltip v-if="tooltip && fieldModel.description" effect="light" placement="right">
    <span>
      {{ fieldModel.title }}
      <i class="el-icon-question" />
      <span v-if="!withoutColon && !fieldModel.titleWithoutColon">：</span>
    </span>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div slot="content" v-html="fieldModel.description" />
  </el-tooltip>
  <span v-else>{{ fieldModel.title }}<span v-if="!withoutColon && !fieldModel.titleWithoutColon">：</span></span>
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
