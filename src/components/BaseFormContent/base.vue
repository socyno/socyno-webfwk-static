<template>
  <div class="form-content-wrapper">
    <el-button v-if="collapsible" type="text" size="mini" class="form-content-expander" @click="onFormFieldsExpanded">
      {{ collapsibleExpand ? '收起' : '展开' }}
    </el-button>
    <slot name="before" />
    <div
      v-for="(field, index) in fieldModels"
      v-show="checkFieldVisible(field)"
      :key="`form-field-idex${index}`"
      :class="genFieldContainerStyle(field)"
      :draggable="draggable && !field.draggableDisabled"
      :data-field="field.key"
      @click="$emit('fieldWrapperClick', field, index)"
    >
      <el-divider
        v-if="field.comType === 'separator'"
        content-position="center"
      >
        {{ getSeparatorTitle(field) }}
      </el-divider>
      <div v-if="field.comType !== 'separator'" :class="genFieldLabelSytle(field)">
        <slot name="label" :field="field" :index="index" :editable="editable && !field.readonly">
          <BaseFormLabel
            v-if="field.comType !== 'button'"
            :tooltip="true"
            :field-model="field"
          />
        </slot>
      </div>
      <div v-if="field.comType !== 'separator'" :class="genFieldContentSytle(field)">
        <slot name="content" :field="field" :index="index" :editable="editable && !field.readonly" />
      </div>
    </div>
    <slot name="after" />
  </div>
