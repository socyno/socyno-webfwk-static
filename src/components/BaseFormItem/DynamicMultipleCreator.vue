<template>
  <div class="dynamic-value-creation">
    <el-dialog v-if="editable" class="dynamic-value-dialog" title="添加" :visible.sync="showFormDialog" width="80%" height="600px" append-to-body>
      <BaseFormEditor
        v-if="fieldModel && fieldModel.listItemCreationFormClass"
        :form-id="formId"
        :form-name="formName"
        :form-data="curentCreationFormData"
        :form-model="fieldModel.listItemCreationFormClass"
        :parent-field-models="parentFieldModels"
        @input="listItemSaved"
        @cancel="showFormDialog = false"
      />
    </el-dialog>
    <el-button v-if="editable" type="primary" size="mini" @click="onCreate()">
      添加
    </el-button>
    <el-table :key="fieldModel.key" :data="value" style="width: 99%">
      <slot v-for="(column, idx) in curentCreationFormColumns">
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
          <el-button size="mini" type="primary" @click="onEdit(scope.$index, scope.row)">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import tool from '@/utils/tools'
import BaseFormEditor from '@/components/BaseFormEditor'
import { getFieldValueDisplay, getVisibleFieldModels } from '@/utils/formUtils'
import TemplateConfig from '@/components/BaseFormItem/TemplateConfig'
export default {
  name: 'DynamicValueCreator',
  components: {
    BaseFormEditor,
    TemplateConfig
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
      default: null
    },
    parentFieldModels: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      showFormDialog: false,
      curentCreationFormData: {},
      curentCreationFormColumns: []
    }
  },
  watch: {
    fieldModel: {
      immediate: true,
      handler(fieldModel) {
        if (!fieldModel || !fieldModel.listItemCreationFormClass) {
          return
        }
        this.curentCreationFormColumns = getVisibleFieldModels(fieldModel.listItemCreationFormClass)
      }
    }
    // , parentFieldModels: {
    //   immediate: true,
    //   handler(newValue) {
    //     console.log('字段项动态创建接收的父表单数据模型为：', newValue)
    //   }
    // }
  },
  methods: {
    /**
     * 添加数据项
     */
    onCreate() {
      this.curentCreationFormData = {}
      this.showFormDialog = true
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
      this.curentCreationFormData = item
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
     * 新的值被创建或编辑
     */
    listItemSaved(params) {
      // console.log('动态添加项存储：', params)
      if (!params || !tool.isPlainObject(params)) {
        return
      }
      this.showFormDialog = false
      if (!tool.isArray(this.value)) {
        this.value = []
      }
      if (this.curentCreationFormData && this.curentCreationFormData['__new_index']) {
        var newIndex = tool.inArray(this.curentCreationFormData, this.value, function(a, b) {
          return a['__new_index'] === b['__new_index']
        })
        if (newIndex >= 0) {
          this.value.splice(newIndex, 1)
        }
      }
      this.value.push(params)
      // console.log('动态添加项存储添加完成：', this.value)
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
      var fieldIndex = tool.inArray(column.property, this.curentCreationFormColumns, function(a, b) {
        return a.key === b
      })
      // console.log('列表格式化，当前的列号为：', fieldIndex)
      // console.log('列表格式化，当前的数据为', cellValue)
      var fieldModel = this.curentCreationFormColumns[fieldIndex]
      return getFieldValueDisplay(fieldModel, cellValue)
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
