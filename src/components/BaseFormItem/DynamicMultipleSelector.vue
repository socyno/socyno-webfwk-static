<template>
  <div class="dynamic-value-selector">
    <el-dialog v-if="editable" class="dynamic-value-dialog" title="选择" :visible.sync="showFormDialog" width="80%" height="600px" append-to-body>
      <BaseFormSelector
        v-if="fieldModel && fieldModel.dynamicFilterFormClass"
        :selectable="true"
        :form-id="formId"
        :form-name="formName"
        :query-models="curentQueryModels"
        :table-columns="currentTableColumns"
        :table-init-data="currentTableData"
        :table-page-info="currentTablePager"
        :parent-field-models="parentFieldModels"
        @input="saveSelectedRows"
        @cancel="showFormDialog = false"
        @query-apply="onQueryApply"
      />
    </el-dialog>
    <div v-if="editable && fieldModel && !fieldModel.readonly">
      <el-button v-if="fieldModel.dynamicFilterFormClass" type="primary" size="mini" @click="onSelect()">
        选择
      </el-button>
      <DynamicSingleSelector
        v-else
        :form-id="formId"
        :form-name="formName"
        :field-model="fieldModel"
        :parent-field-models="parentFieldModels"
        @change="onSingleSelected"
      />
    </div>
    <el-table :key="fieldModel.key" :data="value" style="width: 99%">
      <slot v-for="(column, idx) in currentTableColumns">
        <el-table-column v-if="column.template" :key="`${column.key}-${idx}`" :label="column.title" :prop="column.key">
          <template slot-scope="scope">
            <TemplateConfig :template="column.template" :field-model="column" :form-data="value[scope.$index]" />
          </template>
        </el-table-column>
        <el-table-column v-else :key="`${column.key}-${idx}`" :formatter="columnFormatter" :label="column.title" :prop="column.key" />
      </slot>
      <el-table-column v-if="editable" label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" @click="onDelete(scope.$index, scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import tool from '@/utils/tools'
import FormApi from '@/apis/formApi'
import DynamicSingleSelector from './DynamicSingleSelector'
import BaseFormSelector from '@/components/BaseFormSelector'
import TemplateConfig from '@/components/BaseFormItem/TemplateConfig'
import { getFieldValueDisplay, getVisibleFieldModels } from '@/utils/formUtils'
export default {
  components: {
    TemplateConfig,
    BaseFormSelector,
    DynamicSingleSelector
  },
  props: {
    value: {
      type: Array,
      default: function() {
        return []
      }
    },
    editable: {
      type: Boolean,
      default: false
    },
    fieldModel: {
      type: Object,
      required: true
    },
    formId: {
      type: [String, Number],
      default: null
    },
    formName: {
      type: String,
      required: true
    },
    parentFieldModels: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      showFormDialog: false,
      curentQueryModels: [],
      currentTableColumns: [],
      currentTableData: [],
      currentTablePager: {}
    }
  },
  watch: {
    fieldModel: {
      immediate: true,
      handler(fieldModel) {
        if (!fieldModel) {
          return
        }
        if (fieldModel.dynamicFilterFormClass) {
          this.curentQueryModels = [{
            formClass: fieldModel.dynamicFilterFormClass
          }]
        }
        this.currentTableColumns = getVisibleFieldModels(fieldModel.items)
      }
    },
    formName: {
      immediate: true,
      handler(formName) {
        if (tool.isBlank(formName)) {
          this.formApi = null
          return
        }
        this.formApi = new FormApi(formName)
      }
    }
  },
  methods: {
    /**
     * 添加数据项
     */
    onSelect() {
      this.showFormDialog = true
    },
    /**
     * 删除数据项
     * @param {Object} params
     */
    onDelete(index, item) {
      this.value.splice(index, 1)
      this.$emit('input', this.value)
    },
    /**
     * 新的值被选中
     */
    saveSelectedRows(rows) {
      this.showFormDialog = false
      if (!tool.isArray(rows)) {
        return
      }
      if (!tool.isArray(this.value)) {
        this.value = []
      }
      for (const row of rows) {
        this.value.push(row)
      }
      this.$emit('input', this.value)
    },
    /**
     * 简单选择项被选中时
     */
    onSingleSelected(option) {
      if (!tool.isArray(this.value)) {
        this.value = []
      }
      this.value.push(option)
      this.$emit('input', this.value)
    },
    /**
     * 列表格式化
     * @param {Object} row
     * @param {Object} column
     * @param {Object} cellValue
     * @param {Object} index
     */
    columnFormatter(row, column, cellValue, index) {
      var fieldIndex = tool.inArray(column.property, this.currentTableColumns, function(a, b) {
        return a.key === b
      })
      // console.log('列表格式化，当前的列号为：', fieldIndex)
      // console.log('列表格式化，当前的数据为', cellValue)
      var fieldModel = this.currentTableColumns[fieldIndex]
      return getFieldValueDisplay(fieldModel, cellValue)
    },
    /**
     * 可选列表数据查询
     */
    onQueryApply(query) {
      // console.log('动态可选项复杂检索参数如下：', query)
      if (!this.formApi) {
        throw new Error('当前的表单还未设置，请确认流程单上下文正确设置')
      }
      var params = {}
      if (this.parentFieldModels && tool.isArray(this.parentFieldModels)) {
        for (const field of this.parentFieldModels) {
          params[field.key] = field.value
        }
      }
      var keyword = ''
      if (tool.isPlainObject(query)) {
        Object.assign(params, query)
      } else {
        keyword = query
      }
      var loading = this.$loading({ lock: true, text: 'Loading' })
      this.formApi.loadFormFieldOptionsWithQuery(
        this.fieldModel.fieldTypeKey,
        keyword,
        this.formId, params
      ).then(res => {
        this.currentTableData = res.data ? res.data : []
        // console.log('动态可选项复杂检索结果如下', res.data)
      }).finally(res => {
        loading.close()
      })
    }
  }
}
</script>
<style lang="scss">
.dynamic-value-creation {

}
.dynamic-value-dialog {

}
</style>
