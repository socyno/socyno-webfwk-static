<template>
  <div>
    <BaseFormContentBase
      ref="parentFormContent"
      :draggable="true"
      :show-all="true"
      :field-models="cachedFieldModels"
      @fieldOrderChange="resetFormFieldsOrder"
      @fieldWrapperClick="showFieldSettings"
    >
      <template v-slot:before>
        <el-table id="form-list-heads" ref="formListHeads" @header-click="showColumnSettings">
          <template v-slot:empty>
            &nbsp;
          </template>
          <el-table-column
            v-for="(field, idx) in cachedFieldColumns"
            :key="idx"
            :label="field.title || field.key"
            :prop="field.key"
            :width="field.listWidth ? field.listWidth : 0"
          >
            <template v-slot:header="{ column, $index }">
              <div class="form-list-head" :form-list-field="column.property">
                {{ column.label }}
              </div>
            </template>
          </el-table-column>
          <el-table-column :width="50">
            <template v-slot:header>
              <i class="el-icon-plus" />
            </template>
          </el-table-column>
        </el-table>

        <el-drawer
          direction="rtl"
          :visible.sync="columnSettingsVisible"
          :size="'40%'"
          :with-header="false"
          :append-to-body="true"
          :modal-append-to-body="true"
          @close="closeColumnSettings"
        >
          <el-form v-if="columnSettingsAddition" label-position="right" label-width="150px" size="mini" style="padding:30px;">
            <el-form-item label="请选择添加的字段">
              <el-select v-model="columnSettingsSelected" value-key="key">
                <el-option
                  v-for="(item, index) in cachedColumnsHidden"
                  :key="`column_for_addition_${index}`"
                  :label="item.title || item.key"
                  :value="item"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="nimi" @click="columnSettingsConfirm">
                确认
              </el-button>
              <el-button type="info" size="nimi" @click="columnSettingsCancel">
                取消
              </el-button>
            </el-form-item>
          </el-form>
          <el-form v-else label-position="right" label-width="150px" size="mini" style="padding:30px;">
            <el-form-item>
              <el-button type="primary" size="mini" @click="deleteColumnSettingsField(columnSettingsField)">
                移除该字段
              </el-button>
            </el-form-item>
            <el-form-item label="列表宽度">
              <el-input
                v-model="columnSettingsField.listWidth"
                type="number"
                size="mini"
              />
            </el-form-item>
          </el-form>
        </el-drawer>
      </template>
      <template v-slot:content="{ field, index }">
        <el-button type="text" size="nimi" @click="showFieldSettings(field)">
          <span :style="`color:${field.custom ? 'red' : 'blue'}`">设置</span>
          <i class="el-icon-arrow-down" />
        </el-button>
      </template>
      <template v-slot:after>
        <div v-if="actions && actions.length > 0" class="form-content-buttons">
          <el-button v-for="(item, index) in actions" :key="`form-action-${index}`" :type="item.type || 'primary'" :size="item.size || 'mini'" @click="$emit('actions', item)">
            {{ item.name || item.title || item.dispaly }}
          </el-button>
        </div>
        <el-drawer
          direction="rtl"
          :visible.sync="settingsVisible"
          :size="'40%'"
          :with-header="false"
          custom-class="form-field-settings"
          :append-to-body="true"
          :modal-append-to-body="true"
          @close="closeFieldSettings"
        >
          <el-form label-position="right" label-width="150px" size="mini" style="padding:20px;">
            <el-form-item v-if="settingsFeild.custom" label="字段操作">
              <el-button v-if="settingsForCreation" type="primary" size="mini" @click="addCustomField(settingsFeild)">
                保存
              </el-button>
              <el-button v-else type="danger" size="mini" @click="deleteCustomField(settingsFeild)">
                删除
              </el-button>
            </el-form-item>
            <el-form-item label="字段名称">
              <el-input
                v-model="settingsFeild.key"
                :disabled="!settingsForCreation"
                size="mini"
              />
            </el-form-item>
            <el-form-item v-if="settingsFeild.custom" label="字段类型">
              <el-select v-model="settingsFeild.fieldType" size="mini" @change="onFieldTypeChange">
                <el-option label="分隔线" value="separator" />
                <el-option label="自定义" value="template" />
                <el-option label="以下所有字段将被隐藏" value="hidden" />
                <el-option label="上方字段隐藏的结束符" value="hiddenEnd" />
                <el-option label="以下字段值全为空时被隐藏" value="hiddenIfAllEmpty" />
              </el-select>
            </el-form-item>
            <el-form-item label="显示控件">
              {{ settingsFeild.comType }}
            </el-form-item>
            <el-form-item v-if="!settingsFeild.hiddenCtl" label="标题显示">
              <el-input
                v-model="settingsFeild.title"
                size="mini"
              />
            </el-form-item>
            <el-form-item v-if="!settingsFeild.separator" label="标题宽度">
              <el-select v-model="settingsFeild.titleWidth" size="mini">
                <el-option label="默认" :value="''" />
                <el-option label="20px" :value="20" />
                <el-option label="40px" :value="40" />
                <el-option label="60px" :value="60" />
                <el-option label="80px" :value="80" />
                <el-option label="120px" :value="120" />
                <el-option label="160px" :value="160" />
                <el-option label="200px" :value="200" />
                <el-option label="不显示(0px)" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="!settingsFeild.separator" label="标题冒号">
              <el-select v-model="settingsFeild.titleWithoutColon" size="mini">
                <el-option label="不显示" :value="true" />
                <el-option label="显示" :value="false" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="!settingsFeild.separator" label="表单宽度">
              <el-select v-model="settingsFeild.placement" size="mini">
                <el-option label="默认" :value="''" />
                <el-option label="1/12" :value="1" />
                <el-option label="2/12" :value="2" />
                <el-option label="3/12" :value="3" />
                <el-option label="4/12" :value="4" />
                <el-option label="5/12" :value="5" />
                <el-option label="6/12" :value="6" />
                <el-option label="7/12" :value="7" />
                <el-option label="8/12" :value="8" />
                <el-option label="9/12" :value="9" />
                <el-option label="10/12" :value="10" />
                <el-option label="11/12" :value="11" />
                <el-option label="12/12" :value="12" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="!settingsFeild.separator">
              <template slot="label">
                <el-tooltip placement="left" effect="light">
                  <span>
                    内容高度
                    <i class="el-icon-question" />
                  </span>
                  <template slot="content">
                    <pre>
