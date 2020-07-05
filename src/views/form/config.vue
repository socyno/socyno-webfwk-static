<template>
  <div>
    <BaseFormContentConfig
      v-if="fieldModels"
      ref="formModel"
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
        :default-data="previewFormModel.data"
        :editable="previewFormModel.editable"
        :show-all="true"
        :draggable="true"
      />
      <BaseFormTable
        v-else-if="previewFormModel.model"
        :expand-all="true"
        :data="previewFormModel.data"
        :columns="previewFormModel.model"
      />
    </el-dialog>
    <el-dialog
      title="添加字段"
      :append-to-body="true"
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :visible.sync="formFeildCreation.visible"
      width="800px"
    >
      <el-form
        ref="fieldCreationForm"
        :rules="formFeildCreation.rules"
        :model="formFeildCreation.data"
      >
        <el-form-item label="请输入字段名称：" prop="field">
          <el-input v-model="formFeildCreation.data.field" placeholder="请输入字段名称" />
        </el-form-item>
        <el-form-item label>
          <el-button type="primary" size="small" @click="closeFieldCreationForm(true)">
            保存
          </el-button>
          <el-button size="small" @click="closeFieldCreationForm()">
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import tool from '@/utils/tools'
import { Loading } from 'element-ui'
import FormApi from '@/apis/formApi'
import BaseFormTable from '@/components/BaseFormTable'
import BaseFormContent from '@/components/BaseFormContent'
import BaseFormContentConfig from '@/components/BaseFormContent/config'
import { getVisibleFieldModels, fixNoPlacementCompatibility } from '@/utils/formUtils'
export default {
  components: {
    BaseFormTable,
    BaseFormContent,
    BaseFormContentConfig
  },
  props: {
    formClass: {
      type: Object,
      default: () => {
        return {}
      },
      required: true
    }
  },
  data() {
    return {
      formData: null,
      formModel: null,
      fieldModels: null,
      /**
       * 待预览的界面模型
       */
      previewFormModel: {
        visible: false
      },
      /**
       * 添加的字段数据
       */
      formFeildCreation: {
        data: {
          field: ''
        },
        target: {

        },
        rules: {
          field: [
            { required: true, message: '内容不能为空', trigger: 'blur' }
          ]
        },
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
    formClass: {
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
      // console.log('界面模型数据：', this.formClass)
      this.fieldModels = null
      if (!this.formClass || !this.formClass.formModel) {
        return
      }
      this.fieldModels = getVisibleFieldModels(this.formClass.formModel)
    },

    /**
     * 删除指定的字段
     */
    removeFormField(field) {
      this.$confirm(`确认删除自定义字段 : ${field} ?`, '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var changed = false
        if (this.formData && this.formData.hasOwnProperty(field)) {
          changed = true
          delete this.formData[field]
        }
        if (this.formModel && this.formModel.properties && this.formModel.properties.hasOwnProperty(field)) {
          changed = true
          delete this.formModel.properties[field]
        }
        // 字段数据删除后，重新渲染
        if (changed) {
          this.rerendForm()
        }
      }).catch(() => {

      })
    },

    /**
     * 添加字段模型和数据
     */
    addFormField(field, attrs) {
      this.formModel.properties[field] = {
        key: field,
        type: 'array',
        title: field,
        titleWidth: 200,
        placement: 12,
        position: tool.looksLikeInteger(attrs.position) && attrs.position > 0 ? (attrs.position + 10) : '',
        fieldType: 'FormView',
        items: {
          properties: {
            title: {
              type: 'string',
              title: '标题',
              titleWidth: 80,
              titleWithoutColon: true,
              placement: 4,
              position: 5,
              description: '<pre>\n' +
                    '字段的显示标题，请注意以下特殊事项:\n' +
                    '  1) 如希望不显示标题，请在标题中写入 <empty> 即可;\n' +
                    '  2) 当标题长度为单个字符时，将自动转为短标题样式展示'
            },
            fieldType: {
              title: '类型',
              type: 'string',
              titleWidth: 80,
              titleWithoutColon: true,
              placement: 2,
              position: 10,
              fieldOptionsType: 'STATIC',
              staticOptions: [
                { value: 'readonly', display: '只读文本' },
                { value: 'separator', display: '分隔符' },
                { value: 'hidden', display: '以下字段不显示' },
                { value: 'hiddenIfAllEmpty', display: '以下字段值全为空不显示' }
              ],
              readonly: !attrs.custom || !attrs.modifiable
            },
            required: {
              title: '必填',
              type: 'boolean',
              titleWidth: 80,
              titleWithoutColon: true,
              placement: 2,
              position: 20,
              readonly: !attrs.custom || !attrs.modifiable
            },
            editable: {
              title: '可编辑',
              type: 'boolean',
              titleWidth: 80,
              titleWithoutColon: true,
              placement: 2,
              position: 30,
              readonly: !attrs.custom || !attrs.modifiable
            },
            delete: {
              type: 'button',
              title: '删除字段',
              position: 40,
              titleWidth: 0,
              placement: 1,
              styleSize: 'mini',
              readonly: !attrs.custom,
              styleType: 'danger'
            },
            titleWidth: {
              type: 'string',
              title: '标题宽度',
              titleWidth: 80,
              titleWithoutColon: true,
              placement: 2,
              position: 50,
              fieldOptionsType: 'STATIC',
              staticOptions: [
                { value: '', display: '默认' },
                { value: '20', display: '20px' },
                { value: '40', display: '20px' },
                { value: '60', display: '20px' },
                { value: '80', display: '20px' },
                { value: '120', display: '20px' },
                { value: '160', display: '20px' },
                { value: '200', display: '20px' }
              ]
            },
            titleWithoutColon: {
              type: 'string',
              title: '标题冒号',
              titleWidth: 80,
              titleWithoutColon: true,
              placement: 2,
              position: 51,
              fieldOptionsType: 'STATIC',
              staticOptions: [
                { value: '', display: '有' },
                { value: 'true', display: '无' }
              ]
            },
            position: {
              title: '序/单',
              type: 'integer',
              titleWidth: 80,
              titleWithoutColon: true,
              placement: 2,
              position: 52,
              description: '<pre>\n' +
                    '定义字段在表单模式下的排列顺序, 当值 <= 0 时, 字段将不被显示。\n' +
                    '即：支持在表单模式和列表模式下拥有独立的排序和空间宽度配置\n' +
                    '</pre>'
            },
            placement: {
              title: '宽/单',
              type: 'integer',
              titleWidth: 80,
              titleWithoutColon: true,
              placement: 2,
              position: 53,
              fieldOptionsType: 'STATIC',
              staticOptions: [
                { value: '1', display: '1/12' },
                { value: '2', display: '2/12' },
                { value: '3', display: '3/12' },
                { value: '4', display: '4/12' },
                { value: '5', display: '5/12' },
                { value: '6', display: '6/12' },
                { value: '7', display: '7/12' },
                { value: '8', display: '8/12' },
                { value: '9', display: '9/12' },
                { value: '10', display: '10/12' },
                { value: '11', display: '11/12' },
                { value: '12', display: '12/12' }
              ],
              description: '<pre>\n' +
                    '定义在表单模式下，字段显示区域的空间宽度:\n' +
                    '  1) 横向宽度被分割为12列，可指定占几列\n' +
                    '  2）当的剩余列宽不够时, 将自动换行显示\n' +
                    '  3）只读时短字段默认4列，长字段默认12列；\n' +
                    '  4）编辑时所有字段默认均占12列\n' +
                    '</pre>'
            },
            listPosition: {
              title: '序/列',
              type: 'integer',
              titleWidth: 80,
              titleWithoutColon: true,
              placement: 2,
              position: 54,
              description: '<pre>\n' +
                    '定义字段在列表模式下的排列顺序, 当值 <= 0 时, 字段将不被显示。\n' +
                    '即：支持在表单模式和列表模式下拥有独立的排序和空间宽度配置\n' +
                    '</pre>'
            },
            listWidth: {
              title: '宽/列',
              type: 'integer',
              titleWidth: 80,
              titleWithoutColon: true,
              placement: 2,
              position: 55,
              description: '<pre>\n' +
                    '定义字段在列表模式下的空间宽度。注意：与表单模式下的宽度配置的区别，此处为像素宽度（px）\n' +
                    '</pre>'
            },
            pattern: {
              title: '格式',
              type: 'string',
              titleWidth: 80,
              titleWithoutColon: true,
              placement: 10,
              position: 70,
              description: '<pre>\n' +
                    '填写内容的格式验证模式（<a style="color: red;" target="_blank" href="https://www.runoob.com/jsref/jsref-obj-regexp.html">正则表达式形式</a>）。\n' +
                    '格式验证将在前后端同时执行，因此必须确保编写的正则表达式兼容 JS 和 Java 的规范\n' +
                    '常用模式参考如下：\n' +
                    '  1）限制长度 &gt;=10   : ^.{10,}$\n' +
                    '  2）限制长度 &lt;=500  : ^.{0,500}$\n' +
                    '  3）限制为英文字母或数字 ： ^[a-zA-z0-9]+$\n' +
                    '</pre>'
            },
            placerows: {
              title: '高度',
              type: 'integer',
              titleWidth: 80,
              titleWithoutColon: true,
              placement: 2,
              position: 75,
              description: '<pre>\n' +
                    '定义自表单模式下，字段控件的空间高度, 当前仅适用于:\n' +
                    '1) 定义文本编辑框显示行数;\n' +
                    '2) 针对文件上传控件, 当明确定义且值 &lt;= 1 时, 将禁用拖放功能，仅提供文件选择器;\n' +
                    '</pre>'
            },
            description: {
              title: '描述',
              type: 'string',
              titleWidth: 80,
              titleWithoutColon: true,
              placement: 12,
              placerows: 3,
              position: 80,
              description: '<pre>\n' +
                    '字段的帮助或说明, 支持 HTML 格式.\n' +
                    '  1）以 # 开头将显示在内容区域的顶部;\n' +
                    '  2）以 * 开头将显示在内容区域的底部;\n' +
                    '  3）否则以字段标题 ToolTip 形式展示;\n' +
                    '</pre>'
            },
            template: {
              title: '模板',
              type: 'string',
              titleWidth: 80,
              titleWithoutColon: true,
              placement: 12,
              placerows: 3,
              position: 90,
              description: '<pre>\n' +
                   '内容显示模板, 以 <a style="color:red" href="https://www.layui.com/doc/modules/laytpl.html" target="_blank">laytpl</a> 渲染(). 数据内容为:\n' +
                   '{\n' +
                   '  key     : &lt;字段名&gt;,\n' +
                   '  title   : &lt;字段标题&gt;,\n' +
                   '  value   : &lt;字段值&gt;,\n' +
                   '  data    : &lt;表单或行数据&gt;,\n' +
                   '  /* 如为静态可选类型 */\n' +
                   '  staticOptions: &lt;静态可选项&gt;\n' +
                   '}</pre>'
            }
          }
        }
      }
      this.formData[field] = [Object.assign(attrs, { key: field, editable: !attrs.readonly })]
    },

    /**
     * 获取有效界面模型数据
     */
    getFormValidData() {
      var data = this.$refs.formModel.getFormValidData()
      // console.log('表单模型数据变更结果如下:', data)
      if (!data) {
        return
      }
      var formData = []
      for (var key in data) {
        if (!data.hasOwnProperty(key) || key === '#') {
          continue
        }
        formData.push(Object.assign(data[key][0], { field: key }))
      }
      console.log('表单模型最终保存数据如下:', formData)
      return formData
    },

    /**
     * 保存界面模型数据
     */
    saveFormAttributes() {
      var data
      if (!(data = this.getFormValidData())) {
        return
      }
      this.$confirm(`是否确认保存：${this.formClass.path}?`, '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
        .then(() => {
          var loading = Loading.service({ fullscreen: true, text: '保存中…', background: 'rgba(0, 0, 0, 0.1)' })
          new FormApi(this.formClass.form).saveViewAttributes(this.formClass.path, data).then(res => {
            this.$notify.success(`保存成功`)
            this.$emit('change', data, this.formClass.form, this.formClass.path)
          }).finally(e => {
            loading.close()
          })
        })
    },

    /**
     * 预览当前界面模型视图
     */
    preViewAttributes(style, editable, forEvent) {
      var data
      if (!(data = this.getFormValidData())) {
        return
      }
      var loading = Loading.service({ fullscreen: true, text: '请求中…', background: 'rgba(0, 0, 0, 0.1)' })
      new FormApi(this.formClass.form).preViewAttributes(this.formClass.path, data).then(formModel => {
        this.previewFormModel.style = style
        this.previewFormModel.visible = true
        this.previewFormModel.editable = !!editable
        this.previewFormModel.windowWidth = formModel.placement > 1 ? (formModel.placement / 12 * 100) : 0
        this.previewFormModel.model = (forEvent ? fixNoPlacementCompatibility(formModel) : formModel)
        this.previewFormModel.data = [{}]
        var fields = getVisibleFieldModels(formModel)
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
      if (tool.inArray('action', this.formClass.types) >= 0) {
        formEvent = true
      }
      this.preViewAttributes('form', true, formEvent)
    },

    /**
     * 打开添加额外字段的窗口
     */
    showFieldCreationForm() {
      this.formFeildCreation.data = {}
      this.formFeildCreation.visible = true
    },

    /**
     * 关闭添加字段的窗口
     */
    closeFieldCreationForm(saveField) {
      if (!saveField) {
        this.formFeildCreation.visible = false
        return
      }
      // console.log('当前添加字段的信息如下：')
      // console.log(this.formFeildCreation)
      this.$refs['fieldCreationForm'].validate(valid => {
        if (!valid) {
          return
        }
        var name = this.formFeildCreation.data.field
        if (this.formData.hasOwnProperty(name)) {
          this.$notify.error('字段(' + name + ')已存在')
          return
        }
        this.addFormField(name, {
          key: name,
          custom: true,
          modifiable: true,
          readonly: true,
          type: 'string',
          fieldType: 'readonly'
        })
        this.closeFieldCreationForm()
        this.rerendForm()
      })
    },

    /**
     * 强制重新渲染界面
     * 这里基于的原理是 v-if="formModel"
     */
    rerendForm() {
      var savedFormModel = this.formModel
      this.formModel = null
      this.$nextTick(function() {
        this.formModel = savedFormModel
      })
    },

    /**
     * 表单中的自定义按钮回调
     * @param {Object} field
     * @param {Object} baseContentForm
     */
    onFieldButtonClick(field, baseContentForm) {
      console.log('点击字段删除按钮：', field)
      if (!tool.isArray(field) && field.length !== 2) {
        return
      }
      if (field[0] && field[1] && field[0].field.key === 'delete') {
        this.removeFormField(field[1].field.key)
      }
    },

    /**
     *  自定义表单按钮点击回调
     */
    onFormActionsClick(action) {
      if (action && tool.isFunction(action.fun)) {
        action.fun.call(this)
      }
    }
  }
}
</script>