</template>
<script>
import tool from '@/utils/tools'
import { getFieldPlacement } from '@/utils/formUtils'
import BaseFormLabel from '../BaseFormItem/BaseFormLabel'
export default {
  name: 'BaseFormContentBase',
  components: {
    BaseFormLabel
  },
  props: {
    /**
     * 表单数据模型
     */
    fieldModels: {
      type: Array,
      required: true
    },
    /**
     * 是否可编辑
     */
    editable: {
      type: Boolean,
      default: false
    },
    /**
     * 是否可折叠
     */
    collapsible: {
      type: Boolean,
      default: false
    },
    /**
     * 是否允许字段拖拽
     */
    draggable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      fieldDraggedStore: {},
      collapsibleExpand: !this.collapsible
    }
  },
  watch: {
    fieldModels: {
      handler() {
        this.registerDragEventListener()
      }
    }
  },
  mounted() {
    if (this.draggable) {
      this.$el.addEventListener('dragenter', (e) => {
        var sourceField
        var targetField
        if (!(targetField = this.getCurrentFieldElement(e.target)) ||
                !(sourceField = this.fieldDraggedStore.sourceField) ||
                targetField === sourceField ||
                !targetField.draggable ||
                targetField === this.fieldDraggedStore.targetFeild) {
          return
        }
        this.resetPrevDropTargetStyle(targetField)
      })
      this.$el.addEventListener('dragover', (e) => {
        e.preventDefault()
        var sourceField
        var targetField
        if (!(targetField = this.getCurrentFieldElement(e.target)) ||
                !(sourceField = this.fieldDraggedStore.sourceField) ||
                !targetField.draggable ||
                targetField === sourceField) {
          return
        }
        this.resetPrevDropTargetStyle()
        var targetRect = this.getFieldElementRectInfo(targetField)
        var vClientCenter = (targetRect.bottom - targetRect.top) / 2 + targetRect.top
        var hClientCenter = (targetRect.right - targetRect.left) / 2 + targetRect.left
        if (e.clientX > hClientCenter || e.clientY > vClientCenter) {
          targetField.style.borderRight = '3px dotted green'
          targetField.style.borderBottom = '3px dotted green'
          this.fieldDraggedStore['targetDirection'] = 'after'
        } else {
          targetField.style.borderTop = '3px dotted green'
          targetField.style.borderLeft = '3px dotted green'
          this.fieldDraggedStore['targetDirection'] = 'before'
        }
      })
      this.$el.addEventListener('drop', (e) => {
        e.preventDefault()
        var targetField
        var sourceField
        this.resetPrevDropTargetStyle()
        if (!(targetField = this.fieldDraggedStore.targetFeild) ||
            !(sourceField = this.fieldDraggedStore.sourceField) ||
            targetField === sourceField) {
          return
        }
        if (this.fieldDraggedStore.targetDirection === 'after') {
          targetField.after(sourceField)
        } else {
          targetField.before(sourceField)
        }
        var domData
        var fieldName
        var resortedFields = []
        for (var fieldElement of this.$el.children) {
          if (tool.toLower(fieldElement.tagName) === 'div' &&
              tool.toLower(fieldElement.className).indexOf('form-field-wrapper') >= 0 &&
              (domData = fieldElement.dataset) &&
              (fieldName = tool.stringify(domData.field)).length > 0) {
            resortedFields.push(fieldName)
          }
        }
        this.$emit('fieldOrderChange', resortedFields)
      })
      this.registerDragEventListener()
    }
  },
  methods: {
    /**
     *  获取当前 DOM 对象所在字段的 DOM 对象
     */
    getCurrentFieldElement(elm) {
      while (elm && this.$el.contains(elm)) {
        if (elm.parentNode === this.$el) {
          return elm
        }
        elm = elm.parentNode
      }
      return null
    },

    /**
     * 获取 DOM 对象的坐标信息
     */
    getFieldElementRectInfo(elm) {
      var clientRect = elm.getBoundingClientRect()
      var clientTop = document.documentElement.clientTop
      var clientLeft = document.documentElement.clientLeft
      return {
        top: clientRect.top - clientTop,
        bottom: clientRect.bottom - clientTop,
        left: clientRect.left - clientLeft,
        right: clientRect.right - clientLeft,
        width: clientRect.width,
        height: clientRect.height
      }
    },

    /**
     * 注册字段拖拽事件
     */
    registerDragEventListener() {
      for (var fieldElement of this.$el.children) {
        if (!fieldElement.dataset['field']) {
          continue
        }
        if (fieldElement.dataset['draggableAdded']) {
          continue
        }
        fieldElement.addEventListener('dragstart', (e) => {
          var sourceField
          if (!(sourceField = this.getCurrentFieldElement(e.target))) {
            return
          }
          this.fieldDraggedStore = {
            sourceField: sourceField,
            sourceBorder: sourceField.style.border
          }
          sourceField.style.border = '1px dotted red'
        })
        fieldElement.addEventListener('dragend', (e) => {
          this.fieldDraggedStore.sourceField.style.border =
                this.fieldDraggedStore.sourceBorder
          this.resetPrevDropTargetStyle()
          this.fieldDraggedStore = {}
        })
        fieldElement.dataset['draggableAdded'] = true
      }
    },

    /**
     * 重置当前移动标的字段的样式
     */
    resetPrevDropTargetStyle(nextFieldElement) {
      var prevTarget
      if ((prevTarget = this.fieldDraggedStore.targetFeild)) {
        prevTarget.style.borderLeft = this.fieldDraggedStore.targetBorderLeft
        prevTarget.style.borderRight = this.fieldDraggedStore.targetBorderRight
        prevTarget.style.borderTop = this.fieldDraggedStore.targetBorderTop
        prevTarget.style.borderBottom = this.fieldDraggedStore.targetBorderBottom
      }
      if (nextFieldElement) {
        this.fieldDraggedStore['targetFeild'] = nextFieldElement
        this.fieldDraggedStore['targetBorderLeft'] = nextFieldElement.style.borderLeft
        this.fieldDraggedStore['targetBorderRight'] = nextFieldElement.style.borderRight
        this.fieldDraggedStore['targetBorderTop'] = nextFieldElement.style.borderTop
        this.fieldDraggedStore['targetBorderBottom'] = nextFieldElement.style.borderBottom
      }
    },

    /**
     * 表单的折叠状态
     */
    onFormFieldsExpanded() {
      this.collapsibleExpand = !this.collapsibleExpand
      this.$emit('expand', this.collapsibleExpand)
    },

    /**
     * 计算当前字段是否超过一行
     */
    checkFieldVisible(field) {
      if (this.collapsibleExpand) {
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
     * 计算字段容器的样式
     * @param {Object} field
     */
    genFieldContainerStyle(field) {
      var clazz = 'form-field-wrapper'
      if (field.comType === 'separator') {
        clazz += ' form-field-wrapper-separator'
        return clazz
      }
      clazz += ' form-field-wrapper' + getFieldPlacement(field)
      if (!this.editable || field.readonly) {
        clazz += ' form-field-readonly'
      }
      return clazz
    },

    /**
     * 计算字段标题的样式
     */
    genFieldLabelSytle(field) {
      var clazz = 'form-field-title'
      if (field.required) {
        clazz += ' form-field-required'
      }
      var titleWidth = tool.trim(field.titleWidth)
      if (tool.inArray(titleWidth, ['20', '40', '60', '80', '120', '160', '200', '0']) >= 0) {
        clazz += ' form-field-title-' + titleWidth
      }
      return clazz
    },

    /**
     * 计算字段内容的样式
     */
    genFieldContentSytle(field) {
      var clazz = 'form-field-content'
      var titleWidth = tool.trim(field.titleWidth)
      if (tool.inArray(titleWidth, ['20', '40', '60', '80', '120', '160', '200', '0']) >= 0) {
        clazz += ' form-field-withtitle-' + titleWidth
      }
      if (field.comType === 'areaText') {
        clazz += ' column-longtext-content'
      }
      return clazz
    },

    /**
     * 分割线的文本显示
     * @param {Object} field
     */
    getSeparatorTitle(field) {
      // console.log('分隔线：', field)
      if (!field.hiddenCtl) {
        return tool.trim(field.title)
      }
      var fieldType = tool.toLower(field.fieldType)
      if (fieldType === 'hiddenifallempty') {
        return '以下字段值全为空时被隐藏'
      }
      if (fieldType === 'hidden') {
        return '以下所有字段将被隐藏'
      }
      if (fieldType === 'hiddenend') {
        return '上方字段隐藏的结束符'
      }
      return '未知字段隐藏控制符：' + fieldType
    }
  }
}
</script>
<style lang="scss">
.form-content-wrapper {
  background-color: #fff;
  color: #222;
  font-size: 12px;
  padding: 0px;
  position: relative;
  .form-field-wrapper {
    display: inline-block;
    vertical-align: top;
    margin-top: 15px;
  }
  .form-field-readonly {
    margin-top: 25px;
  }
  .form-field-wrapper1 {
    width: calc(8.25% - 0px);
  }
  .form-field-wrapper2 {
    width: calc(16.5% - 0px);
  }
  .form-field-wrapper3 {
    width: calc(24.75% - 0px);
  }
  .form-field-wrapper4 {
    width: calc(33% - 0px);
  }
  .form-field-wrapper5 {
    width: calc(41.25% - 0px);
  }
  .form-field-wrapper6 {
    width: calc(49.5% - 0px);
  }
  .form-field-wrapper7 {
    width: calc(57.75% - 0px);
  }
  .form-field-wrapper8 {
    width: calc(66% - 0px);
  }
  .form-field-wrapper9 {
    width: calc(74.25% - 0px);
  }
  .form-field-wrapper10 {
    width: calc(82.5% - 0px);
  }
  .form-field-wrapper11 {
    width: calc(90.75% - 0px);
  }
  .form-field-wrapper12 {
    width: calc(99% - 0px);
  }
  .form-field-wrapper-separator {
    width: calc(99% - 0px);
  }
  .form-field-title {
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
  .form-field-title-0 {
    width: 0px !important;
  }
  .form-field-title-20 {
    width: 20px !important;
  }
  .form-field-title-40 {
    width: 40px !important;
  }
  .form-field-title-60 {
    width: 60px !important;
  }
  .form-field-title-80 {
    width: 80px !important;
  }
  .form-field-title-120 {
    width: 120px !important;
  }
  .form-field-title-160 {
    width: 160px !important;
  }
  .form-field-title-200 {
    width: 200px !important;
  }
  .form-field-content {
    overflow: hidden;
    display: inline-block;
    width: calc(100% - 125px);
    vertical-align: top;
    .form-field-configger {
      display: inline-block !important;
    }
    .el-input,
    .el-select,
    .el-range-editor--mini.el-input__inner {
      width: 100% !important;
    }
    .el-button {
      margin: 0 !important;
      padding: 5px !important;
    }
    .el-tooltip {
      white-space: nowrap;
      text-overflow: ellipsis !important;
    }
  }
  .form-field-content.form-field-withtitle-0 {
    width: calc(100% - 5px) !important;
  }
  .form-field-content.form-field-withtitle-20 {
    width: calc(100% - 25px) !important;
  }
  .form-field-content.form-field-withtitle-40 {
    width: calc(100% - 45px) !important;
  }
  .form-field-content.form-field-withtitle-60 {
    width: calc(100% - 65px) !important;
  }
  .form-field-content.form-field-withtitle-80 {
    width: calc(100% - 85px) !important;
  }
  .form-field-content.form-field-withtitle-120 {
    width: calc(100% - 125px) !important;
  }
  .form-field-content.form-field-withtitle-160 {
    width: calc(100% - 165px) !important;
  }
  .form-field-content.form-field-withtitle-200 {
    width: calc(100% - 205px) !important;
  }
  .column-longtext-content {
    overflow: auto;
    pre {
      margin:0px;
      padding:0px;
    }
  }
  .form-field-required {
    color: orangered;
  }
  .form-content-expander {
    position: absolute;
    top: 2px;
    left: 2px;
  }
  .el-divider {
    margin: 10px 0 25px 0 !important;
  }
}
</style>
