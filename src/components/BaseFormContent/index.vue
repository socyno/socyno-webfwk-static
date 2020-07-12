<template>
  <BaseFormContentBase
    :editable="editable"
    :collapsible="collapsible"
    :field-models="fieldModelsEx"
  >
    <template v-slot:content="{ field }">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-if="field.contentip === 'top' && field.description" v-html="field.description" />
      <!-- 内嵌的表单 -->
      <div v-if="field.comType === 'innerForm'">
        <BaseFormContent
          v-for="(vitem, vindex) in field.value"
          :ref="`InnerForm:${field.key}`"
          :key="`${field.key}-${vindex}`"
          :form-id="formId"
          :form-name="formName"
          :form-model="field.items"
          :parent-field="field"
          :parent-field-models="parentFieldModelsConcat()"
          :default-data="vitem"
          :editable="editable && innerEditable && !field.readonly"
          :collapsible="innerCollapsible"
        />
      </div>
      <!-- 长文本本显示 -->
      <div v-else-if="field.comType === 'areaText'">
        <el-input
          v-if="editable && !field.readonly"
          v-model="field.value"
          size="mini"
          type="textarea"
          :rows="field.placerows > 0 ? field.placerows : 3"
          :placeholder="'请输入' + field.title"
          @input="$forceUpdate()"
        />
        <TemplateConfig
          v-else-if="field.template"
          :template="field.template"
          :field-model="field"
          :form-data="defaultData"
        />
        <pre v-else>{{ getTextDisplay(field) }}</pre>
      </div>
      <!-- 文件上传 -->
      <div v-else-if="field.comType === 'file'">
        <FileUploader
          v-model="field.value"
          :dragable="!field.placerows || field.placerows > 1"
          :editable="editable && !field.readonly"
          :field-model="field"
          :form-id="formId"
          :form-name="formName"
        />
      </div>
      <!-- 动态下拉多选框场景 -->
      <div v-else-if="field.comType === 'tableView'">
        <DynamicMultipleCreator
          v-if="field.listItemCreationFormClass"
          v-model="field.value"
          :form-id="formId"
          :form-name="formName"
          :editable="editable && !field.readonly"
          :field-model="field"
          :parent-field-models="parentFieldModelsConcat()"
        />
        <DynamicMultipleSelector
          v-else
          v-model="field.value"
          :form-id="formId"
          :form-name="formName"
          :editable="editable && !field.readonly"
          :field-model="field"
          :parent-field-models="parentFieldModelsConcat()"
        />
      </div>
      <!-- 动态下拉单选框场景 -->
      <div v-else-if="field.comType === 'dynamicSelect'">
        <DynamicSingleSelector
          v-if="editable && !field.readonly"
          v-model="field.value"
          :form-id="formId"
          :form-name="formName"
          :field-model="field"
          :parent-field-models="parentFieldModelsConcat()"
        />
        <TemplateConfig
          v-else-if="field.template"
          :template="field.template"
          :field-model="field"
          :form-data="defaultData"
        />
        <div v-else>
          {{ getTextDisplay(field) }}
        </div>
      </div>
      <!-- 操作按钮 -->
      <div v-else-if="field.comType === 'button'">
        <el-button :size="field.styleSize || 'mini'" :type="field.styleType || 'text'" @click="onFieldButtonClick(field)">
          {{ field.title }}
        </el-button>
      </div>
      <!-- 常规短文本字段 -->
      <div v-else>
        <TemplateConfig
          v-if="(!editable || field.readonly) && field.template"
          :template="field.template"
          :field-model="field"
          :form-data="defaultData"
        />
        <el-tooltip
          v-else-if="(!editable || field.readonly)"
          effect="dark"
          :content="getTextDisplay(field)"
          placement="left-start"
        >
          <span>{{ getTextDisplay(field) }}</span>
        </el-tooltip>
        <!-- 密码框 -->
        <el-input
          v-else-if="field.comType === 'password'"
          v-model="field.value"
          size="mini"
          type="password"
          :placeholder="'请输入' + field.title"
          @input="$forceUpdate()"
        />
        <!-- 静态单选 -->
        <el-select
          v-else-if="field.comType === 'select'"
          v-model="field.value"
          size="mini"
          :placeholder="'请选择' + field.title"
          :clearable="true"
          @change="$forceUpdate()"
        >
          <slot v-for="(opt,optidx) in field.staticOptions">
            <div v-if="opt.group && (optidx >= 1 ? field.staticOptions[optidx - 1].group != opt.group : true)" :key="optidx + 1000" class="common-option-group">
              {{ opt.optionGroup || opt.group }}
            </div>
            <el-option :key="optidx" :label="opt.display" :value="opt.value" />
          </slot>
        </el-select>
        <!-- 静态多选 -->
        <el-checkbox-group
          v-else-if="field.comType === 'checkbox'"
          v-model="field.value"
          size="mini"
          @change="$forceUpdate()"
        >
          <el-checkbox v-for="(opt, optidx) in field.staticOptions" :key="optidx" :label="opt.optionValue" :value="opt.optionValue">
            {{ opt.optionDisplay }}
          </el-checkbox>
        </el-checkbox-group>
        <!-- 开关选择 -->
        <el-switch
          v-else-if="field.comType === 'switch'"
          v-model="field.value"
          size="mini"
          @change="$forceUpdate()"
        />
        <!-- 日期选择 -->
        <el-date-picker
          v-else-if="field.comType === 'DateOnly'"
          v-model="field.value"
          size="mini"
          placeholder="请选择日期"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          type="date"
          @input="$forceUpdate()"
        />
        <!-- 日期和时间选择 -->
        <el-date-picker
          v-else-if="field.comType === 'DateTime'"
          v-model="field.value"
          size="mini"
          placeholder="请选择日期"
          format="yyyy-MM-dd HH:mm:ss"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetime"
          @input="$forceUpdate()"
        />
        <!-- 时间选择 -->
        <el-time-picker
          v-else-if="field.comType === 'TimeOnly'"
          v-model="field.value"
          size="mini"
          placeholder="请选择时间"
          format="HH:mm:ss"
          value-format="HH:mm:ss"
          @input="$forceUpdate()"
        />
        <!-- 分隔线: 分割线无需绘制，在 label 中体现 -->
        <div v-else-if="field.comType === 'separator'" />
        <!-- 简单文本框 -->
        <el-input
          v-else
          v-model="field.value"
          size="mini"
          :placeholder="'请输入' + (field.title || '')"
          :type="field.type === 'integer' ? 'number' : 'text'"
          @input="$forceUpdate()"
        />
      </div>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-if="field.contentip === 'bottom' && field.description" v-html="field.description" />
    </template>
    <template v-slot:after>
      <div v-if="actions && actions.length > 0" class="form-content-buttons">
        <el-button v-for="(item, index) in actions" :key="`form-action-${index}`" :type="item.type || 'primary'" :size="item.size || 'mini'" @click="$emit('actions', item)">
          {{ item.name || item.title || item.dispaly }}
        </el-button>
      </div>
    </template>
  </BaseFormContentBase>