设置内容区的高度，目前只支持设置文本编辑框的默认显示行数
                    </pre>
                  </template>
                </el-tooltip>
              </template>
              <el-input
                v-model="settingsFeild.placerows"
                type="number"
                size="mini"
              />
            </el-form-item>
            <el-form-item v-if="!settingsFeild.separator">
              <template slot="label">
                <el-tooltip placement="left" effect="light">
                  <span>
                    只读控件模式
                    <i class="el-icon-question" />
                  </span>
                  <template slot="content">
                    <pre>
选择是，则表示在只读场景下，以只读的编辑控件的方式展示
                    </pre>
                  </template>
                </el-tooltip>
              </template>
              <el-select v-model="settingsFeild.readonlyAsEditor" size="mini">
                <el-option label="否" value="no" />
                <el-option label="是" value="yes" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="!settingsFeild.separator && checkVisibleComType(settingsFeild)">
              <template slot="label">
                <el-tooltip placement="left" effect="light">
                  <span>
                    输入框提示语
                    <i class="el-icon-question" />
                  </span>
                  <template slot="content">
                    <pre>
设置输入框内的提示语，动态设置placeholder的值
                    </pre>
                  </template>
                </el-tooltip>
              </template>
              <el-input
                v-model="settingsFeild.placeholder"
                type="text"
                size="mini"
              />
            </el-form-item>
            <el-form-item v-if="!settingsFeild.separator && (settingsFeild.custom || settingsFeild.modifiable)" label="可否只读">
              <el-switch
                v-model="settingsFeild.readonly"
                size="mini"
              />
            </el-form-item>
            <el-form-item v-if="!settingsFeild.separator && (settingsFeild.custom || settingsFeild.modifiable)" label="是否必填">
              <el-switch
                v-model="settingsFeild.required"
                size="mini"
              />
            </el-form-item>
            <el-form-item v-if="!settingsFeild.separator">
              <template slot="label">
                <el-tooltip placement="left" effect="light">
                  <span>
                    校验模式
                    <i class="el-icon-question" />
                  </span>
                  <template slot="content">
                    <pre slot="content">
