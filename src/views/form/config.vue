<template>
  <div>
    <el-form
      v-if="formAttrs"
      label-position="right"
      label-width="120px"
      size="mini"
    >
      <el-form-item label="表单名称">
        {{ formAttrs.path }}
      </el-form-item>
      <el-row>
        <el-col :span="6">
          <el-form-item label="表单标题">
            <el-input
              v-model="formAttrs.title"
              size="mini"
            />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="确定按钮名称">
            <el-input
              v-model="formAttrs.buttonConfirmDisplayName"
              size="mini"
            />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="取消按钮名称">
            <el-input
              v-model="formAttrs.buttonCancelDisplayName"
              size="mini"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item>
        <template slot="label">
          <el-tooltip placement="left" effect="light">
            <span>
              内容验证脚本
              <i class="el-icon-question" />
            </span>
            <template slot="content">
              <pre slot="content">
通过自定义 JS 脚本可以对表单的内容进行合法性验证：
1， 脚本中通过变量 formData 可获取到表单的当前内容
2， 脚本程序最后必须 return 一个字符串，如果该字符串为空白字符串，
    则意味着表单的内容校验通过，否则表示不通过，同时该字串的内容将
    被作为错误信息提示给用户
3， 如果该验证脚本有内容，即会被执行，如果脚本语法错误或未按要求返
    回字符串值，则会被提示脚本定义错误，无法提交表单
4， 这里需要特别注意，这里定义的验证脚本即会在前端，同时当表单提交
    时，也会被后端的 JS 引擎执行，因此切记注意脚本程序的兼容性，因
    此可只能使用兼容的内建语法来完成表单内容的验证
              </pre>
            </template>
          </el-tooltip>
        </template>
        <el-input
          v-model="formAttrs.formValidation"
          size="mini"
          type="textarea"
          :rows="4"
        />
      </el-form-item>
      <el-form-item>
        <template slot="label">
          <el-tooltip placement="left" effect="light">
            <span>
              内容变更脚本
              <i class="el-icon-question" />
            </span>
            <template slot="content">
              <pre slot="content">
通过自定义 JS 脚本可以对表单的内容进行动态的变更：
1， 脚本中通过变量 feildModels 可获取到表单的字段定义清单
2， 通过每个字段定义中的 value 属性获取到字段的值，也可以修改
    字段的值，或者设置字段的可见属性（tmpHidden），或者只读属
    性（readonly）等等, 其他属性不建议随意变更，否则可能导致不
    可预知的错误
              </pre>
            </template>
          </el-tooltip>
        </template>
        <el-input
          v-model="formAttrs.formDynamicChanged"
          size="mini"
          type="textarea"
          :rows="4"
        />
      </el-form-item>
    </el-form>
    <BaseFormContentConfig
      v-if="fieldModels"
      ref="formModelConfigger"
      :field-models="fieldModels"
      :actions="formActions"
      @actions="onFormActionsClick"
    />
    <el-dialog
      v-if="previewFormModel"
      :title="`界面模型预览 - ${(previewFormModel.model && previewFormModel.model.title) || ''}`"
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :append-to-body="true"
      :visible.sync="previewFormModel.visible"
      :width="`${previewFormModel.windowWidth || 80}%`"
      height="800px"
    >
      <BaseFormContent
        v-if="previewFormModel.style === 'form' && previewFormModel.model"
        :form-name="formName"
        :form-model="previewFormModel.model"
        :default-data="previewFormModel.data[0]"
        :editable="true"
        :show-all-fields="true"
      />
      <BaseFormTable
        v-else-if="previewFormModel.model"
        :expand-all="true"
        :data="previewFormModel.data"
        :columns="previewFormModel.model"
        :show-all-fields="true"
      />
    </el-dialog>
  </div>
