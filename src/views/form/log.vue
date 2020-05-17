<template>
  <div class="form-log">
    <!-- <el-page-header class="common-page-header" :content="headerPrefix + '日志'" @back="handleBack" /> -->
    <el-table v-loading="loading" :data="tableData" border>
      <el-table-column label="操作时间" prop="operateTime" />
      <el-table-column label="操作人姓名" prop="operateUserDisplay" />
      <el-table-column label="操作类型" prop="operateType" />
      <el-table-column label="操作备注" prop="operateDesc" />
      <el-table-column label="操作" width="80">
        <template slot-scope="scope">
          <el-button v-if="scope.row.operateDetailId" type="text" size="small" @click="operateClick(scope.row.operateDetailId)">
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog class="imagelogdiv" title="操作日志" :modal-append-to-body="false" :visible.sync="dialogLogVisible">
      <div class="bjt">
        <label style="float:left;">修改前：</label>
        <label style="float:right;">修改后：</label>
      </div>
      <div id="viewLog" />
    </el-dialog>
  </div>
</template>
<script>
import { Loading } from 'element-ui'
import { getLogs, getLogsDetail } from '@/apis/formControl/index'
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/merge/merge.js'
import 'codemirror/addon/merge/merge.css'
import DiffMatchPatch from 'diff-match-patch'
window.diff_match_patch = DiffMatchPatch
window.DIFF_DELETE = -1
window.DIFF_INSERT = 1
window.DIFF_EQUAL = 0
export default {
  data() {
    return {
      formId: this.$route.query.formId,
      formName: this.$route.query.formName,
      tableData: null,
      loading: true,
      dialogLogVisible: false,
      headerPrefix: ''
    }
  },
  mounted() {
    this.getLogsInit()
  },
  methods: {
    handleBack() {
      window.close()
    },
    getLogsInit() {
      getLogs(this.formName, this.formId).then(res => {
        this.loading = false
        this.tableData = res.data
      })
    },
    operateClick(id) {
      var loadObj = Loading.service({
        fullscreen: true,
        text: '请求中…',
        background: 'rgba(0, 0, 0, 0.1)'
      })
      this.dialogLogVisible = true
      getLogsDetail(this.formName, this.formId, id).then(res => {
        loadObj.close()
        const target = document.getElementById('viewLog')
        target.innerHTML = ''
        CodeMirror.MergeView(target, {
          value: res.data.operateBefore || '', // 上次内容
          origLeft: null,
          orig: res.data.operateAfter || '', // 本次内容
          lineNumbers: true, // 显示行号
          mode: 'text/html',
          highlightDifferences: true,
          connect: 'align',
          readOnly: true // 只读 不可修改
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.bjt {
    overflow: hidden;
    margin-top: -30px;
    border-top:1px solid #eee;
    padding: 10px 38% 10px 0;
    font-size: 16px;
    color: #aaa;
  }
</style>
<style lang='scss'>
.el-dialog__header{
  border-bottom: 1px solid #ddd;
}

.imagelogdiv .el-dialog {
  width: 80% !important;
}
</style>
