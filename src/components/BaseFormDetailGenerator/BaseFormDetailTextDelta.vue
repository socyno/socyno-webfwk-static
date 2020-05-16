<template>
  <el-card ref="text-delta" class="text-delta">
    <div slot="header" class="clearfix">
      <span>{{ item.title }}</span>
    </div>
    <div v-for="(o1, k1) in messages" v-show="o1[item.key]" :key="k1">
      <!-- <strong>{{ currentTime() + ' : ' }}</strong> -->
      {{ o1[item.key] }}
    </div>
  </el-card>
</template>
<script>
export default {
  props: {
    item: {
      type: Object,
      default: null
    },
    messages: {
      type: Array,
      required: true
    }
  },
  mounted() {

  },
  updated() {
    var element = this.$refs['text-delta'].$el.children[1]
    element.scrollTop = element.scrollHeight
  },
  methods: {
  }
}
</script>
<style lang="scss">
.text-delta {
.el-card__body {
    padding: 20px;
    height: 350px;
    overflow-y: scroll;
}
  .el-card__body::-webkit-scrollbar {
    display: none;  /* Safari and Crome */
}
}
</style>
