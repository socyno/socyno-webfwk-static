<template>
  <div class="basic-form-list">
    <el-table
      ref="eltable"
      :data="data"
      :default-expand-all="expandAll"
      style="width: 100%"
      @expand-change="onRowExpandChanged"
      @selection-change="onSelectionChanged"
    >
      <el-table-column v-if="selectable" type="selection" width="50" />
      <el-table-column type="expand">
        <template slot-scope="props">
          <BaseFormContent
            v-if="formModel"
            :editable="false"
            :form-name="formName"
            :form-model="formModel"
            :default-data="props.row"
          />
        </template>
      </el-table-column>
      <slot v-for="(field, idx) in fieldModels">
        <el-table-column v-if="field.template" :key="idx" :label="field.title" :prop="field.key">
          <template slot-scope="scope">
            <TemplateConfig :template="field.template" :field-model="field" :form-data="data[scope.$index]" />
          </template>
        </el-table-column>
        <el-table-column
          v-else
          :key="idx"
          :width="field.listWidth ? field.listWidth : 0"
          :formatter="columnFormatter"
          :label="field.title"
          :prop="field.key"
        />
      </slot>
      <el-table-column v-if="rowActions && rowActions.length > 0" fixed="right" label="操作">
        <template slot-scope="scope">
          <slot v-for="(action) in rowActions">
            <el-button v-show="checkActionVisible(action, scope.row, scope.$index)" :type="action.type || 'text'" @click="onRowActionClick(action, scope.row, scope.$index)">
              {{ action.display || action.text || action.name || action.key }}
            </el-button>
          </slot>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="pageInfo"
      class="pagesbar"
      :current-page="pageInfo.page"
      :page-sizes="pageInfo.sizes"
      :page-size="pageInfo.limit"
      :layout="pageInfo.layout"
      :total="pageInfo.total"
      @size-change="onSizeChanged"
      @current-change="onPageChanged"
    />
  </div>
</template>
<script>

import '@/styles/form.scss'
import tool from '@/utils/tools'
import { parseFormClass, getFieldValueDisplay, getVisibleFieldModels } from '@/utils/formUtils'
import TemplateConfig from '@/components/BaseFormItem/TemplateConfig'
export default {
  components: {
    TemplateConfig,
    BaseFormContent: () => import('../BaseFormContent')
  },
  props: {
    data: {
      type: Array,
      default: function() {
        return []
      }
    },
    columns: {
      type: [Array, Object],
      default: function() {
        return []
      }
    },
    paging: {
      type: Object,
      default: null
    },
    selectable: {
      type: Boolean,
      default: false
    },
    expandAll: {
      type: Boolean,
      default: false
    },
    rowActions: {
      type: Array,
      default: function() {
        return []
      }
    },
    rowActionsData: {
      type: Object,
      default: null
    },
    formName: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      pageInfo: null,
      formModel: null,
      fieldModels: []
    }
  },
  watch: {
    columns: {
      immediate: true,
      handler(columns) {
        // console.log('表格视图模型 => ', columns)
        if (tool.isArray(columns)) {
          this.formModel = null
          this.fieldModels = columns
        } else if (tool.isPlainObject(columns)) {
          this.formModel = parseFormClass(columns)
          this.fieldModels = getVisibleFieldModels(columns, 'list')
        }
      }
    }
  },
  mounted() {
    this.setPaging(this.paging)
  },
  methods: {
    /**
     * 列表格式化
     * @param {Object} row
     * @param {Object} column
     * @param {Object} cellValue
     * @param {Object} index
     */
    columnFormatter(row, column, cellValue, index) {
      var fieldIndex = tool.inArray(column.property, this.fieldModels, function(a, b) {
        return a.key === b
      })
      // console.log('列表格式化，当前的列号为：', fieldIndex)
      // console.log('列表格式化，当前的数据为', cellValue)
      var fieldModel = this.fieldModels[fieldIndex]
      return getFieldValueDisplay(fieldModel, cellValue)
    },

    /**
     * 翻页时的回调
     */
    onPageChanged(page) {
      this.pageInfo.page = page
      this.$emit('paging', page, this.pageInfo.limit)
    },

    /**
     * 页面大小调整时的回调
     */
    onSizeChanged(limit) {
      this.pageInfo.limit = limit
      this.$emit('paging', this.pageInfo.page, limit)
    },

    /**
     * 选中项发生变化时
     * @param {Object} rows
     */
    onSelectionChanged(rows) {
      this.$emit('input', rows)
    },

    /**
     * 行展开或收缩时的回调
     * @param {Object} rows
     */
    onRowExpandChanged(rows, expanedRows) {
      this.$emit('expand-change', rows, expanedRows)
    },

    /**
     * 清除选中的行数据
     */
    clearSelection() {
      this.$refs.eltable.clearSelection()
    },

    /**
     * 行操作按钮触发回调
     */
    onRowActionClick(action, rowData, rowIndex) {
      this.$emit('row-action-click', action, rowData, rowIndex)
    },

    /**
     * 确认当前的操作按钮是否显示
     * 如果父组件中定义有 checkActionVisible 方法，则会交由父组件来决定是否显示。
     * @param {Object} action
     * @param {Object} rowData
     * @param {Object} rowIndex
     */
    checkActionVisible(action, rowData, rowIndex) {
      if (!tool.isFunction(this.$parent.checkRowActionVisible)) {
        return true
      }
      return this.$parent.checkRowActionVisible(action, rowData, rowIndex)
    },

    /**
     * 当分页信息发生变化时触发器
     */
    setPaging(paging) {
      if (!paging || !tool.isPlainObject(paging)) {
        this.pageInfo = null
        return
      }
      this.pageInfo = {
        page: 1,
        limit: 20,
        sizes: [10, 20, 30, 50, 100],
        layout: 'prev, next',
        total: -1
      }
      var limit
      if (!isNaN(limit = parseInt(paging.limit)) && limit > 0) {
        this.pageInfo.limit = limit
      }
      var page
      if (!isNaN(page = parseInt(paging.page)) && page > 0) {
        this.pageInfo.page = page
      }
      var total
      if (!isNaN(total = parseInt(paging.total)) && total >= 0) {
        this.pageInfo.total = total
        this.pageInfo.layout = 'total, sizes, prev, pager, next, jumper'
      }
      if (tool.isArray(paging.sizes)) {
        this.pageInfo.sizes = paging.sizes
      }
    },

    /**
     * call toggleRowExpansion on table
     */
    toggleRowExpansion(row, expanded) {
      this.$refs.eltable.toggleRowExpansion(row, expanded)
    }
  }
}
</script>
