<template>
  <div class="sidebar">
    <el-menu
      text-color="#303133"
      active-text-color="#1989FA"
      :collapse="$store.state.uiControl.isFold"
      :default-active="$store.state.uiControl.currentMenu.index"
      class="el-menu-demo"
      mode="vertical"
      unique-opened
      @select="handleSelect"
    >
      <slot v-for="(item, idx) in $store.state.uiControl.sidebars">
        <el-menu-item v-if="!item.children" :index="idx + ''">
          <i :class="'iconfont '+item.icon" />
          <span>{{ item.name }}</span>
        </el-menu-item>
        <el-submenu v-if="item.children" :index="idx + ''">
          <template slot="title">
            <i :class="'iconfont '+item.icon" :style="$store.state.uiControl.isFold ? 'opacity:0;' : 'opacity:1;'" />
            <span>{{ item.name }}</span>
            <!-- <span @click="handleSelect(item.path)">{{ item.title }}</span> -->
          </template>
          <!-- <el-menu-item
            v-for="(subitem, subidx) in item.children"
            :key="subidx"
            :index="idx + '-' + subidx"
          >
            <a :href="urlFormatter(subitem)" @click.prevent>{{ subitem.name }}</a>
          </el-menu-item> -->
          <slot v-for="(subitem, subidx) in item.children">
            <a
              v-if="subitem.openType !== 'window'"
              :key="idx + '-' + subidx "
              :href="urlFormatter(subitem)"
              :target="subitem.openType === 'external' ? '_blank' : '_self'"
            >
              <el-menu-item :index="idx + '-' + subidx">{{ subitem.name }}  </el-menu-item>
            </a>
            <el-menu-item v-else :index="idx + '-' + subidx">
              <span @click="handleNavMenuItem(subitem)"> {{ subitem.name }} </span>
            </el-menu-item>
          </slot>
        </el-submenu>
      </slot>
    </el-menu>
  </div>
</template>
<script>

export default {
  methods: {
    handleSelect(e) {
      var navIdx = localStorage.getItem('nav-item')
      if (!navIdx) {
        localStorage.setItem('nav-item', '0-0')
      }
      this.$store.dispatch('uiControl/currentMenu', e)
    },
    handleNavMenuItem(e) {
      // window 暂时只有Window中打开一种选项

      window.$openIframeDialog({
        'title': e.name,
        'src': e.path
      })
    },
    urlFormatter(subitem) {
      var url = subitem.path
      var ret = url

      switch (subitem.openType) {
        case 'external': // 外链新窗口
          ret = url
          break
        case 'window': // 外链弹窗打开
          ret = url
          break
        default:
          ret = '#' + url
          break
      }
      return ret
    }
  }
}
</script>
<style lang="scss">
.sidebar {
  height: 100vh;
  background-color: #fff;

  .el-submenu__title i {
    margin-right: 5px;
  }

  .el-submenu .el-menu-item {
    margin-left: 10px;
  }

  .el-menu-demo.el-menu {
    border-right: none;
    top:60px;
  }

  .el-submenu [class^="el-icon-"] {
    font-size: 24px;
  }
}
</style>
