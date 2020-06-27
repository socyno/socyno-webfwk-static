<template>
  <div class="form-content-block">
    <slot v-for="(field, k) in fieldModels">
      <!-- 内嵌的表单 -->
      <div v-if="field.comType === 'innerForm'" v-show="checkFieldVisible(field)" :key="k" :class="genFieldContainerStyle(field)">
        <BaseFormLabel :tooltip="editable" :class="genFieldLabelSytle(field)" :field-model="field" />
        <div :class="genFieldContentSytle(field)">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-if="field.contentip === 'top' && field.description" v-html="field.description" />
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
          />
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-if="field.contentip === 'bottom' && field.description" v-html="field.description" />
        </div>
      </div>
      <!-- 分隔线 -->
      <el-divider v-else-if="field.comType === 'separator'" content-position="center">
        <BaseFormLabel :tooltip="true" without-colon :field-model="field" />
      </el-divider>
      <!-- 长文本本显示 -->
      <div v-else-if="field.comType === 'areaText'" v-show="checkFieldVisible(field)" :key="k" :class="genFieldContainerStyle(field)">
        <BaseFormLabel :tooltip="editable" :class="genFieldLabelSytle(field)" :field-model="field" />
        <div v-if="!editable || field.readonly" :class="genFieldContentSytle(field)">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-if="field.contentip === 'top' && field.description" v-html="field.description" />
          <TemplateConfig v-if="field.template" :template="field.template" :field-model="field" :form-data="defaultData" />
          <pre v-else>{{ getTextDisplay(field) }}</pre>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-if="field.contentip === 'bottom' && field.description" v-html="field.description" />
        </div>
        <div v-else :class="genFieldContentSytle(field)">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-if="field.contentip === 'top' && field.description" v-html="field.description" />
          <el-input
            v-model="field.value"
            size="mini"
            type="textarea"
            :rows="field.placerows > 0 ? field.placerows : 3"
            :placeholder="'请输入' + field.title"
            @input="$forceUpdate()"
          />
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-if="field.contentip === 'bottom' && field.description" v-html="field.description" />
        </div>
      </div>
      <!-- 文件上传 -->
      <div v-else-if="field.comType === 'file'" v-show="checkFieldVisible(field)" :key="k" :class="genFieldContainerStyle(field)">
        <BaseFormLabel
          :tooltip="editable"
          :class="genFieldLabelSytle(field)"
          :field-model="field"
        />
        <div :class="genFieldContentSytle(field)">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-if="field.contentip === 'top' && field.description" v-html="field.description" />
          <FileUploader v-model="field.value" :dragable="!field.placerows || field.placerows > 1" :editable="editable && !field.readonly" :field-model="field" :form-id="formId" :form-name="formName" />
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-if="field.contentip === 'bottom' && field.description" v-html="field.description" />
        </div>
      </div>
      <!-- 动态下拉多选框场景 -->
      <div v-else-if="field.comType === 'tableView'" v-show="checkFieldVisible(field)" :key="k" :class="genFieldContainerStyle(field)">
        <BaseFormLabel
          :tooltip="editable"
          :class="genFieldLabelSytle(field)"
          :field-model="field"
        />
        <div :class="genFieldContentSytle(field)">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-if="field.contentip === 'top' && field.description" v-html="field.description" />
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
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-if="field.contentip === 'bottom' && field.description" v-html="field.description" />
        </div>
      </div>
      <!-- 动态下拉单选框场景 -->
      <div v-else-if="field.comType === 'dynamicSelect'" v-show="checkFieldVisible(field)" :key="k" :class="genFieldContainerStyle(field)">
        <BaseFormLabel :tooltip="editable" :class="genFieldLabelSytle(field)" :field-model="field" />
        <div v-if="!editable || field.readonly" :class="genFieldContentSytle(field)">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-if="field.contentip === 'top' && field.description" v-html="field.description" />
          <TemplateConfig v-if="field.template" :template="field.template" :field-model="field" :form-data="defaultData" />
          {{ getTextDisplay(field) }}
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-if="field.contentip === 'bottom' && field.description" v-html="field.description" />
        </div>
        <div v-else :class="genFieldContentSytle(field)">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-if="field.contentip === 'top' && field.description" v-html="field.description" />
          <DynamicSingleSelector
            v-model="field.value"
            :form-id="formId"
            :form-name="formName"
            :field-model="field"
            :parent-field-models="parentFieldModelsConcat()"
          />
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-if="field.contentip === 'bottom' && field.description" v-html="field.description" />
        </div>
      </div>
      <!-- 操作按钮 -->
      <div v-else-if="field.comType === 'button'" v-show="checkFieldVisible(field)" :key="k" :class="genFieldContainerStyle(field)">
        <div v-if="editable && !field.readonly && field.title" :class="genFieldContentSytle(field)">
          <el-button :size="field.styleSize || 'mini'" :type="field.styleType || 'text'" @click="onFieldButtonClick(field)">
            {{ field.title }}
          </el-button>
        </div>
      </div>
      <!-- 常规短文本字段 -->
      <div v-else v-show="checkFieldVisible(field)" :key="k" :class="genFieldContainerStyle(field)">
        <BaseFormLabel :tooltip="editable" :class="genFieldLabelSytle(field)" :field-model="field" />
        <TemplateConfig
          v-if="(!editable || field.readonly) && field.template"
          :class="genFieldContentSytle(field)"
          :template="field.template"
          :field-model="field"
          :form-data="defaultData"
        />
        <el-tooltip v-if="(!editable || field.readonly) && !field.template" effect="dark" :content="getTextDisplay(field)" placement="left-start">
          <div :class="genFieldContentSytle(field)">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-if="field.contentip === 'top' && field.description" v-html="field.description" />
            {{ getTextDisplay(field) }}
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-if="field.contentip === 'bottom' && field.description" v-html="field.description" />
          </div>
        </el-tooltip>
        <div v-if="editable && !field.readonly" :class="genFieldContentSytle(field)">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-if="field.contentip === 'top' && field.description" v-html="field.description" />
          <!-- 密码框 -->
          <el-input
            v-if="field.comType === 'password'"
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
          <!-- 简单文本框 -->
          <el-input
            v-else
            v-model="field.value"
            size="mini"
            :placeholder="'请输入' + field.title"
            :type="field.type === 'integer' ? 'number' : 'text'"
            @input="$forceUpdate()"
          />
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-if="field.contentip === 'bottom' && field.description" v-html="field.description" />
        </div>
      </div>
    </slot>
  </div>