</template>
<script>
import {
  getVisibleFieldModels,
  fixNoPlacementCompatibility,
  FORM_FIELD_OPTIONS
} from '@/utils/formUtils'
import tool from '@/utils/tools'
import { Loading } from 'element-ui'
import FormApi from '@/apis/formApi'
import BaseFormTable from '@/components/BaseFormTable'
import BaseFormContent from '@/components/BaseFormContent'
import BaseFormContentConfig from '@/components/BaseFormContent/config'
export default {
  components: {
    BaseFormTable,
    BaseFormContent,
    BaseFormContentConfig
  },
  props: {
    formName: {
      type: String,
      required: true
    },
    formModel: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      formAttrs: null,
      fieldModels: null,
      /**
       * 待预览的界面模型
       */
      previewFormModel: {
        visible: false
      },
      /**
       * 表单事件
       */
      formActions: [
        {
          name: '保存变更',
          fun: this.saveFormAttributes
        },
        {
          name: '只读预览',
          fun: this.preViewAttributes
        },
        {
          name: '编辑预览',
          fun: this.preViewAttributesForEditor
        },
        {
          name: '添加字段',
          fun: this.showFieldCreationForm
        }
      ]
    }
  },
  watch: {
    formModel: {
      handler: function() {
        this.createConfigFormModel()
      }
    }
  },
  methods: {
    /**
     * 构建界面模型配置数据
     * @param {Object} target
     */
    createConfigFormModel() {
      // console.log('界面模型数据：', this.formModel)
      this.formAttrs = null
      this.fieldModels = null
      if (!this.formModel) {
        return
      }
      this.formAttrs = {
        path: this.formModel.classPath,
        custom: !!this.formModel.custom,
        modifiable: !!this.formModel.modifiable,
        title: tool.trim(this.formModel.title),
        description: tool.trim(this.formModel.description),
        formValidation: tool.trim(this.formModel.formValidation),
        formDynamicChanged: tool.trim(this.formModel.formDynamicChanged),
        buttonCancelDisplayName: tool.trim(this.formModel.buttonCancelDisplayName),
        buttonConfirmDisplayName: tool.trim(this.formModel.buttonConfirmDisplayName)
      }
      this.fieldModels = getVisibleFieldModels(
        this.formModel,
        FORM_FIELD_OPTIONS.All
      )
    },

    /**
     * 获取当前的表单属性配置
     */
    getFormAttributes() {
      var formConfigs = [{
        field: ':form',
        title: this.formAttrs.title,
        description: this.formAttrs.description,
        formValidation: this.formAttrs.formValidation,
        formDynamicChanged: this.formAttrs.formDynamicChanged,
        buttonCancelDisplayName: tool.trim(this.formAttrs.buttonCancelDisplayName),
        buttonConfirmDisplayName: tool.trim(this.formAttrs.buttonConfirmDisplayName)
      }]
      var configger = this.$refs.formModelConfigger
      var fieldModes = configger.getChangedFieldModels()
      for (var fieldModel of fieldModes) {
        var fieldAttrs = {
          field: fieldModel.key,
          title: fieldModel.title,
          titleWidth: fieldModel.titleWidth,
          titleWithoutColon: !!fieldModel.titleWithoutColon,
          pattern: fieldModel.pattern,
          position: fieldModel.position,
          placement: fieldModel.placement,
          placerows: fieldModel.placerows,
          listWidth: fieldModel.listWidth,
          listPosition: fieldModel.listPosition,
          template: fieldModel.template,
          scriptTags: fieldModel.scriptTags,
          description: fieldModel.description,
          placeholder: fieldModel.placeholder,
          brightHelpTop: fieldModel.brightHelpTop,
          brightHelpBottom: fieldModel.brightHelpBottom,
          patternFailureWarn: fieldModel.patternFailureWarn,
          readonlyAsEditor: fieldModel.readonlyAsEditor
        }
        if (fieldModel.custom) {
          Object.assign(fieldAttrs, {
            fieldType: fieldModel.fieldType,
            editable: !fieldModel.readonly,
            required: !!fieldModel.required
          })
        } else if (fieldModel.modifiable) {
          Object.assign(fieldAttrs, {
            editable: !fieldModel.readonly,
            required: !!fieldModel.required
          })
        }
        formConfigs.push(fieldAttrs)
      }
      return formConfigs
    },

    /**
     * 保存界面模型数据
     */
    saveFormAttributes() {
      this.$confirm(`是否确认保存：${this.formAttrs.path}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'save-form-view-confirm'
      }).then(() => {
        var formConfigs = this.getFormAttributes()
        var loading = Loading.service({ fullscreen: true, text: '保存中…', background: 'rgba(0, 0, 0, 0.1)' })
        new FormApi(this.formName).saveViewAttributes(this.formAttrs.path, formConfigs).then(res => {
          this.$notify.success(`保存成功`)
          this.$emit('change', formConfigs, this.formName, this.formAttrs.path)
        }).finally(e => {
          loading.close()
        })
      })
    },

    /**
     * 预览当前界面模型视图
     */
    preViewAttributes(style, editable, forEvent) {
      var formConfigs = this.getFormAttributes()
      var loading = Loading.service({ fullscreen: true, text: '请求中…', background: 'rgba(0, 0, 0, 0.1)' })
      new FormApi(this.formName).preViewAttributes(this.formAttrs.path, formConfigs).then(formModel => {
        this.previewFormModel.style = style
        this.previewFormModel.visible = true
        this.previewFormModel.editable = !!editable
        this.previewFormModel.windowWidth = formModel.placement > 1 ? (formModel.placement / 12 * 100) : 0
        this.previewFormModel.model = (forEvent ? fixNoPlacementCompatibility(formModel) : formModel)
        this.previewFormModel.data = [{}]
        var fields = getVisibleFieldModels(formModel, FORM_FIELD_OPTIONS.All)
        for (const field of fields) {
          if (field.comType === 'innerForm') {
            this.previewFormModel.data[0][field.key] = [{}]
          }
        }
      }).finally(e => {
        loading.close()
      })
    },

    /**
     * 预览当前界面模型视图(编辑模式)
     */
    preViewAttributesForEditor() {
      var formEvent = false
      if (tool.inArray('action', this.formModel.types) >= 0) {
        formEvent = true
      }
      this.preViewAttributes('form', true, formEvent)
    },

    /**
     *  自定义表单按钮点击回调
     */
    onFormActionsClick(action) {
      if (action && tool.isFunction(action.fun)) {
        action.fun.call(this)
      }
    },

    /**
     * 显示字段创建窗口
     */
    showFieldCreationForm() {
      this.$refs.formModelConfigger.createCustomField()
    }
  }
}
</script>
<style lang="scss">
.save-form-view-confirm {
  min-width: 600px !important;
}
</style>
