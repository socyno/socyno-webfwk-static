<template>
  <el-table :data="data" border>
    <!-- <el-table-column label="表单ID" prop="objectId" />
    <el-table-column label="表单名称" prop="objectType" />
    <el-table-column label="操作类型" prop="operateType" /> -->
    <el-table-column label="操作人" prop="operateUserName" width="200" />
    <el-table-column label="操作时间" prop="operateTime" width="200" />
    <el-table-column label="内容" prop="operateDesc" show-overflow-tooltip />
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
