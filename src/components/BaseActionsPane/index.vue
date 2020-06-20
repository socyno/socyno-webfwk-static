<template>
  <div :class="`base-form-actions-${direction||'center'}`">
    <el-button
      v-for="(item, idx) in actions"
      :key="idx"
      :type="item.styleType || type"
      :size="size"
      :value="item.name"
      @click="onActionClick(item)"
    >
      {{ item.display }}
    </el-button>
  </div>
</template>
<script>
export default {
  props: {
    actions: {
      type: Array,
      default: null,
      required: true
    },
    /**
     * direction
     * left | right | center
     */
    direction: {
      type: String,
      default: 'right'
    },
    /**
     * el-button
     * medium | small | mini
     */
    size: {
      type: String,
      default: 'mini'
    },
    /**
     * el-button
     * primary | success | warning | danger | info | text
     */
    type: {
      type: String,
      default: 'primary'
    }
  },
  methods: {
    onActionClick(action) {
      this.$emit('input', action.name)
    }
  }
}
</script>
<style>
.base-form-actions-center {
    background-color: #fff;
    display: block;
    text-align: center;
    padding: 0 20px 5px 20px;
}
.base-form-actions-right {
    background-color: #fff;
    display: block;
    text-align: right;
    padding: 0 20px 5px 20px;
}
.base-form-actions-left {
    background-color: #fff;
    display: block;
    text-align: left;
    padding: 0 20px 5px 20px;
}
.el-button {
  margin-top: 10px !important;
}
</style>
