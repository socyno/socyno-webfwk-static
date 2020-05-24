<template>
  <div v-loading="loading" class="common-form">
    <BaseFormGenerator :form-class="filterData" @input="handleQuery" @cancle="handleReset" />

    <BaseFormActions :actions="definition.actions" exportbtn @input="onActionBtnClick" />

    <div class="common-form-tablebar">
      <el-table :data="tableData" style="width: 100%">
        <template slot="empty">
          <div>{{ errorMessage || '暂无数据' }}</div>
        </template>
        <slot v-for="(item,idx) in tableColumns">
          <el-table-column :key="idx" :label="item.title" :prop="item.key" :formatter="columnFormatter" />
        </slot>
        <el-table-column fixed="right" label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="text" @click="showDetails(scope.row.id)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <BasePagination
        v-model="pageData"
        :options="pageData"
        :total="totalCount"
        @change="loadPagedData()"
      />
    </div>
  </div>
</template>
<script>
import BaseFormGenerator from '@/components/BaseFormGenerator'
import BasePagination from '@/components/BasePagination'
import BaseFormActions from '@/components/BaseFormActions'
import tool from '@/utils/tools.js'
import * as formUtil from '@/utils/formUtils.js'
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
      errorMessage: '',
      pageData: {
        limit: 20,
        page: 1
      },
      totalCount: 0
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
      this.loadPagedData(true)
    },

    /**
     * 加载表单定义及数据
     */
    reloadAllData() {
      this.loading = true
      this.formApi.loadDefinition().then(definition => {
        this.definition = definition
        this.$jian.tool.title(this.definition.title, true)
        this.initQuery(0)
      }).catch(e => {
        this.tableData = []
        this.errorMessage = '加载表单定义数据失败'
      }).finally(res => {
        this.loading = false
      })
    },
    /**
     * 选择当前的查询
     * @param {integer} queryIndex
     */
    initQuery(queryIndex) {
      var queryDefinition
      if (!tool.isNumber(queryIndex) || !(queryDefinition = this.definition.queries[queryIndex])) {
        this.$message.error('选择的查询不存在')
        return
      }
      // console.log(this.queryDefinition)
      this.filterData = queryDefinition.formClass
      // console.log('The following is query form :')
      // console.log(this.filterData)
      this.tableColumns = formUtil.getSortedVisibleColumns(queryDefinition.resultClass)
      // console.log('The following is result set form :')
      // console.log(this.tableColumns)
      this.loadPagedData(true)
    },

    /**
     * 结果集分页数据加载
     */
    loadPagedData(resetQuery) {
      var params = {}
      // console.log(resetQuery)
      if (resetQuery === true) {
        this.pageData.page = 1
      }
      Object.assign(params, this.pageData)
      Object.assign(params, this.filterParams)
      this.loading = true
      this.formApi.queryFormPagedData(params, resetQuery === true).then(data => {
        this.tableData = data.list
        if (resetQuery) {
          this.totalCount = data.total
        }
      }).catch(e => {
        this.tableData = []
        this.errorMessage = '加载表单列表数据失败'
        return Promise.reject(e)
      }).finally(res => {
        this.loading = false
      })
    },

    /**
     * 列表字段显示格式化
     * @param {Object} row
     * @param {Object} column
     * @param {Object} cellValue
     * @param {Object} index
     */
    columnFormatter(row, column, cellValue, index) {
      // console.log("Formatting table column is : ")
      // console.log(column)
      var columnKey = column.property
      var columnIndex = this.$jian.tool.inArray(columnKey, this.tableColumns, function(a, b) {
        // console.log(a)
        // console.log(b)
        return b === a.key
      })
      if (columnIndex < 0) {
        return '<#NULL>'
      }
      var columnDefinition = this.tableColumns[columnIndex]
      // console.log("Formatting table column definition is : ")
      // console.log(columnDefinition)
      return formUtil.getFieldValueDisplay(columnDefinition, cellValue)
    },

    /**
     * 展示表单详情数据
     * @param {Object} formId
     */
    showDetails(formId) {
      var formName = this.formApi.getFormName()
      if (!formName || !formId) {
        return
      }
      window.$openIframeDialog({
        title: this.$jian.tool.title(this.definition.title + ' - 详情：' + formId),
        src: `#/form/detail?formId=${formId}&formName=${formName}`
      })
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
