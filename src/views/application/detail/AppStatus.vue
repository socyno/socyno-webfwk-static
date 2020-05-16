<template>
  <div class="app-detail-status">
    <el-radio-group v-model="switchSelect" size="small" style="width:320px;" @change="switchChanged">
      <el-radio-button v-for="(item, index) in switches" :key="index" :label="item.optionValue">
        {{ item.optionDisplay }}
      </el-radio-button>
    </el-radio-group>
    <BaseFormDetailGenerator v-if="columns" :columns="columns.formClass" :detail-data="columns.form" />
  </div>
</template>
<script>
import { getAppEnv, getAppState } from '@/apis/application/index'
import BaseFormDetailGenerator from '@/components/BaseFormDetailGenerator'
export default {
  components: {
    BaseFormDetailGenerator
  },
  props: {
    app: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      switchSelect: '',
      switches: [],
      columns: null
    }
  },
  mounted() {
    getAppEnv(this.app.id).then(res => {
      if (!res.data.length) {
        return
      }
      this.switches = res.data
      this.switchSelect = res.data[0].optionValue
      getAppState(this.app.id, this.switchSelect).then(res => {
        this.columns = res.data
      })
    })
  },
  methods: {
    switchChanged() {
      getAppState(this.app.id, this.switchSelect).then(res => {
        this.columns = res.data
      })
    }
  }
}
</script>
<style lang='scss'>
.app-detail-status {
    .el-radio-group {
        margin-bottom: 10px;
  }
}

</style>
