<template>
  <div v-loading="loading" class="form-query-result-list">
    <BaseFormQuery
      v-if="queries && queries.length > 0"
      :form-name="formName"
      :query-models="queries"
      @input="onQueryApply"
      @change="onQueryChanged"
    />

    <BaseActionsPane
      v-if="actions"
      :actions="actions"
      @input="onFormActionTriggerd"
    />

    <BaseFormTable
      v-show="currentQuery && currentQuery.resultClass && currentTableData"
      ref="formTable"
      :form-name="formName"
      :data="currentTableData"
      :columns="currentQuery.resultClass"
      :row-actions="rowActions"
      @paging="pageListData"
      @expand-change="onRowExpandChanged"
      @row-action-click="onRowActionClick"
    />

    <el-drawer
      ref="detailDrawer"
      :visible.sync="rowDetailDrawer.visible"
      class="row-form-detail-drawer"
      custom-class="row-form-detail-wrapper"
      :with-header="false"
      :modal="false"
      :append-to-body="true"
    >
      <BaseFormDetail
        :form-top="60"
        :form-id="rowDetailDrawer.formId || ''"
        :form-name="formName"
        @back="rowDetailDrawer.visible = false"
        @delete="onRowFormDeleted"
        @change="onRowFormChanged"
      />
    </el-drawer>

    <el-drawer
      ref="createDrawer"
      :visible.sync="rowCreateDrawer.visible"
      class="row-form-create-drawer"
      custom-class="row-form-create-wrapper"
      :with-header="false"
      :modal="false"
      :append-to-body="true"
    >
      <BaseFormAction
        ref="createForm"
        class="row-form-create-content"
        @cancel="onRowCreatorCancel"
        @prepare="onRowCreatorPrepare"
        @create="onRowCreatorCommit"
      />
    </el-drawer>
  </div>
</template>
<script>