</template>
<script>
import tool from '@/utils/tools'
import FileUploader from '@/components/BaseFormItem/FileUploader'
import TemplateConfig from '@/components/BaseFormItem/TemplateConfig'
import DynamicSingleSelector from '@/components/BaseFormItem/DynamicSingleSelector'
import DynamicMultipleCreator from '@/components/BaseFormItem/DynamicMultipleCreator'
import DynamicMultipleSelector from '@/components/BaseFormItem/DynamicMultipleSelector'
import { getFieldValueDisplay, getVisibleFieldModels, FORM_FIELD_OPTIONS } from '@/utils/formUtils'
export default {
  name: 'BaseFormContent',
  components: {
    FileUploader,
    TemplateConfig,
    DynamicSingleSelector,
    DynamicMultipleCreator,
    DynamicMultipleSelector,
    BaseFormContentBase: () => import('./base')
  },
  props: {
    /**
     * 是否只读
     */
    editable: {
      type: Boolean,
      default: false
    },
    /**
     * 当前的表单名称
     */
    formName: {
      type: String,
      default: null
    },
    /**
     * 当前的表单编号
     */
    formId: {
      type: [String, Number],
      default: null
    },
    /**
     * 表单数据模型
     */
    formModel: {
      type: [Object, String],
      required: true
    },
    /**
     * 表单填充数据
     */
    defaultData: {
      type: Object,
      default: function() {
        return {}
      }
    },
    /**
     * 嵌入式表单的父字段
     */
    parentField: {
      type: Object,
      default: null
    },
    /**
     * 父组件的字段模型列表
     */
    parentFieldModels: {
      type: Array,
      default: null
    },
    /**
     * 是否可折叠
     */
    collapsible: {
      type: Boolean,
      default: false
    },
    /**
     * 内嵌表单是否可编辑
     */
    innerEditable: {
      type: Boolean,
      default: false
    },
    /**
     * 是否可折叠内嵌表单
     */
    innerCollapsible: {
      type: Boolean,
      default: false
    },
    /**
     * 自定义的操作按钮
     */
    actions: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      fieldModels: []
    }
  },
  computed: {
    fieldModelsEx() {
      return this.getVisibleFieldModels(this.formModel, this.defaultData)
    }
  },
  methods: {
    /**
     * 解析可显示的字段模型清单
     *
     * 通过 computed 计算的数据在使用时会出现 input 控件
     * 无法输入的情况，因此这里将计算结果保存在 data 的
     * fieldModels 属性中。
     *
     * 至于导致 input 控件无法输入的原因暂不明确，通过
     * 这种方式从结果看可以规避该问题的出现
     */
    getVisibleFieldModels(formModel, formData) {
      var options = FORM_FIELD_OPTIONS.SeparatorIncluded |
                     FORM_FIELD_OPTIONS.HiddenIfAllEmpty |
                     FORM_FIELD_OPTIONS.OrderUndefinedExcluded
      this.fieldModels = []
      if (tool.isPlainObject(formModel)) {
        this.fieldModels = getVisibleFieldModels(formModel, formData, options)
      }
      return this.fieldModels
    },
    /*
     * 获取字段的只读文本显示
     * @param {Object} fieldModel
     */
    getTextDisplay(fieldModel) {
      if (!fieldModel) {
        return ''
      }
      return '' + getFieldValueDisplay(fieldModel, fieldModel.value)
    },

    /**
     * 获取表单的验证内容
     */
    getFormValidData() {
      var validation = function(field) {
        if (field.required) {
          if (tool.isUndefOrNull(field.value) ||
            (field.type === 'array' && field.value.length <= 0) ||
            (tool.isString(field.value) && tool.isBlank(field.value))) {
            this.$notify.error(`字段(${field.title})要求必须填写`)
            return false
          }
        }
        if (field.pattern && (tool.isNumber(field.value) || tool.isString(field.value))) {
          var regexp
          try {
            regexp = new RegExp(field.pattern)
          } catch (e) {
            this.$notify.error(`字段(${field.title})格式验证失败：非法的正则模式 - ${field.pattern}`)
            return false
          }
          if (!regexp.test(field.value.toString())) {
            this.$notify.error(`字段(${field.title})格式验证失败：要求的正则模式 - ${field.pattern}`)
            return false
          }
        }
        return true
      }
      var data = {}
      var validPassed = true
      for (const field of this.fieldModels) {
        if (field.comType === 'innerForm' && !field.readonly && this.innerEditable) {
          var fieldValues = []
          if (this.$refs[`InnerForm:${field.key}`]) {
            for (var innerForm of this.$refs[`InnerForm:${field.key}`]) {
              var innerData = innerForm.getFormValidData()
              if (!innerData) {
                return null
              }
              fieldValues.push(innerData)
            }
          }
          field.value = fieldValues
        }
        if (!validation.call(this, field)) {
          validPassed = false
          break
        }
        data[field.key] = field.value
      }
      return validPassed ? data : null
    },
    /**
     * 整合级联产生的父表单模型
     */
    parentFieldModelsConcat() {
      var concated = []
      if (tool.isArray(this.parentFieldModels)) {
        concated = concated.concat(this.parentFieldModels)
      }
      if (tool.isArray(this.fieldModels)) {
        concated = concated.concat(this.fieldModels)
      }
      return concated
    },
    /**
     * 自定义按钮点击回调
     */
    onFieldButtonClick(field) {
      // console.log('表单按钮点击事件：', field)
      this.$emit('button', field, this)
      var fields = [{
        field: field,
        form: this
      }]
      var $this = this
      while ($this.parentField && $this.parentField.comType === 'innerForm') {
        fields.push({ field: $this.parentField, form: $this.$parent })
        // console.log('表单按钮点击事件：', fields, $this.$parent)
        $this.$parent.$emit('button', fields, $this.$parent)
        $this = $this.$parent
      }
    }
  }
}
</script>
<style lang="scss">
.form-content-wrapper {
  .form-content-buttons {
    padding: 5px 50px;
    text-align: center;
  }
}
</style>
