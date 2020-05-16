<template>
  <div class="application-detail-files">
    <el-card v-if="app">
      <div class="files-top">
        <div class="files-top-l">
          <el-input v-model="value" style="width:300px;" readonly size="small" placeholder="请输入内容">
            <el-button slot="append" size="small" icon="el-icon-more" @click="showPickBranch = true" />
          </el-input>
        </div>
        <div class="titles">
          <span class="t1" @click="handleName">{{ app.name }}</span>
          <slot v-for="(path, pathidx) in currentPath">
            <span :key="pathidx" class="t2"> / </span>
            <span :key="path" class="t3" @click="handlePath(pathidx)">{{ path }}</span>
          </slot>
        </div>
        <el-radio-group v-model="switchSelect" size="small" style="width:320px;">
          <el-radio-button label="0">
            代码管理
          </el-radio-button>
          <el-radio-button label="1">
            变更记录
          </el-radio-button>
          <el-radio-button label="2">
            分支管理
          </el-radio-button>
          <el-radio-button label="3">
            部署环境
          </el-radio-button>
          <!-- <el-radio-button label="4">
            应用统计
          </el-radio-button> -->
        </el-radio-group>
      </div>
      <div class="files-container">
        <ApplicationDetialFilesTree v-if="switchSelect === '0'" ref="filetree" v-model="currentPath" :app="app" :branch="value" />
        <CodeCommitHistory v-if="switchSelect === '1'" :branch="value" />
        <BranchesList v-if="switchSelect === '2'" :app="app" />
        <AppStatus v-if="switchSelect === '3'" :app="app" />
        <AppEnvCount v-if="switchSelect === '4'" />
      </div>
    </el-card>
    <el-dialog :visible.sync="showPickBranch" append-to-body>
      <BranchesList select :app="app" @click="handleBranchSelected" />
    </el-dialog>
  </div>
</template>
<script>
import ApplicationDetialFilesTree from './ApplicationDetialFilesTree'
import CodeCommitHistory from './CodeCommitHistory'
import BranchesList from './BranchesList'
import AppStatus from './AppStatus'
import AppEnvCount from './AppEnvCount'
import { getAllBranches } from '@/apis/application/index'
export default {
  components: {
    ApplicationDetialFilesTree,
    CodeCommitHistory,
    BranchesList,
    AppStatus,
    AppEnvCount
  },
  props: {
    app: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      options: [
      ],
      value: '',
      switchSelect: '0',
      currentPath: [],
      historyData: [],
      showPickBranch: false
    }
  },
  mounted() {
    getAllBranches(this.$route.params.app_id).then(res => {
      this.options = res.data
      this.value = res.data[0].name
    })
  },
  methods: {
    handleName() {
      this.currentPath = []
      this.$refs.filetree.reloadDir('', this.value)
    },
    handlePath(idx) {
      this.currentPath = this.currentPath.slice(0, idx + 1)
      this.$refs.filetree.reloadDir(this.currentPath.join('/'), this.value)
    },
    handleBranchSelected(branch) {
      this.currentPath = []
      this.value = branch
      this.switchSelect = '0'
      this.$forceUpdate()
      this.showPickBranch = false
    }
  }
}
</script>
<style lang="scss">
.application-detail-files {
  margin-top: 20px;
  .files-top {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .files-top-l {
      display: flex;
      align-items: center;
      margin-bottom: 20px;

    }
      .titles {
        margin-left: 20px;
        font-size: 14px;
        flex: 1;
        align-self: flex-start;
        padding-top: 7px;
        .t1 {

          //  color: #000;
          cursor: pointer;
        }

        .t2 {
          color: $greytext;
          padding: 0 5px;
        }

        .t3 {
          cursor: pointer;
        }
      }
  }
}
</style>