填写内容的格式验证模式（<a style="color: red;" target="_blank" href="https://www.runoob.com/jsref/jsref-obj-regexp.html">正则表达式形式</a>）。
格式验证将在前后端同时执行，因此必须确保编写的正则表达式兼容 JS 和 Java 的规范
常用模式参考如下：
1）限制长度 &gt;=10   : ^.{10,}$
2）限制长度 &lt;=500  : ^.{0,500}$
3）限制为英文字母或数字 ： ^[a-zA-z0-9]+$
                    </pre>
                  </template>
                </el-tooltip>
              </template>
              <el-input
                v-model="settingsFeild.pattern"
                type="textarea"
                rows="2"
                size="mini"
              />
            </el-form-item>
            <el-form-item v-if="!settingsFeild.separator">
              <template slot="label">
                <el-tooltip placement="left" effect="light">
                  <span>
                    模式校验告警
                    <i class="el-icon-question" />
                  </span>
                  <template slot="content">
                    <pre slot="content">
当上述的内容正则模式校验失败时，显示此处配置的提示内容
                    </pre>
                  </template>
                </el-tooltip>
              </template>
              <el-input
                v-model="settingsFeild.patternFailureWarn"
                type="textarea"
                rows="2"
                size="mini"
              />
            </el-form-item>
            <el-form-item v-if="!settingsFeild.separator">
              <template slot="label">
                <el-tooltip placement="left" effect="light">
                  <span>
                    描述(帮助)
                    <i class="el-icon-question" />
                  </span>
                  <template slot="content">
                    <pre slot="content">
字段的填写帮助或相关说明, 显示在标题<span style="color:red">帮助</span>，支持 HTML 格式.
                    </pre>
                  </template>
                </el-tooltip>
              </template>
              <el-input
                v-model="settingsFeild.description"
                type="textarea"
                rows="3"
                size="mini"
              />
            </el-form-item>
            <el-form-item v-if="!settingsFeild.separator">
              <template slot="label">
                <el-tooltip placement="left" effect="light">
                  <span>
                    描述(顶部)
                    <i class="el-icon-question" />
                  </span>
                  <template slot="content">
                    <pre slot="content">
字段的填写帮助或相关说明, 显示在内容<span style="color:red">顶部</span>，支持 HTML 格式.
                    </pre>
                  </template>
                </el-tooltip>
              </template>
              <el-input
                v-model="settingsFeild.brightHelpTop"
                type="textarea"
                rows="3"
                size="mini"
              />
            </el-form-item>
            <el-form-item v-if="!settingsFeild.separator">
              <template slot="label">
                <el-tooltip placement="left" effect="light">
                  <span>
                    描述(底部)
                    <i class="el-icon-question" />
                  </span>
                  <template slot="content">
                    <pre slot="content">
字段的填写帮助或相关说明, 显示在内容<span style="color:red">底部</span>，支持 HTML 格式.
                    </pre>
                  </template>
                </el-tooltip>
              </template>
              <el-input
                v-model="settingsFeild.brightHelpBottom"
                type="textarea"
                rows="3"
                size="mini"
              />
            </el-form-item>
            <el-form-item v-if="!settingsFeild.separator">
              <template slot="label">
                <el-tooltip placement="left" effect="light">
                  <span>
                    内容模板
                    <i class="el-icon-question" />
                  </span>
                  <template slot="content">
                    <pre slot="content">
内容显示模板, 以 <a style="color:red" href="https://www.layui.com/doc/modules/laytpl.html" target="_blank">laytpl</a> 渲染(). 数据内容为:
{
  key     : &lt;字段名&gt;,
  title   : &lt;字段标题&gt;,
  value   : &lt;字段值&gt;,
  data    : &lt;表单或行数据&gt;,
  /* 如为静态可选类型 */
  staticOptions: &lt;静态可选项&gt;
}
                    </pre>
                  </template>
                </el-tooltip>
              </template>
              <el-input
                v-model="settingsFeild.template"
                type="textarea"
                rows="3"
                size="mini"
              />
            </el-form-item>
            <el-form-item>
              <template slot="label">
                <el-tooltip placement="left" effect="light">
                  <span>
                    字段标签
                    <i class="el-icon-question" />
                  </span>
                  <template slot="content">
                    <pre slot="content">
