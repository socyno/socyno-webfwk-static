<template>
  <div class="dynamic-value-selector">
    <el-dialog v-if="editable" class="dynamic-value-dialog" title="编辑" :visible.sync="showEditionFormDialog" width="80%" height="600px" append-to-body>
      <BaseFormEditor
        v-if="currentTableFormModel"
        :form-id="formId"
        :form-name="formName"
        :form-data="curentEditionFormData"
        :form-model="currentTableFormModel"
        :parent-field-models="parentFieldModels"
        @input="editionItemSaved"
        @cancel="showEditionFormDialog = false"
      />
    </el-dialog>
    <el-dialog v-if="editable" class="dynamic-value-dialog" title="选择" :visible.sync="showFormDialog" width="80%" height="600px" append-to-body>
      <BaseFormSelector
        v-if="fieldModel && availableQueryModels"
        ref="filter"
        :selectable="true"
        :form-id="formId"
        :form-name="formName"
        :query-models="availableQueryModels"
        :table-columns="currentTableColumns"
        :table-init-data="availableTableData"
        :table-page-info="availableTablePager"
        :parent-field-models="parentFieldModels"
        @input="saveSelectedRows"
        @cancel="showFormDialog = false"
        @query-apply="onQueryApply"
      />
    </el-dialog>
    <div v-if="editable && fieldModel && !fieldModel.readonly">
      <el-button v-if="fieldModel && availableQueryModels" type="primary" size="mini" @click="onSelect()">
        选择
      </el-button>
      <DynamicSingleSelector
        v-else
        ref="selector"
        :form-id="formId"
        :form-name="formName"
        :field-model="fieldModel"
        :multiple="simpleMultipleMode"
        :parent-field-models="parentFieldModels"
        :option-is-visible="checkOptionIsVisible"
        :placeholder="placeholder"
        @clear="onSelectorCleared"
        @change="onSelectorChanged"
      />
    </div>
    <div v-else-if="simpleMultipleMode">
      {{ getFieldValueDisplay(fieldModel, fieldModel.value) }}
    </div>
    <el-table v-if="!simpleMultipleMode" :key="fieldModel.key" :data="value" style="width: 99%">
      <slot v-for="(column, idx) in currentTableColumns">
        <el-table-column v-if="column.template" :key="`${column.key}-${idx}`" :label="column.title" :prop="column.key">
          <template slot-scope="scope">
            <TemplateConfig :template="column.template" :field-model="column" :form-data="value[scope.$index]" />
          </template>
        </el-table-column>
        <el-table-column v-else :key="`${column.key}-${idx}`" :label="column.title" :prop="column.key">
          <template slot-scope="scope">
            {{ getFieldValueDisplay(column, scope.row[column.key]) }}
          </template>
        </el-table-column>
      </slot>
      <el-table-column v-if="editable" label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" @click="onDelete(scope.$index, scope.row)">
            删除
          </el-button>
          <el-button v-if="dynamicSelectedEditable" size="mini" type="primary" @click="onEdit(scope.$index, scope.row)">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import tool from '@/utils/tools'
import FormApi from '@/apis/formApi'
import BaseFormEditor from '@/components/BaseFormEditor'
import DynamicSingleSelector from './DynamicSingleSelector'
import BaseFormSelector from '@/components/BaseFormSelector'
import TemplateConfig from '@/components/BaseFormItem/TemplateConfig'
import { getFieldValueDisplay, getVisibleFieldModels, FORM_FIELD_OPTIONS } from '@/utils/formUtils'
export default {
  components: {
    TemplateConfig,
    BaseFormEditor,
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
    },
    placeholder: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      showFormDialog: false,
      currentTableColumns: [],
      currentTableFormModel: null,
      availableTableData: [],
      availableTablePager: {},
      availableQueryModels: null,
      showEditionFormDialog: false,
      curentEditionFormData: {}
    }
  },
  computed: {
    /**
     * 非多列显示且无自定义选择器的场景下,
     * 使用 el-select 的标准多选控件即可
     */
    simpleMultipleMode() {
      return !this.fieldModel.dynamicSelectedEditable && !this.availableQueryModels && this.currentTableColumns.length === 1
    },
    dynamicSelectedEditable() {
      return this.fieldModel && this.fieldModel.dynamicSelectedEditable
    }
  },
  watch: {
    fieldModel: {
      immediate: true,
      handler: function(fieldModel) {
        if (!fieldModel) {
          return
        }
        this.availableQueryModels = null
        if (fieldModel.dynamicFilterFormClass) {
          this.availableQueryModels = [{
            formClass: fieldModel.dynamicFilterFormClass
          }]
        }
        // console.log(fieldModel)
        this.currentTableFormModel = fieldModel.items
        this.currentTableColumns = getVisibleFieldModels(
          fieldModel.items,
          FORM_FIELD_OPTIONS.ListFirst |
            FORM_FIELD_OPTIONS.OrderUndefinedExcluded
        )
      }
    },
    formName: {
      immediate: true,
      handler: function(formName) {
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
     * 编辑数据项
     * @param {Object} params
     */
    onEdit(index, item) {
      if (!item) {
        return
      }
      item['__new_index'] = tool.genUuid()
      this.curentEditionFormData = item
      this.showEditionFormDialog = true
    },
    /**
     * 完成选中项的编辑并保存
     */
    editionItemSaved(params) {
      if (!params || !tool.isPlainObject(params)) {
        return
      }
      this.showEditionFormDialog = false
      if (!tool.isArray(this.value)) {
        return
      }
      var newIndex = tool.inArray(this.curentEditionFormData, this.value, function(a, b) {
        return a['__new_index'] === b['__new_index']
      })
      if (newIndex < 0) {
        return
      }
      this.value.splice(newIndex, 1, params)
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
     * 简单选择项被清空时的回调, 只有的单列多选时才需要处理
     */
    onSelectorCleared() {
      if (this.simpleMultipleMode) {
        this.value = []
        this.$emit('input', this.value)
      }
    },
    /**
     * 简单选择项被选中时
     */
    onSelectorChanged(option) {
      if (!tool.isArray(this.value)) {
        this.value = []
      }
      if (!tool.isArray(option)) {
        option = [option]
      }
      if (this.simpleMultipleMode) {
        this.value = option
      } else {
        for (var o of option) {
          this.value.push(o)
        }
        /**
         * 选中后多列模式下强制失焦,以确保下次下拉可重建选项
         */
        this.$refs.selector.blur()
      }
      this.$emit('input', this.value)
    },
    /**
     * 格式化字段的显示文本
     * @param {Object} fieldModel
     * @param {Object} fieldValue
     */
    getFieldValueDisplay(fieldModel, fieldValue) {
      // console.log(fieldModel, fieldValue)
      return getFieldValueDisplay(fieldModel, fieldValue)
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
        this.availableTableData = res.data ? res.data : []
        // console.log('动态可选项复杂检索结果如下', res.data)
      }).finally(res => {
        loading.close()
      })
    },
    /**
     * 过滤已经选择的待选项
     */
    checkOptionIsVisible(option) {
      if (this.simpleMultipleMode) {
        return true
      }
      if (!option || !option.hasOwnProperty('optionValue')) {
        return true
      }
      if (!tool.isArray(this.value) || this.value.length <= 0) {
        return true
      }
      return tool.inArray(option, this.value, function(a, b) {
        return a === b || tool.stringify(a.optionValue) === tool.stringify(b.optionValue)
      }) < 0
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
