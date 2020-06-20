<template>
  <div>
    <div class="tabbar">
      <el-radio-group v-model="selectedTab" size="small" @change="handlePageChange">
        <el-radio-button label="todo">
          待处理
        </el-radio-button>
        <!-- <el-radio-button label="closed">
          已审批
        </el-radio-button>
        <el-radio-button label="applied">
          已发起
        </el-radio-button> -->
      </el-radio-group>
    </div>
    <div v-loading="loading" class="index-todo-list">
      <BaseInfoRow v-for="(item, index) in items" :key="index" :title="item.title" :time="item.createdAt" @click="handleRow(item)" />
      <div v-if="!items.length" class="common-nodata" style="padding-bottom:10%;">
        暂无数据
      </div>
    </div>
    <BasePagination
      v-show="selectedTab != 'todo'"
      v-model="page"
      :options="page"
      :total="total"
      class="pagination"
      @change="loadData"
    />
    <el-dialog
      :title="clickedRow.title || '审批'"
      append-to-body
      :visible.sync="dialogVisible"
      width="85%"
      @close="loadData"
    >
      <iframe class="html-iframe" style="height:60vh;" :src="applyExternalUrl" frameborder="0" width="100%" height="60vh" @load="iframeLoaded" />
    </el-dialog>
  </div>
</template>
<style>

</style>
<script>
import BaseInfoRow from '@/components/BaseInfoRow'
import { getTodoList, getTodoListClosed, getTodoListCreated } from '@/apis/common'
import BasePagination from '@/components/BasePagination'

export default {
  components: {
    BaseInfoRow,
    BasePagination
  },
  data() {
    return {
      items: [],
      selectedTab: 'todo',
      total: 0,
      page: {
        limit: 10,
        page: 1
      },
      loading: false,
      applyExternalUrl: '',
      clickedRow: {},
      dialogVisible: false
    }
  },
  mounted() {
    this.loadData(true)
  },
  methods: {
    iframeLoaded() {
      var that = this
      var myFrame = document.getElementsByClassName('html-iframe')[0]
      myFrame.contentWindow.closeParentLayerModel = function() {
        that.dialogVisible = false
        that.loadData()
      }
    },
    handlePageChange() {
      this.page = {
        limit: 10,
        page: 1
      }
      this.loadData()
    },
    loadData(isInit) {
      this.loading = true
      if (this.selectedTab === 'applied') {
        getTodoListCreated(this.page).then(res => {
          this.items = res.data.list
          this.total = res.data.total
          this.loading = false
        }).catch(res => {
          this.loading = false
        })
      } else if (this.selectedTab === 'closed') {
        getTodoListClosed(this.page).then(res => {
          this.items = res.data.list
          this.total = res.data.total
          this.loading = false
        }).catch(res => {
          this.loading = false
        })
      } else {
        getTodoList().then(res => {
          this.items = res.data
          this.total = res.data.length
          this.loading = false
        }).catch(res => {
          this.loading = false
        })
      }
    },
    handleRow(row) {
      this.clickedRow = row
      this.applyExternalUrl = row.targetPage.trim()
      this.dialogVisible = true
    }
  }
}
</script>
