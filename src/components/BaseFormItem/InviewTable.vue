<template>
  <div class="inview-table">
    <div v-if="canEdit" class="addnew-view">
      <DynamicSelect v-model="newValue" :field-model="data" :columns="sortedColumns" @change="addToValuesData" />
    </div>
    <el-table :key="tableKey" :data="prepareData[data.key]" style="width: 100%">
      <slot v-for="(item,idx) in sortedColumns">
        <el-table-column v-if="item.template" v-show="item.position && item.position >= 0" :key="idx" :label="item.title" :prop="item.key">
          <template slot-scope="scope">
            <TemplateConfig :template="item.template" :options="item" :data="prepareData[data.key][scope.$index]" />
          </template>
        </el-table-column>
        <el-table-column v-else v-show="item.position && item.position >= 0" :key="idx" :formatter="columnFormatter" :label="item.title" :prop="item.key" />
      </slot>
      <el-table-column v-if="canEdit" label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" @click="delFromValuesData(scope.$index, scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import TemplateConfig from './TemplateConfig'
import DynamicSelect from './DynamicSelect'
import { getFieldValueDisplay, getSortedVisibleColumns } from '@/utils/formUtils'
export default {
  components: {
    DynamicSelect,
    TemplateConfig
  },
  props: {
    data: {
      type: [Object, String],
      default: null,
      required: true
    },
    prepareData: {
      type: Object,
      required: true
    },
    canEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      sortedColumns: [],
      newValue: null,
      tableKey: 0
    }
  },
  watch: {
    data: {
      immediate: true,
      handler(n) {
        if (!n) {
          return
        }
        this.sortedColumns = getSortedVisibleColumns(n.items)
      }
    }
  },
  created() {
    if (!this.prepareData[this.data.key]) {
      this.prepareData[this.data.key] = []
    }
  },
  mounted() {
    this.processPostData()
  },
  methods: {
    columnFormatter(row, column, cellValue, index) {
      return getFieldValueDisplay(this.data.items.properties[column.property], cellValue)
    },
    /**
     * 添加新的值
     */
    addToValuesData() {
      console.log('添加新的值(字段 = ' + this.data.key + ')')
      console.log(this.newValue)
      if (!Object.keys(this.newValue).length) {
        return
      }
      console.log('当前的值数组(字段 = ' + this.data.key + ')')
      console.log(this.prepareData[this.data.key])
      if (!this.$jian.tool.isArray(this.prepareData[this.data.key])) {
        this.prepareData[this.data.key] = []
      }
      this.prepareData[this.data.key].push(this.newValue)
      console.log('更新后的值数组(字段 = ' + this.data.key + ')')
      console.log(this.prepareData[this.data.key])
      // this.$forceUpdate()
      this.processPostData()
    },
    /**
     * 移除现有的值
     */
    delFromValuesData(e, row) {
      this.prepareData[this.data.key].splice(e, 1)
      // this.$forceUpdate()
      this.processPostData()
    },
    /**
     * 将选中的对象列表转换为可上传数据
     */
    processPostData() {
      var postData = []
      if (this.$jian.tool.isArray(this.prepareData[this.data.key])) {
        postData = this.$jian.tool.jsonCopy(this.prepareData[this.data.key])
      }
      if (!this.data.listItemCreationFormClass) {
        for (var i = 0; i < postData.length; i++) {
          postData[i] = postData[i].optionValue
        }
      }
      this.$emit('input', postData)
    }
  }
}
</script>
<style lang="scss">
.inview-table {
  .el-table .cell {
    line-height: 36px;
  }
}

.addnew-view {
  display: flex;
  margin-bottom: 5px;

  .addnew-btn {
    margin-left: 10px;
  }
}
</style>
