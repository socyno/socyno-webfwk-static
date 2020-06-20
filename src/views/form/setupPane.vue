<template>
  <div v-if="formClass.data">
    <el-dialog title="新增字段" :modal-append-to-body="false" :close-on-click-modal="false" :visible.sync="formFeildCreation.visible" width="700px">
      <el-form ref="fieldCreationForm" label-position="right" :rules="formFeildCreation.rules" :model="formFeildCreation.data" label-width="120px" class="demo-form-inline">
        <el-form-item label="字段：" prop="field">
          <el-input v-model="formFeildCreation.data.field" class="width300" :placeholder="'请输入字段名称,支持以*结尾的模糊匹配'" />
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
    <el-form label-position="right" style="width: 100%;" label-width="200px">
      <el-form-item v-for="(field, name, index) in formClass.data" :key="`view-${ index }`" :label="`${ name }：`" :prop="name">
        <div v-if="name !== ':form'">
          <span class="field-name">只读</span>
          <el-input :value="field.readonly ? '是' : '否'" disabled class="input-boolean" />
          <span class="field-name">必填</span>
          <el-input :value="field.required ? '是' : '否'" disabled class="input-boolean" />
          <span class="field-name">类型</span>
          <el-input :value="field.type" disabled class="input-number" />
          <span class="field-name">控件</span>
          <el-input :value="field.comType" disabled class="input-number" />
          <el-tooltip effect="light" content="定义字段在列表模式下的排列顺序, 当值 <= 0 时,字段将隐藏" placement="left-start">
            <span class="field-name">序(列)</span>
          </el-tooltip>
          <el-input v-model="field.listPosition" type="number" class="input-number" />
          <el-tooltip effect="light" content="定义字段在列表模式下的列宽, 单位(px)" placement="left-start">
            <span class="field-name">宽(列)</span>
          </el-tooltip>
          <el-input v-model="field.listWidth" type="number" class="input-number" />
        </div>
        <div>
          <el-tooltip effect="light" content="特殊的标题: 1) <empty> 强制隐藏标题; 2) 当标题长度 < 1 则时显示为短标题样式" placement="left-start">
            <span class="field-name">标题</span>
          </el-tooltip>
          <el-input v-model="field.title" class="input-title" />
          <span class="field-name">选项</span>
          <el-input :value="field.fieldOptionsType" disabled class="input-number" />
          <el-tooltip effect="light" placement="left-start">
            <pre slot="content">
定义字段控件的高度, 当前适用于:
1) 指定纯文本的编辑框默认行数;
2) 针对文件上传控件, 当明确定义且值 &lt;= 1 时, 将禁用拖放功能，仅提供文件选择器;
            </pre>
            <span class="field-name">高度</span>
          </el-tooltip>
          <el-input v-model="field.placerows" type="number" :disabled="name === ':form'" class="input-number" />
          <el-tooltip effect="light" content="定义字段在列表模式下的排列顺序, 当值 <= 0 时, 字段将不显示" placement="left-start">
            <span class="field-name">序(单)</span>
          </el-tooltip>
          <el-input v-model="field.position" type="number" :disabled="name === ':form'" class="input-number" />
          <el-tooltip effect="light" placement="left-start">
            <pre slot="content">
定义字段显示区域列宽:
1) 横向宽度被分割为12列
2）当的剩余列宽不够时, 将自动换行显示
3）默认只读模式下短字段4列，长字段12列； 编辑模式下均12列
            </pre>
            <span class="field-name">宽(单)</span>
          </el-tooltip>
          <el-select v-model="field.placement" clearable class="input-number">
            <el-option label="默认" value="" />
            <el-option label="01" value="1" />
            <el-option label="02" value="2" />
            <el-option label="03" value="3" />
            <el-option label="04" value="4" />
            <el-option label="05" value="5" />
            <el-option label="06" value="6" />
            <el-option label="07" value="7" />
            <el-option label="08" value="8" />
            <el-option label="09" value="9" />
            <el-option label="10" value="10" />
            <el-option label="11" value="11" />
            <el-option label="12" value="12" />
            <el-option v-if="field.fieldType === '_custom'" label="分隔符" value="-" />
          </el-select>
          <i v-if="field.fieldType === '_custom'" size="mini" class="el-icon-delete" @click="confirmFieldDeletionForm(formClass, name)" />
        </div>
        <div v-if="name !== ':form'">
          <el-tooltip effect="light" placement="left-start">
            <pre slot="content">
