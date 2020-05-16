<template>
  <div v-loading="loading" class="common-form">
    <BaseFormGenerator :data="filterData" @input="handleQuery" @cancle="handleReset" />

    <BaseFormActions :actions="actions" exportbtn @input="onActionBtnClick" @export="onExport" />

    <div v-show="appTypes.details" class="infonar-app-type">
      <div class="title">
        {{ appTypes.title }}
      </div>
      <div class="desc">
        <div v-for="(sub,subIdx) in appTypes.details" :key="subIdx">
          <span class="name">{{ sub.name }}</span>
          <span class="value">{{ sub.value }}</span>
          <span class="precent">/{{ sub.percent }}</span>
        </div>
      </div>
    </div>
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
// 应用数据 组件数据
// 应用分类
// 仓库分类
// 容器 虚拟机
// 生产 非生产

import BaseFormGenerator from '@/components/BaseFormGenerator'
import BasePagination from '@/components/BasePagination'
import BaseFormActions from '@/components/BaseFormActions'
import '@/styles/form.scss'
import formMixin from '@/utils/formMixins'

import FormApi from '@/apis/formApi'
export default {
  components: {
    BaseFormGenerator,
    BasePagination,
    BaseFormActions
  },
  mixins: [formMixin], // 继承form的工具
  data() {
    // var that = this
    return {
      filterData: {},
      infosData: [],
      appTypes: [],
      tableData: [],
      api: {},
      tableColumns: [],
      loading: false,
      filterParams: {}
    }
  },
  watch: {
    '$route'(to, from) {
      // 路由改变要重新刷数据 reload mounted
      this.reloadAllData()
    }
  },
  mounted() {
    this.reloadAllData()
  },
  methods: {
    onExport() {
      const ExportJsonExcel = require('js-export-excel')

      var option = {}

      var filterObjs = this.tableColumns.filter(item => {
        if (item.type === 'object') {
          return item
        }
      })

      var exportTableData = []
      for (const key in this.tableData) {
        var element = this.tableData[key]

        for (const objKey in filterObjs) {
          const filterObj = filterObjs[objKey]

          var temp = element[filterObj.key]
          var copiedElement = JSON.parse(JSON.stringify(element))
          copiedElement[filterObj.key] = temp.optionDisplay
          element = copiedElement
        }
        exportTableData.push(element)
      }

      option.fileName = 'export-' + this.$route.params.form_name
      option.datas = [
        {
          sheetData: exportTableData,
          sheetName: 'sheet',
          sheetFilter: this.tableColumns.map(r => r.key),
          sheetHeader: this.tableColumns.map(r => r.title),
          columnWidths: [20, 20]
        }
      ]

      var toExcel = new ExportJsonExcel(option) // new
      toExcel.saveExcel() // 保存
    },
    handleReset() {
      window.location.reload()
    },
    handleQuery(e) {
      this.filterParams = e
      this.initData()
    },
    reloadAllData() {
      this.loading = true
      var api = new FormApi(this.$route.params.form_name)
      this.api = api
      this.api.loadDefinitions().then(res => {
        this.actions = res.quickActions
        this.queries = res.queries[0]
        document.title = window.$title + ' - ' + (res.display || '表单列表')
        this.filterData = this.queries.queryClass
        this.tableColumns = this.tableColumnsProcess(this.queries.resultClass.properties)
        this.initData()
      }).catch(res => {
        this.loading = false
      })
    },
    tableColumnsProcess(resultClass) {
      var arr = []
      for (const iterator in resultClass) {
        var item = resultClass[iterator]
        item.key = iterator
        if (item.position) {
          arr.push(item)
        }
      }
      arr.sort((a, b) => a.position - b.position)

      return arr
    },
    initData() {
      var params = {}
      this.pageData.page = 1
      Object.assign(params, this.pageData)
      Object.assign(params, this.filterParams)
      this.api.loadFormListWithTotal(params).then(res => {
        this.tableData = res.data.list
        this.totalCount = res.data.total
        this.loading = false
      }).catch(res => {
        this.loading = false
      })
    },
    loadData() {
      this.loading = true
      var params = {}
      Object.assign(params, this.pageData)
      Object.assign(params, this.filterParams)
      this.api.loadFormList(params).then(res => {
        this.tableData = res.data.list
        this.loading = false
      }).catch(res => {
        this.loading = false
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
