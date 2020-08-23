<template>
  <div class="form-change-logs">
    <el-page-header
      class="common-page-header"
      title="关闭"
      :content="formTitle"
      @back="$emit('back')"
    />
    <el-table v-loading="loading" :data="formLogsData" border>
      <el-table-column label="编号" prop="id" />
      <el-table-column label="操作人" prop="operateUserDisplay" />
      <el-table-column label="操作时间" prop="operateTime" />
      <el-table-column label="操作类型" prop="operateType" />
      <el-table-column label="操作说明" prop="operateDesc" />
      <el-table-column label="操作" width="80">
        <template slot-scope="scope">
          <el-button v-if="scope.row.operateDetailId" type="text" size="small" @click="showLogsDetail(scope.row.operateDetailId)">
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-button-group>
      <el-button type="normal" size="small" icon="el-icon-arrow-left" @click="pageLogsLoad('')">
        首页
      </el-button>
      <el-button :disabled="logsPager.page <= 1" type="normal" size="small" icon="el-icon-arrow-left" @click="pageLogsLoad('prev')">
        上一页
      </el-button>
      <el-button :disabled="logsPager.nomore" type="normal" size="small" @click="pageLogsLoad('next')">
        下一页<i class="el-icon-arrow-right el-icon--right" />
      </el-button>
      <el-button type="text" size="small" style="margin-left:10px; font-size:14px; color:#666;">
        当前: 第 {{ logsPager.page }} 页 {{ formLogsData ? formLogsData.length : 0 }} 条
      </el-button>
    </el-button-group>
    <el-dialog class="imagelogdiv" title="操作日志" :modal-append-to-body="false" :visible.sync="detailDialogShow">
      <div class="bjt">
        <label style="float:left;">修改前：</label>
        <label style="float:right;">修改后：</label>
      </div>
      <div id="formActionLogDetailContent" />
    </el-dialog>
  </div>
</template>
<script>
import tool from '@/utils/tools'
import { Loading } from 'element-ui'
import FormApi from '@/apis/formApi'
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
  props: {
    formName: {
      type: String,
      required: true
    },
    formId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      loading: false,
      formApi: null,
      fromIndex: 0,
      formTitle: '',
      formLogsData: null,
      detailDialogShow: false,
      logsPager: {
        page: 1,
        firstLogId: 0,
        lastLogId: 0,
        nomore: false
      }
    }
  },
  watch: {
    fromIndex: {
      handler: function(fromIndex) {
        this.loadFormLogs()
      }
    }
  },
  methods: {
    /**
     * 初始化操作日志数据
     */
    load() {
      this.fromIndex = 0
      this.loadFormLogs()
    },

    /**
     * 设置标题
     */
    setFormTitle() {
      this.formTitle = '变更日志 - ' + tool.leftPad(this.formId, 8, 0)
    },

    /**
     * 加载操作日志数据
     */
    loadFormLogs() {
      this.loading = true
      this.setFormTitle()
      new FormApi(this.formName).loadFormActionLogs(this.formId, this.fromIndex).then(data => {
        if (!data || data.length < 1) {
          this.logsPager.nomore = true
          if (this.fromIndex > 0) {
            this.$message.info('没有更多数据')
          }
          return
        }
        this.logsPager.nomore = false
        this.formLogsData = data
        if (!this.fromIndex) {
          this.logsPager.page = 1
        } else if (this.fromIndex > 0) {
          this.logsPager.page += 1
        } else {
          this.logsPager.page -= 1
        }
        this.logsPager.firstId = this.formLogsData[0].id
        this.logsPager.lastId = this.formLogsData[data.length - 1].id
      }).finally((res) => {
        this.loading = false
      })
    },

    /**
     * 加载操作日志变更详情
     */
    showLogsDetail(detailId) {
      this.detailDialogShow = true
      var loading = Loading.service({
        fullscreen: true,
        text: '请求中…',
        background: 'rgba(0, 0, 0, 0.1)'
      })
      new FormApi(this.formName).loadFormActionLogDetail(this.formId, detailId).then(data => {
        const target = document.getElementById('formActionLogDetailContent')
        target.innerHTML = ''
        CodeMirror.MergeView(target, {
          value: data.operateBefore || '', // 上次内容
          origLeft: null,
          orig: data.operateAfter || '', // 本次内容
          lineNumbers: true, // 显示行号
          mode: 'text/plain',
          highlightDifferences: true,
          connect: 'align',
          readOnly: true // 只读 不可修改
        })
      }).finally((res) => {
        loading.close()
      })
    },

    /**
     * 翻页方向（prev 向前，next 向后，first 首页）
     * @param {String} direction prev / next /first
     */
    pageLogsLoad(direction) {
      if (direction === 'next') {
        this.fromIndex = this.logsPager.lastId
      } else if (direction === 'prev') {
        this.fromIndex = 0 - this.logsPager.firstId
      } else {
        this.fromIndex = 0
      }
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
