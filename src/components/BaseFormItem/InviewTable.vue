<template>
  <div class="inview-table">
    <div v-if="canEdit" class="addnew-view">
      <DynamicSelect
        v-model="newValue"
        :item="deepCopy(data)"
        :filter="true"
        :state="false"
        :columns="sortedColumns"
        @change="onAddnew"
      />
      <!-- <el-button class="addnew-btn" size="mini" type="primary" @click="">
        新增
      </el-button> -->
    </div>
    <el-table :key="tableKey" :data="dupPrepareData[data.key] ? dupPrepareData[data.key] : []" style="width: 100%">
      <slot v-for="(item,idx) in sortedColumns">
        <el-table-column v-if="item.template" v-show="item.position && item.position >= 0" :key="idx" :label="item.title" :prop="item.key">
          <template slot-scope="scope">
            <TemplateConfig :template="item.template" :options="item" :data="dupPrepareData[data.key][scope.$index]" />
          </template>
        </el-table-column>
        <el-table-column v-else v-show="item.position && item.position >= 0" :key="idx" :formatter="columnFmt" :label="item.title" :prop="item.key" />
      </slot>
      <el-table-column v-if="canEdit" label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="danger"
            @click="onDelete(scope.$index, scope.row)"
          >
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
export default {
  components: { DynamicSelect, TemplateConfig },
  props: {
    data: {
      type: [Object, String],
      default: null,
      required: true
    },
    prepareData: {
      type: Object,
      default: function() {
        return {}
      },
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
      dupPrepareData: {},
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
        var temp = []
        var properties = n.items.properties
        n.value = ''
        for (const key in properties) {
          if (properties.hasOwnProperty(key)) {
            const element = properties[key]

            if (element.position === undefined || element.position === null || element.position < 0) {
              continue
            }
            element.key = key
            temp.push(element)
          }
        }

        temp.sort((a, b) => {
          return a.position - b.position
        })

        this.sortedColumns = temp
      }
    },
    prepareData: {
      immediate: true,
      handler(newv) {
        if (newv) {
          var tempDupData = JSON.parse(JSON.stringify(newv))
          if (this.dupPrepareData[this.data.key] && this.canEdit) {
            tempDupData[this.data.key] = this.dupPrepareData[this.data.key]
          }

          this.dupPrepareData = tempDupData
        }
      }
    }
  },
  mounted() {
    this.filterPostData()
  },
  methods: {
    columnFmt(row, column, cellValue, index) {
      var ret = ''
      var item = this.data.items.properties[column.property]
      if (cellValue == null || !item) return ''
      switch (item.fieldType) {
        case 'Simple':
        case 'String':
          if (item.fieldOptionsType === 'NULL') {
            ret = cellValue
          } else if (item.fieldOptionsType === 'DYNAMIC') {
            // 动态取?
          } else {
            // 取静态值

            for (const iterator of item.staticOptions) {
              if (iterator.value === cellValue.toString()) {
                ret = iterator.display
                break
              }
            }
          }
          break

        case 'TableView':
          if (item.type === 'array') {
            ret = cellValue.map(item => {
              return item.display || item.optionDisplay
            }).toString()
          } else if (item.type === 'object') {
            ret = cellValue.display || cellValue.optionDisplay
          }
          break

        default:
          break
      }
      return ret.length ? ret : cellValue
    },
    deepCopy(data) {
      return JSON.parse(JSON.stringify(data))
    },
    onAddnew() {
      if (!Object.keys(this.newValue).length) {
        return
      }
      if (this.dupPrepareData[this.data.key]) {
        this.dupPrepareData[this.data.key].push(this.newValue)
      } else {
        this.dupPrepareData[this.data.key] = [this.newValue]
      }
      this.$forceUpdate()
      this.filterPostData()
    },
    onDelete(e, row) {
      this.dupPrepareData[this.data.key].splice(e, 1)
      this.filterPostData()
    },
    filterPostData() {
      var object = this.dupPrepareData[this.data.key]
      var postData = []
      if (this.data.listItemCreationFormClass) {
        postData = object
      } else {
        for (const key in object) {
          if (object.hasOwnProperty(key)) {
            const element = object[key]
            postData.push(element.optionValue)
          }
        }
      }
      this.$emit('input', postData.length === 0 ? [] : postData)
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
