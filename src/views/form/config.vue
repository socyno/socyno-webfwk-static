<template>
  <div>
    <el-form
      v-if="formAttrs"
      label-position="right"
      label-width="100px"
      size="mini"
    >
      <el-form-item label="表单名称">
        {{ formAttrs.path }}
      </el-form-item>
      <el-form-item label="表单标题">
        <el-input
          v-model="formAttrs.title"
          size="mini"
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
      />
      <BaseFormTable
        v-else-if="previewFormModel.model"
        :expand-all="true"
        :data="previewFormModel.data"
        :columns="previewFormModel.model"
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
      handler() {
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
        title: tool.stringify(this.formModel.title),
        description: tool.stringify(this.formModel.description)
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
        description: this.formAttrs.description
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
          description: fieldModel.description
        }
        if (fieldModel.custom) {
          Object.assign(fieldAttrs, {
            fieldType: fieldModel.fieldType,
            editable: !!fieldModel.editable,
            required: !!fieldModel.required
          })
        } else if (fieldModel.modifiable) {
          Object.assign(fieldAttrs, {
            editable: !!fieldModel.editable,
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
