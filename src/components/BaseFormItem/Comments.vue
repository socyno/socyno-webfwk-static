<template>
  <el-table :data="data" border>
    <el-table-column label="创建时间" prop="operateTime" width="200" />
    <el-table-column label="创建人" prop="operateUserDisplay" width="200" />
    <el-table-column label="备注内容" prop="operateDesc" show-overflow-tooltip />
  </el-table>
</template>
<script>
export default {
  props: {
    data: {
      type: Array,
      default: null,
      required: true
    }
  },
  data() {
    return {
    }
  }
}
</script>
<style lang="scss">

</style>