import '@/styles/form.scss'
import tool from '@/utils/tools'
import FormApi from '@/apis/formApi'
import { getFieldValueDisplay, getVisibleFieldModels } from '@/utils/formUtils'
import BaseFormQuery from '@/components/BaseFormQuery'
import BaseFormTable from '@/components/BaseFormTable'
import BaseFormAction from '@/components/BaseFormAction'
import BaseFormDetail from '@/components/BaseFormDetail'
import BaseActionsPane from '@/components/BaseActionsPane'
export default {
  components: {
    BaseActionsPane,
    BaseFormQuery,
    BaseFormAction,
    BaseFormTable,
    BaseFormDetail
  },
  data() {
    return {
      loading: false,
      actions: [],
      queries: [],
      pagingInfo: null,
      currentQuery: null,
      rowActions: [
        {
          text: '展开',
          onClick: function(row, index) {
            this.$refs.formTable.toggleRowExpansion(row, true)
          },
          visible: function(row, index) {
            return !this.getRowExpansionVisible(row)
          }
        },
        {
          text: '收起',
          onClick: function(row, index) {
            this.$refs.formTable.toggleRowExpansion(row, false)
          },
          visible: function(row, index) {
            return this.getRowExpansionVisible(row)
          }
        },
        {
          text: '新窗口',
          onClick: function(row, index) {
            this.open(`#/form/detail?formName=${this.formName}&formId=${row.id}`)
          }
        },
        {
          text: '流程',
          onClick: function(row, index) {
            this.open(`#/form/flowchart/${this.formName}?formId=${row.id}`)
          }
        },
        {
          text: '详情',
          onClick: function(row, index) {
            this.showFormDetail(row.id)
          }
        }
      ],
      formName: null,
      currentFieldModels: null,
      filterParams: null,
      rowActionsData: null,
      currentTableData: null,
      rowDetailDrawer: null,
      rowCreateDrawer: null
    }
  },
  watch: {
    '$route'(to, from) {
      this.resetAllData()
      this.initFormDefinition()
    }
  },
  created() {
    this.resetAllData()
  },
  mounted() {
    this.initFormDefinition()
  },
  methods: {
    /**
     * 重置所有数据
     */
    resetAllData() {
      this.loading = false
      this.actions = []
      this.queries = []
      this.pagingInfo = {
        page: 1,
        limit: 10,
        total: -1
      }
      this.currentFieldModels = []
      this.filterParams = {}
      this.currentQuery = {
        formClass: {}
      }
      this.currentFieldModels = {}
      this.formName = this.$route.params.formName
      this.formApi = new FormApi(this.formName)
      this.initAction = this.$route.query ? this.$route.query._action : ''
      this.resetPageData()
    },

    /**
     * 重置当前页的数据
     */
    resetPageData() {
      this.loading = false
      this.rowActionsData = null
      this.currentTableData = null
      this.rowDetailDrawer = {
        formId: '',
        visible: false
      }
      this.rowCreateDrawer = {
        visible: false
      }
    },

    /**
     * 列表格式化
     * @param {Object} row
     * @param {Object} column
     * @param {Object} cellValue
     * @param {Object} index
     */
    columnFormatter(row, column, cellValue, index) {
      var fieldIndex = tool.inArray(column.property, this.currentFieldModels, function(a, b) {
        return a.key === b
      })
      // console.log('列表格式化，当前的列号为：', fieldIndex)
      // console.log('列表格式化，当前的数据为', cellValue)
      var fieldModel = this.currentFieldModels[fieldIndex]
      return getFieldValueDisplay(fieldModel, cellValue)
    },
    /**
     * 查询重置的回调
     */
    onQueryReset() {
      window.location.reload()
    },
    /**
     * 查询触发的回调
     */
    onQueryApply(params) {
      console.log('查询的参数数据如下：', params)
      this.filterParams = params
      this.initListData()
    },
    /**
     * 查询切换时的回调
     */
    onQueryChanged(changedQuery) {
      if (!changedQuery) {
        return
      }
      console.log('切换查询如下：', changedQuery)
      this.filterParams = {}
      this.currentQuery = changedQuery
      this.currentFieldModels = getVisibleFieldModels(changedQuery.resultClass)
      this.initListData()
    },
    /**
     * 加载流程表单的定义
     */
    initFormDefinition() {
      this.loading = true
      this.formApi.loadDefinition().then((data) => {
        this.queries = data.queries
        this.actions = data.quickActions
        tool.title(data.title || '表单列表', true)
      }).finally(res => {
        this.loading = false
      })
    },
    /**
     * 重置结果列表（回首页）
     */
    initListData() {
      var params = {}
      this.resetPageData()
      this.pagingInfo.page = 1
      Object.assign(params, this.pagingInfo)
      Object.assign(params, this.filterParams)
      this.loading = true
      this.formApi.queryFormPagedData(this.currentQuery.name, params, true).then((data) => {
        this.pagingInfo.total = data.total
        this.currentTableData = data.list || []
        this.$nextTick(function() {
          this.$refs.formTable.setPaging(this.pagingInfo)
          if (!tool.isBlank(this.initAction)) {
            var initAction = this.initAction
            this.initAction = ''
            var initActionIndex = tool.inArray(initAction, this.actions, function(a, v) {
              return a.name === v
            })
            if (initActionIndex < 0) {
              this.$notify.error(`初始化事件(${initAction})不存在或未经授权`)
              return
            }
            this.onFormActionTriggerd(initAction, this.actions[initActionIndex])
          }
        })
      }).finally(() => {
        this.loading = false
      })
    },
    /**
     * 结果列表翻页
     */
    pageListData(page, limit) {
      var params = {}
      this.resetPageData()
      this.pagingInfo.page = page
      this.pagingInfo.limit = limit
      Object.assign(params, this.pagingInfo)
      Object.assign(params, this.filterParams)
      this.loading = true
      this.formApi.queryFormPagedData(this.currentQuery.name, params).then((data) => {
        this.currentTableData = data.list || []
      }).finally(() => {
        this.loading = false
      })
    },

    // 处理action回调
    onFormActionTriggerd(actionName, formAction) {
      this.rowCreateDrawer.visible = true
      this.$nextTick(function() {
        this.$refs.createForm.create(this.formName, formAction, this.$route.query)
      })
    },

    /**
     *  在新窗口中打开指定页面
     */
    open(linkUrl) {
      tool.open(linkUrl)
    },

    /**
     * 行操作按钮点击的回调方法
     */
    onRowActionClick(action, row, index) {
      if (!tool.isFunction(action.onClick)) {
        return
      }
      action.onClick.call(this, row, index)
    },

    /**
     * 行操作按钮是否显示的回调方法
     */
    checkRowActionVisible(action, row, index) {
      if (!tool.isFunction(action.visible)) {
        return true
      }
      return action.visible.call(this, row, index)
    },

    /**
     * 行展开时的回调方法
     * @param {Object} index
     */
    onRowExpandChanged(row, expandRows) {
      if (!this.rowActionsData) {
        this.rowActionsData = {}
      }
      this.rowActionsData.expansion = expandRows
    },

    /**
     * 确认指定行是否为展开状态
     * @param {Object} row
     */
    getRowExpansionVisible(row) {
      return this.rowActionsData && this.rowActionsData.expansion &&
        tool.inArray(row, this.rowActionsData.expansion) >= 0
    },

    /**
     * 加载并显示操作事件面板
     * @param {Number} formId
     */
    showFormDetail(formId) {
      this.rowDetailDrawer.visible = true
      this.rowDetailDrawer.formId = formId
    },

    /**
     * 表单内容更新回调
     */
    onRowFormChanged(resData, formName, formId, formAction) {
      /* 更新结果集中的当前数据 */
      this.formApi.loadNamedQueryFormData(this.currentQuery.name, formId).then((data) => {
        var newTableData = []
        var length = this.currentTableData.length
        for (var r = length - 1; r >= 0; r--) {
          if (this.currentTableData[r].id === data.id) {
            // console.log('替换当前列表中的数据项：', r, ' => ', data)
            // 防止单数据中存在重复项时，引发展开和收起的功能同时生效
            newTableData[r] = tool.jsonCopy(data)
          } else {
            newTableData[r] = this.currentTableData[r]
          }
        }
        this.currentTableData = newTableData
      })
    },

    /**
     * 表单内容更新回调
     */
    onRowFormDeleted(resData, formName, formId, formAction) {
      /* 当事件为删除时，则关闭详情页并从表格中移除数据 */
      this.$refs.detailDrawer.closeDrawer()
      var newTableData = []
      for (var item of this.currentTableData) {
        if (tool.trim(item.id) === tool.trim(formId)) {
          continue
        }
        newTableData.push(item)
      }
      this.currentTableData = newTableData
    },

    /**
     * 创建事件取消的回调
     */
    onRowCreatorCancel() {
      this.rowCreateDrawer.visible = false
    },

    /**
     * 创建事件就绪的回调
     */
    onRowCreatorPrepare() {

    },

    /**
     * 创建事件提交的回调
     */
    onRowCreatorCommit(resData, formName, formId, formAction) {
      this.rowCreateDrawer.visible = false
      /* 立即展示新创建表单详情 */
      this.showFormDetail(formId)
      /* 并添加已创建的记录到列表的前面 */
      this.formApi.loadNamedQueryFormData(this.currentQuery.name, formId).then((data) => {
        // console.log('替换当前列表中的数据项：', data, this.currentTableData)
        var newTableData = [data]
        for (var item of this.currentTableData) {
          newTableData.push(item)
        }
        this.currentTableData = newTableData
      })
    }
  }
}
</script>
<style lang="scss">
.form-query-result-list {
}
.row-form-detail-drawer {
  top: 60px !important;
  .row-form-detail-wrapper {
    display: block !important;
    width: 100% !important;
  }
}
.row-form-create-drawer {
  top: 60px !important;
  .row-form-create-wrapper {
    display: block !important;
    width: 100% !important;
    .row-form-create-content {
      position: absolute !important;
      top: 0px !important;
      left: 0px !important;
      right: 0px !important;
      bottom: 0px !important;
      overflow-y: auto;
    }
  }
}
</style>
