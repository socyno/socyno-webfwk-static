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
        <span class="field-name">名称：</span><el-input v-model="field.title" class="width120" />
        <span class="field-name">序号：</span><el-input v-model="field.position" type="number" class="width90" />
        <span class="field-name">分组：</span><el-input v-model="field.group" class="width120" />
        <span class="field-name">布局：</span><el-select v-model="field.placement" clearable class="width120">
          <el-option label="默认" value="" />
          <el-option label="列显" value="cell" />
          <el-option label="行显" value="line" />
          <el-option label="块显" value="block" />
        </el-select>
        <i v-if="field.fieldType === '_custom'" size="mini" class="el-icon-delete" @click="confirmFieldDeletionForm(formClass, name)" />
        <div>
          <span class="field-name">模板：</span>
          <el-input v-model="field.template" type="textarea" :rows="2" class="field-line" />
        </div>
        <div>
          <span class="field-name">描述：</span>
          <el-input v-model="field.description" type="textarea" :rows="2" class="field-line" />
        </div>
      </el-form-item>
      <el-form-item label>
        <el-button type="primary" size="small" @click="showFieldCreationForm(formClass)">
          添加字段
        </el-button>
        <el-button type="primary" size="small" @click="saveViewAttributes(formClass)">
          保存视图
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: 'SetupViewPane',
  props: {
    formClass: {
      type: Object,
      default: () => {
        return {}
      },
      required: true
    },
    saveClick: {
      type: Function,
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
      console.log('当前添加字段的信息如下：')
      console.log(this.formFeildCreation)
      this.$refs['fieldCreationForm'].validate(valid => {
        if (!valid) {
          return
        }
        var name = this.formFeildCreation.data.field
        if (this.formFeildCreation.target.data[name]) {
          this.$message.error('字段(' + name + ')已存在')
          return
        }
        this.$set(this.formFeildCreation.target.data, name, {
          type: 'string',
          fieldType: '_custom',
          title: '',
          group: '',
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
      this.saveClick(formClass)
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
    width: 50px !important;
    padding-left: 10px;
  }
  .el-input{
    display: initial !important;
  }
  .width300 .el-input__inner{
    width: 300px !important;
  }
  .width120 .el-input__inner{
    width: 120px !important;
  }
  .width90 .el-input__inner{
    width: 90px !important;
  }
  .field-line {
    display: inline-block;
    width: 630px !important;
  }
}
</style>
