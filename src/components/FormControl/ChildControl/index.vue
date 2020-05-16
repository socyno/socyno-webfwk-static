<template>
  <span v-if="disabled" :disabled="disabled">{{ resource[vkey] }}</span>
  <el-input v-else-if="type==='textarea'" v-model="resource[vkey]" :disabled="disabled" :placeholder="'请输入'+placeholder" type="textarea" :rows="3" />
  <el-input v-else-if="type==='integer'" v-model="resource[vkey]" :disabled="disabled" :placeholder="'请输入'+placeholder" type="number" />
  <el-input v-else-if="type==='password'" v-model="resource[vkey]" :disabled="disabled" :placeholder="'请输入'+placeholder" type="password" />
  <el-input v-else-if="type==='input'" v-model="resource[vkey]" :disabled="disabled" :placeholder="'请输入'+placeholder" />
  <el-select v-else-if="type==='select'" v-model="resource[vkey]" :disabled="disabled" :placeholder="'请选择'+placeholder">
    <el-option v-for="op in options" :key="op.value" :label="op.display" :value="op.value" />
  </el-select>
  <el-time-picker v-else-if="type==='time'" v-model="resource[vkey]" :disabled="disabled" :placeholder="'请选择'+placeholder" />
  <el-date-picker v-else-if="type==='date'" v-model="resource[vkey]" :disabled="disabled" type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" :placeholder="'请选择'+placeholder" />
  <el-date-picker v-else-if="type==='datetime'" v-model="resource[vkey]" :disabled="disabled" type="datetime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" :placeholder="'请选择'+placeholder" />
  <el-date-picker v-else-if="type==='daterange'" v-model="resource[vkey]" :disabled="disabled" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd" value-format="yyyy-MM-dd" />

  <ProductLineSelect v-else-if="type==='productline'" v-model="resource[vkey]" @change="productLineOnchage" />
  <SystemSelect v-else-if="type==='system'" v-model="resource[vkey]" :productline-id="seletedProductLine" />
  <SystemCascader v-else-if="type==='cascaderSystem'" v-model="resource[vkey]" />
  <InviewTable v-else-if="type==='tableView'" :data="item" :prepare-data="resource[vkey]" />
  <DynamicSelect v-else-if="type==='dynamicSelect'" v-model="resource[vkey]" :fieldkey="item.fieldTypeKey" :filter="false" :state="type==='FormState'" />
</template>
<script>
import ProductLineSelect from '../../BaseFormItem/ProductLineSelect'
import SystemSelect from '../../BaseFormItem/SystemSelect'
import SystemCascader from '../../BaseFormItem/SystemCascader'
import DynamicSelect from '../../BaseFormItem/DynamicSelect'
import InviewTable from '../../BaseFormItem/InviewTable'
export default {
  components: {
    ProductLineSelect,
    SystemSelect,
    SystemCascader,
    DynamicSelect,
    InviewTable
  },
  props: {
    type: {
      type: String,
      default: 'input',
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    resource: {
      type: Object,
      default: null
    },
    vkey: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: null
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  methods: {
    productLineOnchage(e) {
      this.seletedProductLine = e
    }
  }
}
</script>
<style lang="scss">

</style>