填写内容的格式验证模式（<a style="color: red;" target="_blank" href="https://www.runoob.com/jsref/jsref-obj-regexp.html">正则表达式形式</a>）。
格式验证将在前后端同时执行，因此必须确保编写的正则表达式兼容 JS 和 Java 的规范
常用模式参考如下：
1）限制长度 &gt;=10   : ^.{10,}$
2）限制长度 &lt;=500  : ^.{0,500}$
3）限制为英文字母或数字 ： ^[a-zA-z0-9]+$
            </pre>
            <span class="field-name">格式</span>
          </el-tooltip>
          <el-input v-model="field.pattern" type="textarea" :rows="1" class="field-line" />
        </div>
        <div v-if="name !== ':form'">
          <el-tooltip effect="light" placement="left-start">
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
            <span class="field-name">模板</span>
          </el-tooltip>
          <el-input v-model="field.template" type="textarea" :rows="1" class="field-line" />
        </div>
        <div v-if="name !== ':form'">
          <el-tooltip effect="light" placement="left-start">
            <pre slot="content">
字段的帮助或说明, 支持 HTML 格式.
1）以 # 开头将显示在内容区域的顶部;
2）以 * 开头将显示在内容区域的底部;
3）否则以字段标题 ToolTip 形式展示;
            </pre>
            <span class="field-name">描述</span>
          </el-tooltip>
          <el-input v-model="field.description" type="textarea" :rows="1" class="field-line" />
        </div>
      </el-form-item>
      <el-form-item label>
        <el-button type="primary" size="small" @click="showFieldCreationForm(formClass)">
          添加字段
        </el-button>
        <el-button type="primary" size="small" @click="saveViewAttributes(formClass)">
          保存视图
        </el-button>
        <el-button type="primary" size="small" @click="preViewAttributes(formClass)">
          视图预览
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: 'SetupViewPane',
  models: [
    'save',
    'preview'
  ],
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
      }
    }
  },
  methods: {
    /**
     * 打开添加额外字段的窗口
     */
    showFieldCreationForm(target) {
      this.formFeildCreation.data = {}
      this.formFeildCreation.target = target
      this.formFeildCreation.visible = true
    },

    /**
     * 删除用户自定义的表单字段
     */
    confirmFieldDeletionForm(target, field) {
      this.$confirm(`是否确认删除该字段?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$delete(target.data, field)
      })
    },

    /**
     * 关闭添加额外字段的窗口
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
        if (this.formFeildCreation.target.data[name]) {
          this.$notify.error('字段(' + name + ')已存在')
          return
        }
        this.$set(this.formFeildCreation.target.data, name, {
          type: 'string',
          fieldType: '_custom',
          title: '',
          position: '',
          template: '',
          description: '',
          placement: ''
        })
        this.closeFieldCreationForm()
      })
    },

    /**
     * 保存当前的视图界面数据
     */
    saveViewAttributes(formClass) {
      this.$emit('save', formClass)
    },

    /**
     * 预览当前的视图界面数据
     */
    preViewAttributes(formClass) {
      this.$emit('preview', formClass)
    }
  }
}
</script>
<style scoped lang='scss'>
.el-icon-delete {
    cursor: pointer;
    color: red;
    padding: 0 5px 0 2px;
}
.el-icon-plus {
  cursor: pointer;
  color: #409EFF;
  font-size: 21px;
  margin-left: 10px;
  vertical-align: middle;
}
</style>
<style lang='scss'>
.form-setup {
  .field-name {
    display: inline-block;
    width: 40px !important;
    padding-left: 10px;
  }
  .el-input{
    display: initial !important;
  }
  .width300 .el-input__inner{
    width: 300px !important;
  }
  .input-title .el-input__inner{
    width: 150px !important;
  }
  .input-number .el-input__inner{
    width: 100px !important;
  }
  .input-boolean .el-input__inner{
    width: 50px !important;
  }
  .field-line {
    display: inline-block;
    width: 750px !important;
  }
}
</style>
