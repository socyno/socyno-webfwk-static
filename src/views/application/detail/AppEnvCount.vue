<template>
  <div class="app-detail-count">
    <el-table
      :data="tableData"
      style="width: 100%"
    >
      <el-table-column
        prop="env"
        label="环境"
        width="180"
      />
      <el-table-column
        prop="namespaceNum"
        label="机组数量"
        width="180"
      />
      <el-table-column
        prop="replicas"
        label="副本数量"
      />
    </el-table>
  </div>
</template>
<script>
import { getAppCount } from '@/apis/application/index'
export default {
  data() {
    return {
      tableData: []
    }
  },
  mounted() {
    getAppCount(this.$route.params.app_id).then(res => {
      this.tableData = res.data
    })
  }
}
</script>
<style lang="scss">

</style>
