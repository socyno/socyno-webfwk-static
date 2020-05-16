<template>
  <el-table :data="files" border>
    <el-table-column label="文件名" prop="name" />
    <el-table-column label="文件大小">
      <template slot-scope="scope">
        {{ scope.row.size }}kb
      </template>
    </el-table-column>
    <el-table-column label="添加人" prop="createdName" />
    <el-table-column label="添加时间" prop="createdAt" />
    <el-table-column label="操作" width="100">
      <template slot-scope="scope">
        <div class="shell">
          <a class="externalLink" :href="getDownUrl(scope.row.id)" target="_blank">
            <el-button type="text" size="small">
              下载
            </el-button>
          </a>
          &nbsp;&nbsp;
          <el-popconfirm
            v-if="canRemoveFile"
            title="确定删除吗？"
            confirm-button-type="danger"
            @onConfirm="operateClick(scope.$index)"
          >
            <el-button slot="reference" type="text" size="small">
              删除
            </el-button>
          </el-popconfirm>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>
<script>
import store from '@/store'
export default {
  props: {
    /**
     * 文件列表
     */
    files: {
      type: Array,
      default: null
    },
    canRemoveFile: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
    }
  },
  methods: {
    getDownUrl(attachementId) {
      return store.getters['user/getBaseApiUrl']() + `form/upload/${this.$route.query.formName || this.$route.params.form_name}/${this.$route.query.formId || this.$route.params.form_id}/${attachementId}/download`
    },
    operateClick(index) {
      this.$emit('delete', index)
    }
  }
}
</script>
<style scoped lang="scss">
.pline {
    .externalLink {
        cursor: pointer;
        color: #409EFF;
        font-size: 13px;
    }
}
</style>
