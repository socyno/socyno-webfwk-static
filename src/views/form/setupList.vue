<template>
  <div v-if="tableData" class="form-log">
    <el-form :inline="true" class="demo-form-inline">
      <el-form-item label="">
        <el-button type="primary" size="medium" @click="addClick(true)">
          新增
        </el-button>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" border>
      <el-table-column type="index" width="50" />
      <el-table-column label="表单名称" prop="formDisplay" />
      <el-table-column label="表单key" prop="formName" />
      <el-table-column label="后端服务" prop="formBackend" />
      <el-table-column label="服务类" prop="formService" />
      <el-table-column label="状态" width="80">
        <template slot-scope="scope">
          <span v-if="scope.row.disabled" class="unAdoptColor">禁用</span>
          <span v-else class="adoptColor">启用</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button type="text" size="small">
            <a target="_blank" :href="`#/form/flowchart/${scope.row.formName}`">流程图</a>
          </el-button>
          <el-button type="text" size="small">
            <a target="_blank" :href="`#/form/setup/${scope.row.formName}`">设置</a>
          </el-button>
          <el-button type="text" size="small" @click="updataClick(scope.row)">
            修改
          </el-button>
          <el-button type="text" size="small" @click="deleteClick(scope.row.formDisplay,scope.row.formName)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="流程设置" :modal-append-to-body="false" :close-on-click-modal="false" :visible.sync="dialogAddVisible" width="800px">
      <el-form ref="form01" label-position="right" style="width:700px" :rules="addRules" label-width="120px" :inline="false" :model="addParam" class="demo-form-inline">
        <el-form-item label="表单名称：" prop="formDisplay">
          <el-input v-model="addParam.formDisplay" placeholder="请输入表单名称" />
        </el-form-item>
        <el-form-item label="表单key：" prop="formName">
          <el-input v-model="addParam.formName" placeholder="请输入表单key" />
        </el-form-item>
        <el-form-item label="后端服务：" prop="formBackend">
          <el-select v-model="addParam.formBackend" placeholder="请选择后端服务">
            <el-option label="webfwk-gateway" value="webfwk-gateway" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务类：" prop="formService">
          <el-input v-model="addParam.formService" placeholder="请输入服务类" />
        </el-form-item>
        <el-form-item label="是否禁用：" prop="description">
          <el-radio v-model="addParam.disabled" label="0">
            启用
          </el-radio>
          <el-radio v-model="addParam.disabled" label="1">
            禁用
          </el-radio>
        </el-form-item>
        <el-form-item label="显示事件：" prop="visibleActions">
          <el-input v-model="addParam.visibleActions" placeholder="请输入显示事件(多个可使用逗号,分号或空格分隔), 默认显示所有" />
        </el-form-item>
        <el-form-item label>
          <el-button type="primary" @click="submitForm('form01')">
            保存
          </el-button>
          <el-button @click="addClick(false)">
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import { Loading } from 'element-ui'
import FormApi from '@/apis/formApi'
export default {
  data() {
    return {
      tableData: null,
      dialogAddVisible: false,
      isAdd: true,
      addParam: {
        formDisplay: '',
        formName: '',
        formService: '',
        formBackend: '',
        disabled: '0'
      },
      addRules: {
        formDisplay: [
          { required: true, message: '请填写表单名称', trigger: 'blur' }
        ],
        formName: [
          { required: true, message: '请填写表单Key', trigger: 'blur' }
        ],
        formService: [
          { required: true, message: '请填写服务类', trigger: 'blur' }
        ],
        formBackend: [
          { required: true, message: '请填写后端服务', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.loadDefinedForms()
  },
  methods: {
    loadDefinedForms() {
      FormApi.loadDefinedForms().then(data => {
        this.tableData = data
      })
    },
    addClick(isshow) {
      this.isAdd = true
      this.dialogAddVisible = isshow
      this.addParam = {
        formDisplay: '',
        formName: '',
        formService: '',
        formBackend: '',
        disabled: '0',
        visibleActions: ''
      }
    },
    deleteClick(formName, formKey) {
      this.$confirm(`是否确认删除 “${formName}”?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        FormApi.deleteDefinedForm(formKey).then(res => {
          this.loadDefinedForms()
          this.$notify.success('删除成功')
        }).catch(e => {
          this.$notify.success('删除失败')
        })
      })
    },
    disabledClick(state, formName) {
      this.$confirm(`是否确认${state == null || state ? '禁用' : '启用'}表单?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        FormApi.disableDefinedForm(formName).then(res => {
          this.loadDefinedForms()
          this.$notify.success(`${state == null || state ? '禁用' : '启用'}成功`)
        }).catch(e => {
          this.$notify.success(`${state == null || state ? '禁用' : '启用'}失败`)
        })
      })
    },
    updataClick(obj) {
      var newObj = JSON.parse(JSON.stringify(obj))
      if (newObj.disabled === null) {
        newObj.disabled = '0'
      } else {
        newObj.disabled = newObj.disabled.toString()
      }
      this.isAdd = false
      this.addParam = newObj
      this.dialogAddVisible = true
    },
    submitForm(fname) {
      this.$refs[fname].validate(valid => {
        if (valid) {
          this.$confirm(`是否确认保存?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            var loadObj = Loading.service({
              fullscreen: true,
              text: '保存中…',
              background: 'rgba(0, 0, 0, 0.1)'
            })
            var result = this.isAdd
              ? FormApi.addDefinedForm(this.addParam)
              : FormApi.updateDefinedForm(this.addParam)
            result.then(res => {
              this.loadDefinedForms()
              this.dialogAddVisible = false
              this.$notify.success('保存成功')
            }).finally(() => {
              loadObj.close()
            })
          })
        }
      })
    }
  }
}
</script>
<style scoped lang='scss'>
.adoptColor {
  color: rgb(0, 209, 178);
}
.unAdoptColor {
  color: red;
}
</style>
