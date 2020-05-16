<template>
  <div>
    <el-table :data="tableData" border>
      <el-table-column v-for="(item,key,index) in tableColumn" :key="index" :label="item.title">
        <template slot-scope="props">
          <span>{{ props.row[key] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template slot-scope="scope">
          <div class="shell">
            <el-button type="text" size="small" @click="operateClick(scope.row.id)">
              {{ operateText }}
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="showPagination"
      :current-page="param.page"
      :page-sizes="[10, 20, 30, 100]"
      :page-size="param.limit"
      layout="total, sizes, prev, pager, next, jumper"
      style="height: 40px;text-align: center;background: #fff;padding-top: 25px;"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>
<script>
export default {
  props: {
    tableData: {
      type: Array,
      default: null
    },
    tableColumn: {
      type: Object,
      default: null
    },
    operateText: {
      type: String,
      default: '详情'
    },
    total: {
      type: Number,
      default: 0
    },
    showPagination: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      tableColumns: null,
      param: {
        limit: 10,
        page: 1
      }
    }
  },
  created() {
    // var a = this.tableColumn

    // a.sort((d, s) => parseInt(s.position) - parseInt(d.position))
    // this.tableColumns = a
  },
  methods: {
    // sortOfObj(sorObj, sortKey) {
    //   var resList = []
    //   for(var key in sorObj) {
    //     resList.push({
    //       "key": key,
    //       sortKey: sorObj[key].sorObj,
    //       position :
    //     })
    //   }
    // },
    operateClick(formId) {
      this.$emit('operateClick', formId)
    },
    handleSizeChange(size) {
      this.param.limit = size
      this.$emit('changePage', this.param)
    },
    handleCurrentChange(num) {
      this.param.page = num
      this.$emit('changePage', this.param)
    }
  }
}
</script>
<style scoped lang="scss">

</style>