给字段打上特定的标签，标签允许任意字符，以空白/逗号/分号作为分隔符。
通常可配合内容变更脚本使用，如通过标签对字段分组，在表单某个选项值
发生变化时，可在变更脚本中通过标签来识别字段将其标记为隐藏（或显示），
只读或可编辑等等。
                    </pre>
                  </template>
                </el-tooltip>
              </template>
              <el-input
                v-model="settingsFeild.scriptTags"
                type="textarea"
                rows="3"
                size="mini"
              />
            </el-form-item>
          </el-form>
        </el-drawer>
      </template>
    </BaseFormContentBase>
  </div>
</template>
<script>
import tool from '@/utils/tools'
import { setFieldComponentType } from '@/utils/formUtils'
export default {
  name: 'BaseFormContentConfig',
  components: {
    BaseFormContentBase: () => import('./base')
  },
  props: {
    fieldModels: {
      type: Array,
      default: function() {
        return []
      }
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
      headDraggedStore: {},
      cachedFieldModels: [],
      cachedFieldColumns: [],
      cachedColumnsHidden: [],
      settingsFeild: {},
      settingsVisible: false,
      settingsForCreation: false,
      columnSettingsField: {},
      columnSettingsVisible: false,
      columnSettingsSelected: null,
      columnSettingsAddition: false
    }
  },
  watch: {
    fieldModels: {
      immediate: true,
      handler: function(newFieldModels, oldFieldModels) {
        this.cachedFieldModels = tool.jsonCopy(newFieldModels)
        this.resetCachedColumnFields()
        this.$nextTick(() => {
          setTimeout(() => {
            this.registerDragEventListener()
          }, 1000)
        })
      }
    },
    cachedFieldColumns: {
      handler: function(newFieldColumns, oldFieldColumns) {
        this.$nextTick(() => {
          setTimeout(() => {
            this.registerDragEventListener()
            this.resetColumnFieldsOrder()
          }, 1000)
        })
      }
    }
  },
  beforeDestroy() {
    this.removeDragEventListener()
  },
  methods: {
    /**
     *  根据字段的comType属性检验是否支持配置placeholder
     */
    checkVisibleComType(settingsFeild) {
      if (tool.isNullOrUndef(settingsFeild)) {
        return false
      }
      const comType = settingsFeild.comType
      if (tool.isBlank(comType)) {
        return false
      }
      if (comType === 'file' || comType === 'innerForm') {
        return false
      }
      return true
    },
    /**
     * 获取表头布局排版 DOM 对象
     */
    getFormListHeadsWrapper() {
      return this.$refs.formListHeads.$el
    },
    /**
     * 获取表头布局排版 DOM 对象
     */
    getHeadLayoutElement() {
      return this.getFormListHeadsWrapper().getElementsByTagName('tr')[0]
    },
    /**
     * 获取表头布局排版 DOM 组对象
     */
    getCurrentGroupColumn(column) {
      for (var colgroup of this.getFormListHeadsWrapper().getElementsByTagName('col')) {
        var colclazz = column.className
        var colname = colgroup.getAttribute('name')
        if (colclazz.indexOf(colname) >= 0) {
          return colgroup
        }
      }
    },
    /**
     * 获取当前 DOM 所在列 DOM 对象
     */
    getCurrentHeadElement(elm, wrapper) {
      while (elm && wrapper.contains(elm)) {
        if (elm.parentNode === wrapper) {
          return elm
        }
        elm = elm.parentNode
      }
      return null
    },

    /**
     * 列表头的拖拽事件处理函数
     */
    eventTableDragEnter(e) {
      var sourceField
      var targetField
      var formHeads = this.getHeadLayoutElement()
      if (!(targetField = this.getCurrentHeadElement(e.target, formHeads)) ||
              !(sourceField = this.headDraggedStore.sourceField) ||
              targetField === sourceField ||
              targetField === this.headDraggedStore.targetFeild) {
        return
      }
      this.resetPrevDropTargetStyle(targetField)
    },
    eventTableDragOver(e) {
      e.preventDefault()
      var sourceField
      var targetField
      var formHeads = this.getHeadLayoutElement()
      if (!(targetField = this.getCurrentHeadElement(e.target, formHeads)) ||
          !(sourceField = this.headDraggedStore.sourceField) ||
          targetField === sourceField) {
        return
      }
      this.resetPrevDropTargetStyle()
      var targetRect = this.getFieldElementRectInfo(targetField)
      if (e.clientX > ((targetRect.right - targetRect.left) / 2 + targetRect.left)) {
        targetField.style.borderRight = '3px dotted green'
        this.headDraggedStore['targetDirection'] = 'after'
      } else {
        targetField.style.borderLeft = '3px dotted green'
        this.headDraggedStore['targetDirection'] = 'before'
      }
    },
    eventTableDragDrop(e) {
      e.preventDefault()
      var targetField
      var sourceField
      this.resetPrevDropTargetStyle()
      if (!(targetField = this.headDraggedStore.targetFeild) ||
          !(sourceField = this.headDraggedStore.sourceField) ||
          targetField === sourceField) {
        return
      }
      var sourceGroup = this.getCurrentGroupColumn(sourceField)
      var targetGroup = this.getCurrentGroupColumn(targetField)
      if (this.headDraggedStore.targetDirection === 'after') {
        tool.propAfter(targetField).after(sourceField)
        tool.propAfter(targetGroup).after(sourceGroup)
      } else {
        tool.propBefore(targetField).before(sourceField)
        tool.propBefore(targetGroup).before(sourceGroup)
      }
      this.$nextTick(() => {
        this.resetColumnFieldsOrder()
      })
    },
    eventTableDragStart(e) {
      var sourceField
      var formHeads = this.getHeadLayoutElement()
      if (!(sourceField = this.getCurrentHeadElement(e.target, formHeads))) {
        return
      }
      this.headDraggedStore = {
        sourceField: sourceField,
        sourceBorder: sourceField.style.border,
        sourceBorderLeft: sourceField.style.borderLeft
      }
      sourceField.style.border = '1px dotted red'
    },
    eventTableDragEnd(e) {
      this.headDraggedStore.sourceField.style.border =
            this.headDraggedStore.sourceBorder
      this.headDraggedStore.sourceField.style.borderLeft =
            this.headDraggedStore.sourceBorderLeft
      this.resetPrevDropTargetStyle()
      this.headDraggedStore = {}
    },

    /**
     * 注册列表头的 draggable 事件
     */
    registerDragEventListener() {
      var formHeads = this.getHeadLayoutElement()
      // console.log('Registering DragEventListener ...')
      if (tool.isBlank(formHeads.getAttribute('draggable-added'))) {
        formHeads.addEventListener('dragenter', this.eventTableDragEnter)
        formHeads.addEventListener('dragover', this.eventTableDragOver)
        formHeads.addEventListener('drop', this.eventTableDragDrop)
        formHeads.setAttribute('draggable-added', 'true')
      }
      for (var headElement of formHeads.children) {
        headElement.draggable = true
        headElement.style.borderLeft = '2px solid darkviolet'
        if (!tool.isBlank(headElement.getAttribute('draggable-added'))) {
          continue
        }
        headElement.addEventListener('dragstart', this.eventTableDragStart)
        headElement.addEventListener('dragend', this.eventTableDragEnd)
        headElement.setAttribute('draggable-added', 'true')
      }
    },

    /**
     * 移除列表头的 draggable 事件
     */
    removeDragEventListener() {
      var formHeads = this.getHeadLayoutElement()
      // console.log('Removing All DragEventListener ...')
      formHeads.removeEventListener('dragenter', this.eventTableDragEnter)
      formHeads.removeEventListener('dragover', this.eventTableDragOver)
      formHeads.removeEventListener('drop', this.eventTableDragDrop)
      for (var headElement of formHeads.children) {
        headElement.style.borderLeft = '2px solid darkviolet'
        headElement.removeEventListener('dragstart', this.eventTableDragStart)
        headElement.removeEventListener('dragend', this.eventTableDragEnd)
        headElement.setAttribute('draggable-added', '')
      }
    },

    /**
     * 移除列表头单个字段的 draggable 事件
     */
    removeFieldDragEventListener(fieldKey) {
      var formHeads = this.getHeadLayoutElement()
      for (var headElement of formHeads.children) {
        var fieldHeadElm = headElement.getElementsByClassName('form-list-head')
        if (!fieldHeadElm || fieldHeadElm.length <= 0) {
          continue
        }
        if (fieldHeadElm[0].getAttribute('form-list-field') === fieldKey) {
          console.log('Removing Field DragEventListener ... ', fieldKey)
          headElement.removeEventListener('dragstart', this.eventTableDragStart)
          headElement.removeEventListener('dragend', this.eventTableDragEnd)
          headElement.setAttribute('draggable-added', '')
          break
        }
      }
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
     * 重置当前移动标的表头的样式
     */
    resetPrevDropTargetStyle(nextFieldElement) {
      var prevTarget
      if ((prevTarget = this.headDraggedStore.targetFeild)) {
        prevTarget.style.borderLeft = this.headDraggedStore.targetBorderLeft
        prevTarget.style.borderRight = this.headDraggedStore.targetBorderRight
      }
      if (nextFieldElement) {
        this.headDraggedStore['targetFeild'] = nextFieldElement
        this.headDraggedStore['targetBorderLeft'] = nextFieldElement.style.borderLeft
        this.headDraggedStore['targetBorderRight'] = nextFieldElement.style.borderRight
      }
    },
    /**
     * 显示字段设置界面
     */
    showFieldSettings(field) {
      this.settingsFeild = field
      this.settingsVisible = true
      this.settingsForCreation = false
    },
    /**
     * 显示列表字段设置界面
     */
    showColumnSettings(column) {
      var field = null
      if (column && !tool.isBlank(column.property)) {
        for (var item of this.cachedFieldModels) {
          if (item.key === column.property) {
            field = item
            break
          }
        }
      }
      this.columnSettingsField = field
      this.columnSettingsSelected = null
      this.columnSettingsAddition = false
      if (!field) {
        this.columnSettingsAddition = true
        this.cachedColumnsHidden = this.cachedFieldModels.filter((item) => {
          return item.comType !== 'separator' && (!tool.isNumber(item.listPosition) || item.listPosition <= 0)
        })
      }
      this.columnSettingsVisible = true
    },
    /**
     * 关闭列表字段设置界面
     */
    closeColumnSettings() {
      this.settingsColumn = {}
      this.columnSettingsSelected = null
      this.columnSettingsVisible = false
    },
    /**
     * 关闭列表字段设置界面
     */
    columnSettingsCancel() {
      this.closeColumnSettings()
    },
    /**
     * 添加已选择的列表字段
     */
    columnSettingsConfirm() {
      if (!this.columnSettingsSelected) {
        this.$notify.errror('请选择需要添加的字段')
        return
      }
      var listPosition = 10
      for (var field of this.cachedFieldModels) {
        if (tool.isNumber(field.listPosition)) {
          if (field.listPosition > listPosition) {
            listPosition = field.listPosition + 10
          }
        }
      }
      this.columnSettingsSelected['listPosition'] = listPosition
      this.resetCachedColumnFields()
      this.closeColumnSettings()
    },
    /**
     * 重置列表字段数据
     */
    resetCachedColumnFields() {
      if (!tool.isArray(this.cachedFieldModels)) {
        this.cachedFieldColumns = []
        return
      }
      var cachedFieldColumns = this.cachedFieldModels.filter((item) => {
        return item.comType !== 'separator' && tool.isNumber(item.listPosition) && item.listPosition > 0
      })
      cachedFieldColumns.sort((a, b) => {
        return a.listPosition - b.listPosition
      })
      this.cachedFieldColumns = cachedFieldColumns
    },
    /**
     * 移除列表显示字段
     */
    deleteColumnSettingsField(field) {
      this.closeColumnSettings()
      if (!field) {
        return
      }
      for (var column of this.cachedFieldModels) {
        if (column === field || column.key === field.key) {
          column['listPosition'] = 0
        }
      }
      this.removeFieldDragEventListener(field.key || field)
      this.resetCachedColumnFields()
    },
    /**
     * 关闭表单字段设置界面
     */
    closeFieldSettings() {
      this.settingsFeild = {}
      this.settingsVisible = false
    },
    /**
     * 删除字段
     */
    deleteCustomField(field) {
      this.closeFieldSettings()
      var index
      if ((index = tool.inArray(field, this.cachedFieldModels)) >= 0) {
        this.cachedFieldModels.splice(index, 1)
      }
      // 移除绑定的监听事件，避免内存泄漏问题
      this.$refs.parentFormContent.removeFieldDragEventListener(field.key)
      // console.log('删除字段：', 'index = ', index, ', field = ', field)
    },
    /**
     * 添加字段界面显示
     */
    createCustomField() {
      this.settingsFeild = {
        key: '<new-field>',
        custom: true,
        fieldType: 'template'
      }
      this.settingsVisible = true
      this.settingsForCreation = true
    },
    /**
     * 添加新的字段
     */
    addCustomField(field) {
      if (tool.isBlank(field.key) || field.key.length < 3) {
        this.$notify.error('字段名称至少3个字符')
        return
      }
      if (!new RegExp('^[a-z][a-zA-Z0-9]+$').test(field.key)) {
        this.$notify.error('字段名称不合规，只能由数组和字母组成，请必须已小写字母开头')
        return
      }
      if (tool.inArray(field, this.cachedFieldModels, function(a, v) {
        return a.key === v.k || a === v
      }) >= 0) {
        this.$notify.error('字段命名出现重复：' + field.key)
        return
      }
      this.closeFieldSettings()
      this.cachedFieldModels.push(field)
      this.$nextTick(() => {
        this.$refs.parentFormContent.registerFieldDragEventListener()
      })
    },
    /**
     * 获取已变更的界面模型数据
     */
    getChangedFieldModels() {
      return this.cachedFieldModels
    },
    /**
     * 当字段类型发生变化时，需要重置控件信息
     */
    onFieldTypeChange() {
      setFieldComponentType(this.settingsFeild)
    },
    /**
     * 重置列表模式的字段及排序
     */
    resetColumnFieldsOrder() {
      var columnFieldName
      var resortedColumns = []
      var formHeads = this.getHeadLayoutElement()
      for (var fieldElement of formHeads.children) {
        // console.log(fieldElement)
        if (tool.toLower(fieldElement.tagName) !== 'th') {
          continue
        }
        var fieldHeadElm = fieldElement.getElementsByClassName('form-list-head')
        // console.log(fieldHeadElm)
        if (!fieldHeadElm || fieldHeadElm.length <= 0) {
          continue
        }
        columnFieldName = fieldHeadElm[0].getAttribute('form-list-field')
        // console.log(columnFieldName)
        if (tool.isBlank(columnFieldName)) {
          continue
        }
        resortedColumns.push(columnFieldName)
      }
      // console.log('Resorted columns = ', resortedColumns)
      for (var field of this.cachedFieldModels) {
        field['listPosition'] = 0
        for (var cidx in resortedColumns) {
          if ((columnFieldName = resortedColumns[cidx]) === field.key) {
            field['listPosition'] = (tool.parseInteger(cidx) + 1) * 10
            // console.log('Update field list position : ', field.key, '(' + cidx + ') => ', field['listPosition'])
            break
          }
        }
      }
    },
    /**
     * 当字段顺序发生变化时
     */
    resetFormFieldsOrder(fields) {
      if (!tool.isArray(fields)) {
        return
      }
      var position = 0
      for (var name of fields) {
        position += 10
        for (var field of this.cachedFieldModels) {
          if (field.key === name) {
            field.position = position
            // console.log('字段重排序：', name, ' = ', position)
            break
          }
        }
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
.el-drawer.form-field-settings {
  overflow-y: auto !important;
}
</style>