</template>
<script>
import tool from '@/utils/tools'
import FileUploader from '@/components/BaseFormItem/FileUploader'
import BaseFormLabel from '@/components/BaseFormItem/BaseFormLabel'
import TemplateConfig from '@/components/BaseFormItem/TemplateConfig'
import DynamicSingleSelector from '@/components/BaseFormItem/DynamicSingleSelector'
import DynamicMultipleCreator from '@/components/BaseFormItem/DynamicMultipleCreator'
import DynamicMultipleSelector from '@/components/BaseFormItem/DynamicMultipleSelector'
import { getFieldValueDisplay, getVisibleFieldModels, getFieldPlacement, FORM_FIELD_OPTIONS } from '@/utils/formUtils'
export default {
  name: 'BaseFormContent',
  components: {
    FileUploader,
    BaseFormLabel,
    TemplateConfig,
    DynamicSingleSelector,
    DynamicMultipleCreator,
    DynamicMultipleSelector
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
     * 是否只展示第一行
     */
    showOnlyFirstLine: {
      type: Boolean,
      default: false
    },
    /**
     * 内嵌表单是否可编辑
     */
    innerEditable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      fieldModels: [],
      fieldBeforeCells: 0
    }
  },
  watch: {
    formModel: {
      immediate: true,
      handler(formModel) {
        if (!formModel) {
          return
        }
        // console.log('基础编辑表单模型更新，模型和数据如下:', formModel, this.defaultData)
        this.fieldModels = getVisibleFieldModels(formModel, this.defaultData, FORM_FIELD_OPTIONS.HiddenIfAllEmpty | FORM_FIELD_OPTIONS.SeparatorIncluded)
      }
    },
    defaultData: {
      immediate: true,
      handler(defaultData) {
        // console.log('基础编辑表单数据更新，模型和数据如下:', this.formModel, defaultData)
        this.fieldModels = getVisibleFieldModels(this.formModel, defaultData, FORM_FIELD_OPTIONS.HiddenIfAllEmpty | FORM_FIELD_OPTIONS.SeparatorIncluded)
      }
    }
  },
  methods: {
    /**
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
     * 计算当前字段是否超过一行
     */
    checkFieldVisible(field) {
      if (!this.showOnlyFirstLine) {
        return true
      }
      var beforeCells = 0
      for (const before of this.fieldModels) {
        beforeCells += getFieldPlacement(before)
        if (field.key === before.key) {
          break
        }
      }
      return beforeCells <= 12
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
     * 计算字段容器的样式
     * @param {Object} field
     */
    genFieldContainerStyle(field) {
      var clazz = 'column-style-span column-style-span' +
        getFieldPlacement(field)
      if (!this.editable || field.readonly) {
        clazz += ' column-style-readonly'
      }
      return clazz
    },
    /**
     * 计算字段标题的样式
     */
    genFieldLabelSytle(field) {
      var clazz = 'column-style-title'
      if (field.required) {
        clazz += ' column-style-required'
      }
      if (field.smallTitle) {
        clazz += ' column-small-title'
      }
      return clazz
    },
    /**
     * 计算字段内容的样式
     */
    genFieldContentSytle(field) {
      var clazz = 'column-style-content'
      if (field.smallTitle || field.comType === 'button') {
        clazz += ' column-small-title'
      }
      if (field.comType === 'areaText') {
        clazz += ' column-longtext-content'
      }
      return clazz
    },

    /**
     * 自定义按钮点击回调
     */
    onFieldButtonClick(field) {
      this.$emit('button', field, this)
      var parent = this
      var fields = [{
        field: field,
        form: this
      }]
      while (parent && parent.parentField && parent.parentField.comType === 'innerForm') {
        fields.push({ field: parent.parentField, form: parent.$parent })
        parent.$parent.$emit('button', fields, parent.$parent)
        parent = parent.$parent
      }
    }
  }
}
</script>
<style lang="scss">
.form-content-block {
  background-color: #fff;
  color: #222;
  font-size: 12px;
  padding: 0px;
  .column-style-span {
    display: inline-block;
    vertical-align: top;
    margin-bottom: 15px;
  }
  .column-style-readonly {
    margin-bottom: 25px;
    .el-tooltip.column-style-content {
      white-space: nowrap;
      text-overflow: ellipsis !important;
    }
  }
  .column-style-span1 {
    width: calc(8.25% - 0px);
  }
  .column-style-span2 {
    width: calc(16.5% - 0px);
  }
  .column-style-span3 {
    width: calc(24.75% - 0px);
  }
  .column-style-span4 {
    width: calc(33% - 0px);
  }
  .column-style-span5 {
    width: calc(41.25% - 0px);
  }
  .column-style-span6 {
    width: calc(49.5% - 0px);
  }
  .column-style-span7 {
    width: calc(57.75% - 0px);
  }
  .column-style-span8 {
    width: calc(66% - 0px);
  }
  .column-style-span9 {
    width: calc(74.25% - 0px);
  }
  .column-style-span10 {
    width: calc(82.5% - 0px);
  }
  .column-style-span11 {
    width: calc(90.75% - 0px);
  }
  .column-style-span12 {
    width: calc(99% - 0px);
  }
  .column-style-title {
    color: #606266;
    width: 120px;
    display: inline-block;
    white-space: nowrap;
    // font-weight: bold;
    text-align: right;
    padding-right: 5px;
    overflow: hidden;
    text-overflow: ellipsis !important;
  }
  .column-style-title.column-small-title {
    text-align: center;
    width: 40px !important;
  }
  .column-style-content {
    overflow: hidden;
    display: inline-block;
    width: calc(100% - 125px);
    vertical-align: top;
    .el-input,
    .el-select,
    .el-range-editor--mini.el-input__inner {
      width: 100% !important;
    }
    .el-button {
      margin: 0 !important;
      padding: 5px !important;
    }
  }
  .column-style-content.column-small-title {
    width: calc(100% - 45px) !important;
  }
  .column-longtext-content {
    overflow: auto;
    pre {
      margin:0px;
      padding:0px;
    }
  }
  .column-style-required {
    color: orangered;
  }
  .el-divider {
    margin: 10px 0 25px 0 !important;
  }
}
</style>
