<template>
  <div>
    <div>
      <el-select
        v-model="value"
        filterable
        remote
        reserve-keyword
        placeholder="请输入关键词选择应用"
        :remote-method="remoteMethod"
        :loading="loading"
      >
        <el-option
          v-for="item in list"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-button @click="handleSyncVirtualAppInfo">
        syncVirtualAppInfo
      </el-button>
      <el-button @click="handleSyncAppK8sInfo">
        syncAppK8sInfo
      </el-button>
    </div>
    <el-divider />
    <div>
      <el-button @click="handleSyncVirtualMachineAllAppInfo">
        syncVirtualMachineAllAppInfo
      </el-button>
      <el-button @click="handleSyncAllAppK8sInfo">
        syncAllAppK8sInfo
      </el-button>
    </div>
  </div>
</template>
<script>
import { getAppOptions } from '@/apis/application'
import { syncVirtualAppInfo, syncVirtualMachineAllAppInfo, syncAppK8sInfo, syncAllAppK8sInfo } from '@/apis/devapi'
export default {
  data() {
    return {
      value: [],
      list: [],
      loading: false

    }
  },
  mounted() {
  },
  methods: {
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true
        getAppOptions(query).then(res => {
          this.loading = false
          this.list = res.data
        })
      } else {
        this.list = []
      }
    },
    handleSyncVirtualAppInfo() {
      syncVirtualAppInfo(this.value).then(res => {
        this.$message.success('请求发送成功')
      })
    },
    handleSyncVirtualMachineAllAppInfo() {
      syncVirtualMachineAllAppInfo().then(res => {
        this.$message.success('请求发送成功')
      })
    },
    handleSyncAppK8sInfo() {
      syncAppK8sInfo(this.value).then(res => {
        this.$message.success('请求发送成功')
      })
    },
    handleSyncAllAppK8sInfo() {
      syncAllAppK8sInfo().then(res => {
        this.$message.success('请求发送成功')
      })
    }
  }
}
</script>
<style lang="scss">

</style>
