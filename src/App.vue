<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
// import tool from '@/utils/tools'
import store from '@/store/index'
import { info } from '@/apis/common'
export default {
  components: {

  },
  created() {
    this.$store.dispatch('user/initUserInfo')
  },
  mounted() {
    // window.$versionConvertByNum = function(num) {
    //   var version = tool.stringify(num)
    //   if (!version.match(/^\d+$/)) {
    //     return num
    //   }
    //   version = tool.leftPad(version, 16, 0)
    //   var startIndex = version.length - 12
    //   return [
    //     version.slice(0, startIndex),
    //     version.slice(startIndex, startIndex + 4),
    //     version.slice(startIndex + 4, startIndex + 8),
    //     version.slice(startIndex + 8, startIndex + 12)
    //   ].map(tool.parseInteger).join('.')
    // }
  },
  methods: {
    loadSystemInfo() {
      info().then(res => {
        if (!res.data.initialized) {
          store.dispatch('user/sysInitialize')
          return
        }
      })
    }
  }
}
</script>
<style lang="scss">
html {
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
}
html, body, #fullheight {
    min-height: 100% !important;
    height: 100%;
}

a {
  all: unset;
}
.clearfix:after {
  visibility: hidden;
  display: block;
  font-size: 0;
  content: " ";
  clear: both;
  height: 0;
}

* {
  outline: none;
}

table {
  width: 100% !important;
}
thead tr th {
  background: #f5f7fa !important;
  line-height: 27px !important;
}
.el-table {
  td,
  th {
    padding: 6px 0 !important;
    text-align: center !important;
  }
  .cell {
    line-height: 20px;
  }
  td.el-table__expanded-cell {
    text-align: left !important;
  }
}

.userRwcord {
  .el-dialog {
    width: 100%;
    max-width: 850px;
  }
}

.clear_hid{
  overflow: hidden;
}
.l{
  float: left;
}
.r{
  float: right;
}
</style>
