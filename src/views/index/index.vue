<template>
  <div class="home fit-container">
    <div class="head">
      <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
        <el-menu-item v-for="item in tabs" :key="item.key" :index="item.key">
          {{ item.title }}
        </el-menu-item>
      </el-menu>
    </div>
    <div class="content">
      <div v-if="activeIndex==='app'">
        <IndexAppList />
      </div>
      <div v-else-if="activeIndex==='commits'">
        <AppSourceChanges />
      </div>
      <div v-else-if="activeIndex==='sys'">
        <IndexSystemList />
      </div>
      <div v-else-if="activeIndex==='todo'">
        <IndexTodoList />
      </div>
    </div>
  </div>
</template>
<script>
import IndexTodoList from './IndexTodoList'
import IndexAppList from './IndexAppList'
import IndexSystemList from './IndexSystemList'
import AppSourceChanges from '../application/detail/AppSourceChanges'
export default {
  components: {
    IndexTodoList,
    AppSourceChanges,
    IndexAppList,
    IndexSystemList
  },
  data() {
    return {
      activeIndex: 'sys',
      tabs: [
        {
          key: 'sys',
          title: '业务系统'
        },
        {
          key: 'todo',
          title: '我的待办'
        },
        {
          key: 'app',
          title: '我的应用'
        },
        {
          key: 'commits',
          title: '我的变更集'
        }

      ]
    }
  },
  watch: {
    '$route'(to, form) {
      if (to.query.tab !== this.activeIndex) {
        this.resetTab()
      }
    }
  },
  mounted() {
    this.resetTab()
  },
  methods: {
    resetTab() {
      if (this.$route.query.tab) {
        if (this.tabs.some(e => e.key === this.$route.query.tab)) {
          this.activeIndex = this.$route.query.tab
        } else {
          this.activeIndex = this.tabs[0].key
        }
      }
    },
    handleSelect(key, keyPath) {
      this.activeIndex = key.toString()

      location.href = this.updateQueryStringParameter(location.href, 'tab', key)
    },
    updateQueryStringParameter(uri, key, value) {
      var re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i')
      var separator = uri.indexOf('?') !== -1 ? '&' : '?'
      if (uri.match(re)) {
        return uri.replace(re, '$1' + key + '=' + value + '$2')
      } else {
        return uri + separator + key + '=' + value
      }
    }
  }
}
</script>
<style lang="scss" >
.home .tabbar {
      padding: 20px;
      display: flex;
      justify-content: flex-start;
    }
.home{
    background: #fff;
    position: relative;
    padding-bottom: 20px;
    .head{
        position: relative;
        overflow: hidden;
        .search{
            position: absolute;
            right: 80px;
            top: 10px;
        }
    }
    .content{
        position: relative;
        .group{
            padding: 10px 30px;
            background-color: #fafafa;
            border-bottom: 1px solid #eee;
            border-top: 1px solid #eee;
            font-size: 14px;
        }
        .item{
            position: relative;
            overflow: hidden;
            padding: 15px 20px;
            color: #212529;
            border-bottom: 1px solid #eee;
            .level{
                width: 35px;
                height: 35px;
                border-radius: 20px;
                text-align: center;
                line-height: 35px;
                color: #fff;
            }
            .bgred{
                color: red;
            }
            .bgblue{
                color: #409EFF;
            }
            .bgyellow{
                color: #FFD700;
            }
            .urgent{
                border: 1px solid red !important;
                color: indianred !important;
            }
            .name{
                margin-left: 20px;
                .pname{
                    color: #2e2e2e;
                    font-size: 14px;
                    .branch{
                        border: 1px solid #e5e5e5;
                        border-radius: 10px;
                        display: inline-block;
                        padding: 2px 8px;
                        color: #707070;
                        margin-left: 10px;
                    }
                    .link{
                        cursor: pointer;
                        :hover{
                            text-decoration: underline;
                        }
                    }

                    .atype{
                        font-weight: bold;
                        display: inline-block;
                        background-color: #ddd;
                        margin-right: 6px;
                        color: #909399;
                        padding: 1px 8px;
                    }
                }
                .cname{
                    font-size: 14px;
                    max-width: 900px;
                    margin: 0px 5px 0;
                }
                .Summary{
                    color: #2e2e2e;
                    font-weight: bold;
                    padding-bottom: 10px;
                    cursor: pointer;
                    margin-right: 10px;
                    :hover{
                        text-decoration: underline;
                    }
                }
                .uname{
                    color:#212529;
                    font-size: 14px
                }
                .owner{
                    font-size: 14px;
                    margin-top: 4px;
                    .us{
                        margin-right: 10px;
                    }
                }
            }
            .option{
                text-align: right;
                position: absolute;
                top: 50%;
                right: 0;
                transform: translate(0, -50%);
                margin-right: 30px;
                .state{
                    text-align: right;
                    font-size: 14px;
                    color: #707070;
                }
                ::-webkit-scrollbar {display:none;}
                .version{
                    width: 180px;
                    height: 20px;
                    position: relative;
                    .vys {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        overflow-x: scroll;
                        scrollbar-width: none;
                    }
                }
                .collect{
                    cursor: pointer;
                    font-size: 12px;
                }

            }

        }
    }
    .noItem{
        padding: 30px;
        font-size: 16px;
        color: #2e2e2e;
    }

}
.pagination{
    margin: 40px 0 0 20px;
}
</style>
