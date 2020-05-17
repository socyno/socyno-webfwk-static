<template>
  <div v-loading="loading" class="common-form">
    <BaseFormGenerator :data="filterData" @input="handleQuery" @cancle="handleReset" />

    <BaseFormActions :actions="definition.actions" exportbtn @input="onActionBtnClick" />

    <div class="common-form-tablebar">
      <el-table :data="tableData" style="width: 100%">
        <slot v-for="(item,idx) in tableColumns">
          <el-table-column v-if="item.position && item.position >= 0" :key="idx" :label="item.title" :prop="item.key" :formatter="columnFmt" />
        </slot>
        <el-table-column fixed="right" label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="text">
              <a target="_blank" :href="`#/form/detail?formId=${scope.row.id}&formName=${$route.params.form_name}`">详情</a>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <BasePagination
        v-model="pageData"
        :options="pageData"
        :total="totalCount"
        @change="loadData"
      />
    </div>
  </div>
</template>
<script>
import BaseFormGenerator from '@/components/BaseFormGenerator'
import BasePagination from '@/components/BasePagination'
import BaseFormActions from '@/components/BaseFormActions'
import '@/styles/form.scss'

import FormApi from '@/apis/formApi'
export default {
  components: {
    BaseFormGenerator,
    BasePagination,
    BaseFormActions
  },
  data() {
    return {
      filterData: {},
      tableData: [],
      tableColumns: [],
      loading: false,
      filterParams: {},
      definition: {
        actions: [],
        queries: [{}]
      },
      currentQuery: 0,
      pageData: { // 默认的分页信息
        limit: 10,
        page: 1
      },
      totalCount: 0, // 一共多少条数据
    }
  },
  watch: {
    '$route'(to, from) {
      this.formApi = new FormApi(to.params.form_name)
      this.reloadAllData()
    }
  },
  mounted() {
    this.formApi = new FormApi(this.$route.params.form_name)
    this.reloadAllData()
  },
  methods: {
    // onExport() {
    //   const ExportJsonExcel = require('js-export-excel')

    //   var option = {}

    //   var filterObjs = this.tableColumns.filter(item => {
    //     if (item.type === 'object') {
    //       return item
    //     }
    //   })

    //   var exportTableData = []
    //   for (const key in this.tableData) {
    //     var element = this.tableData[key]

    //     for (const objKey in filterObjs) {
    //       const filterObj = filterObjs[objKey]

    //       var temp = element[filterObj.key]
    //       var copiedElement = JSON.parse(JSON.stringify(element))
    //       copiedElement[filterObj.key] = temp.optionDisplay
    //       element = copiedElement
    //     }
    //     exportTableData.push(element)
    //   }

    //   option.fileName = 'export-' + this.$route.params.form_name
    //   option.datas = [
    //     {
    //       sheetData: exportTableData,
    //       sheetName: 'sheet',
    //       sheetFilter: this.tableColumns.map(r => r.key),
    //       sheetHeader: this.tableColumns.map(r => r.title),
    //       columnWidths: [20, 20]
    //     }
    //   ]

    //   var toExcel = new ExportJsonExcel(option) // new
    //   toExcel.saveExcel() // 保存
    // },
    handleReset() {
      window.location.reload()
    },
    handleQuery(e) {
      this.filterParams = e
      this.initData()
    },
    reloadAllData() {
      this.loading = true
      this.formApi.loadDefinition().then(definition => {
        this.definition = definition
        document.title = window.$title + ' - ' + (definition.title || '表单列表')
        this.initQuery(0)
      }).finally(res => {
        this.loading = false
      })
    },
    initQuery(queryIndex) {
      this.currentQuery = queryIndex
      this.filterData = this.definition.queries[this.currentQuery].queryClass
      console.log(this.filterData)
      this.tableColumns = this.parseListColumns()
      this.initData()
    },
    parseListColumns() {
      var columns = []
      var resultClass = this.definition.queries[this.currentQuery].resultClass.properties
      for (const iterator in resultClass) {
        var item = resultClass[iterator]
        item.key = iterator
        if (item.position && item.position > 0) {
          columns.push(item)
        }
      }
      columns.sort((a, b) => a.position - b.position)
      return columns
    },
    initData() {
      var params = {}
      this.pageData.page = 1
      Object.assign(params, this.pageData)
      Object.assign(params, this.filterParams)
      this.loading = true
      this.formApi.loadFormListWithTotal(params).then(res => {
        this.tableData = res.data.list
        this.totalCount = res.data.total
      }).finally(res => {
        this.loading = false
      })
    },
    loadData() {
      var params = {}
      Object.assign(params, this.pageData)
      Object.assign(params, this.filterParams)
      this.loading = true
      this.formApi.loadFormList(params).then(res => {
        this.tableData = res.data.list
      }).finally(res => {
        this.loading = false
      })
    },
    columnFmt(row, column, cellValue, index) {
      var ret = ''
      var item = this.definition.queries[this.currentQuery].resultClass.properties[column.property]
      if (cellValue == null || !item) return ''
      switch (item.fieldType) {
        case 'string':
          if (item.fieldOptionsType === 'STATIC') {
            for (const iterator of item.staticOptions) {
              if (iterator.value === cellValue.toString()) {
                ret = iterator.display
                break
              }
            }
          } else {
            ret = cellValue
          }
          break
        case 'tableview':
          if (item.type === 'array') {
            ret = cellValue.map(item => {
              return item.display || item.optionDisplay
            }).toString()
          } else if (item.type === 'object') {
            ret = cellValue.display || cellValue.optionDisplay
          }
          break

        default:
          break
      }
      return ret.length ? ret : cellValue
    },
    // 处理action回调
    onActionBtnClick(e) {
      this.$router.push({ path: `/form/create/${this.$route.params.form_name}/${e.name}` })
    }
  }
}
</script>
<style lang="scss">
.common-form {
  .common-form-tablebar {
    .el-table__empty-text {
      width: auto;
    }
  }
}
</style>
