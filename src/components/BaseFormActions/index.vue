<template>
  <div class="base-form-actions">
    <el-button v-for="(item, idx) in temp" :key="idx" type="primary" size="mini" round @click="onButtonClick(item)">
      {{ item.display }}
    </el-button>
    <el-button v-if="exportbtn" type="primary" size="mini" round @click="onExportClick">
      导出Excel
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
    exportbtn: {
      type: Boolean,
      default: false
    }
  },
  data: function() {
    return {
      temp: []
    }
  },
  watch: {
    actions: {
      immediate: true,
      handler: function(v) {
        this.temp = v
      }
    }
  },
  methods: {
    onButtonClick(e) {
      this.$emit('input', e)
    },
    onExportClick(e) {
      this.$emit('export', e)
    }
  }
}
</script>
<style>
.base-form-actions {
    background-color: #fff;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding:0 15px 5px 15px;
}
</style>
