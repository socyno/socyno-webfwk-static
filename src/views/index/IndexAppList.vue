<template>
  <div class="index-app-list">
    <div class="tabbar">
      <el-radio-group v-model="selectedTab" size="small" @change="handleTabSwitch">
        <el-radio-button label="focus">
          关注应用
        </el-radio-button>
        <el-radio-button label="all">
          我的应用
        </el-radio-button>
      </el-radio-group>
      <el-form size="small" :inline="true" :model="form">
        <el-form-item>
          <el-input v-model="form.namelike" placeholder="关键字" class="input-with-select" />
        </el-form-item>

        <el-form-item>
          <el-select
            v-model="form.subsystemId"
            filterable
            remote
            clearable
            reserve-keyword
            placeholder="选择子系统"
            :remote-method="remoteMethod"
            :loading="loading"
          >
            <el-option
              v-for="item in subsystems"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="form.type" placeholder="应用类型" clearable>
            <el-option v-for="(key,value) in $enums.get('ApplicationType')" :key="key" :label="key" :value="value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="form.codeLevel" placeholder="代码等级" clearable>
            <el-option v-for="(key,value) in $enums.get('ApplicationCodeLevel')" :key="key" :label="key" :value="value" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button icon="el-icon-search" type="primary" @click="loadData(selectedTab)" />
        </el-form-item>
      </el-form>
    </div>
    <div v-for="(item,key) in followData" :key="key" class="item">
      <!-- <div class="l level" :class="getLevel(item.codeLevel).bg">
        <img :src="'https://www.gravatar.com/avatar/' + getIcon(item.name)" alt="" srcset="">
      </div> -->
      <div class="l name">
        <div class="pname">
          <span v-if="item.type" class="atype">{{ $enums.getDisplayOrValue('ApplicationType', item.type) }}</span>
          <span class="link">
            <router-link :to="{path:'app/' + item.id, params: {app_id: item.id}}">
              {{ item.subsystemName }} / <span class="Summary">{{ item.name }}</span>
            </router-link>
          </span>
          <!-- <span class="branch" :class="item.releaseBranch!=='refs/heads/master'?'urgent':''">{{ item.releaseBranch }}</span> -->
          <el-tooltip effect="dark" :content="'仓库类型: ' + item.vcsType" placement="left-start">
            <el-button type="text" style="color: #666;" :class=" item.vcsType === 'Gitlab' ? 'app-row-icon iconfont icongit' : 'app-row-icon iconfont iconsvn'" />
          </el-tooltip>
          <el-tooltip effect="dark" :content="'分支: ' + item.releaseBranch" placement="left-start">
            <el-button type="text" :style="(item.releaseBranch !== 'refs/heads/master' && item.releaseBranch !== 'trunk' )?'color:indianred;':'color:#666;'" class="iconfont iconfork app-row-icon" />
          </el-tooltip>
          <el-tooltip effect="dark" :content="'代码等级: ' + getLevel(item.codeLevel).l" placement="left-start">
            <el-button type="text" :class="'iconfont iconpriority app-row-icon ' + getLevel(item.codeLevel).bg" />
          </el-tooltip>
          <el-tooltip v-if="item.type == 'application'" effect="dark" placement="left-start">
            <div slot="content">
              <div>部署节点信息: </div>
              <!-- eslint-disable -->
              <div v-html="getEnvCount(item.deployNamespaceSummaries)" />
            </div>
            <el-button type="text" style="color:#666;" :class="'el-icon-s-data app-row-icon ' + getLevel(item.codeLevel).bg" />
          </el-tooltip>
        </div>
        <div class="cname">
          {{ item.description }}
        </div>
      </div>
      <div class="r option">
        <div class="collect">
          <FavoriteButton :is-fav="item.bookmarked" :app-id="item.id" icononly style="padding-right:15px;" />
        </div>
        <div class="state">
          {{ $enums.getDisplayOrValue('ApplicationState', item.state) }}
        </div>
      </div>
    </div>
    <div v-if="!followData.length" class="common-nodata" style="padding-bottom:10%;">
      暂无数据
    </div>
    <BasePagination
      v-model="page"
      :options="page"
      :total="total"
      class="pagination"
      @change="changePage"
    />
  </div>
</template>
<script>
import { getVisibleAppList, getSubsystemOptions } from '@/apis/application/index'
import FavoriteButton from '@/components/FavoriteButton'
import BasePagination from '@/components/BasePagination'

export default {
  components: {
    BasePagination,
    FavoriteButton
  },
  data() {
    return {
      followData: [],
      form: {},
      loading: false,
      selectedTab: 'focus',
      subsystems: [],
      page: {
        limit: 10,
        page: 1
      },
      total: 0
    }
  },
  mounted() {
    this.loadData(this.selectedTab, true)
  },
  methods: {
    loadData(key, isInit) {
      var params = this.form

      Object.assign(params, this.page)
      switch (key) {
        case 'focus':
          params.bookmarked = true
          break
        case 'all':
          params.bookmarked = false
          break
      }

      getVisibleAppList(params).then(item => {
        this.followData = item.data.list
        this.total = item.data.total
        if (isInit) {
          if (!this.followData || !this.followData.length) {
            this.selectedTab = 'all'
            this.loadData('all')
          }
        }
      })
    },
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true
        getSubsystemOptions(query).then(res => {
          this.loading = false
          this.subsystems = res.data
        })
      } else {
        this.subsystems = []
      }
    },
    handleTabSwitch(key) {
      this.form = {}
      this.page = {
        limit: 10,
        page: 1
      }
      this.loadData(key)
    },
    changePage() {
      this.loadData()
    },
    getEnvCount(envs) {
      if (!envs || envs.length <= 0) {
        return '无'
      }
      var str = ''
      for (const key in envs) {
        if (envs.hasOwnProperty(key)) {
          const element = envs[key]
          str += '<br>' + element.envDisplay +
                 ': 部署 ' + element.replicas +
                 ' 个节点，涉及 ' + element.clusterTotal +
                 ' 个集群、' + element.namespaceTotal + ' 个机组'
        }
      }
      return str
    },
    getLevel(level) {
      if (level === '30:blue') {
        return { l: '蓝色', bg: 'bgblue' }
      } else if (level === '20:yellow') {
        return { l: '黄色', bg: 'bgyellow' }
      } else {
        return { l: '红色', bg: 'bgred' }
      }
    }
  }
}
</script>
<style lang="scss">
.index-app-list {
  .tabbar {

    .el-radio-group {
      margin-right: auto;
    }
  }

  .app-row-icon {
    margin-left: 5px;
    font-size: 16px;
    position: relative;
    top: 1px;
  }
}
</style>
