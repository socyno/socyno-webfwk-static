<template>
  <div id="app">
    <router-view />
    <BaseIframeDialog v-model="showBaseIframe" :options="iframeOptions" />
  </div>
</template>
<script>
import { info } from '@/apis/common'
import store from '@/store'
import BaseIframeDialog from '@/components/BaseIframeDialog'
export default {
  components: {
    BaseIframeDialog
  },
  data() {
    return {
      showBaseIframe: false,
      iframeOptions: {}
    }
  },
  created() {
    this.$store.dispatch('user/initUserInfo')
  },
  mounted() {
    this.loadSystemInfo()
    this.initIframeDialog()
    window.$versionConvertByNum = function(num) {
      if (!(num.length >= 17 && num.length <= 32)) return num
      var idx = num.length % 8 || 8
      var res = [
        num.slice(0, idx),
        num.slice(idx, idx + 8),
        num.slice(idx + 8, idx + 8 + 8),
        num.slice(idx + 8 + 8, idx + 8 + 8 + 8)
      ].map(function(i) {
        return Number(i).toString()
      })
      var str = res.toString()
      return str.replace(/,/gi, '.')
    }
  },
  methods: {
    initIframeDialog() {
      var that = this
      window.$openIframeDialog = function(options) {
        that.showBaseIframe = true
        that.iframeOptions = options || {}
      }

      window.$closeIframeDialog = function() {
        that.showBaseIframe = false
      }
    },
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
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  }

  html,
  body,
  #fullheight {
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
  }

  .userRwcord {
    .el-dialog {
      width: 100%;
      max-width: 850px;
    }
  }

  .clear_hid {
    overflow: hidden;
  }

  .l {
    float: left;
  }

  .r {
    float: right;
  }
</style>
