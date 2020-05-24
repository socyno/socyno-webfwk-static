<template>
  <div class="dynamic-filter-form">
    <div class="prefilter">
      <slot v-for="(field, index) in dynamicData">
        <RemoteSelect
          v-if="field.fieldOptionsType === 'DYNAMIC'"
          :field-model="field"
        />
        <el-select
          v-else-if="field.fieldOptionsType === 'STATIC'"
          v-model="field.value"
          :placeholder="field.title + (field.required ? '(必填)' : '')"
          :clearable="true"
          :multiple="field.type === 'array'"
          @change="$forceUpdate()"
        >
          <slot v-for="(opt,optidx) in field.staticOptions">
            <div
              v-if="opt.group"
              :key="optidx + 1000"
              class="common-option-group"
            >
              {{ opt.optionGroup }}
            </div>
            <el-option :key="optidx" :label="opt.display" :value="opt.value" />
          </slot>
        </el-select>
        <el-input
          v-else
          :key="index"
          v-model="field.value"
          :placeholder="field.title + (field.required ? '(必填)' : '')"
          @input="$forceUpdate()"
        />
      </slot>
      <el-button :loading="loading" type="primary" @click="handleQuery">
        查 询
      </el-button>
      <el-button v-if="item.enum && item.enum.includes('FreeWritable')" type="primary" @click="handleCustomItem">
        自定义选项
      </el-button>
    </div>
    <el-table
      ref="filterTable"
      :data="tableData"
      style="width: 100%; margin-top:10px;"
      :highlight-current-row="item.type !== 'array'"
      @current-change="handleSingleSelectionChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="item.type === 'array'" type="selection" width="105" />
      <slot v-for="(col,idx) in columns">
        <el-table-column v-if="col.template" v-show="col.position && col.position >= 0" :key="idx" :label="col.title" :prop="col.key">
          <template slot-scope="scope">
            <TemplateConfig :template="col.template" :options="col" :data="dupPrepareData[data.key][scope.$index]" />
          </template>
        </el-table-column>
        <el-table-column v-else v-show="col.position && col.position >= 0" :key="idx" :label="col.title" :prop="col.key" />
      </slot>

      <el-table-column v-if="!columns" prop="optionDisplay" label="请选择查询结果" />
    </el-table>
    <span slot="footer" class="footer">
      <el-button @click="$emit('cancle')">取 消</el-button>
      <el-button type="primary" @click="$emit('submit')">确 定</el-button>
    </span>
  </div>
</template>
<script>
import FormApi from '@/apis/formApi'
import RemoteSelect from './RemoteSelect'
export default {
  components: {
    RemoteSelect
  },
  props: {
    dynamicFilterFormClass: {
      type: Object,
      default: null
    },
    item: {
      type: Object,
      default: null
    },
    columns: {
      type: Array,
      default: null,
      required: false
    }
  },
  data() {
    return {
      loading: false,
      tableData: [],
      dynamicData: [],
      api: {},
      multipleSelection: []
    }
  },
  mounted() {
    this.api = new FormApi(
      this.$route.params.form_name || this.$route.query.formName
    )

    var arrayData = []

    for (const key in this.dynamicFilterFormClass.properties) {
      var item = this.dynamicFilterFormClass.properties[key]
      if (item.position && item.position > 0) {
        item.key = key
        arrayData.push(item)
      }
    }

    arrayData.sort((a, b) => { // 排序
      return a.position - b.position
    })

    this.dynamicData = arrayData
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.$emit('input', val)
    },
    handleSingleSelectionChange(val) {
      this.multipleSelection = [val]
      this.$emit('input', [val])
    },
    handleCustomItem() {
      this.$prompt('请输入名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        var customOpt = {
          optionDisplay: value,
          optionValue: value
        }
        this.tableData = [customOpt]
        this.$refs.filterTable.setCurrentRow(customOpt)
      }).catch(() => {

      })
    },
    handleQuery() {
      var queryData = {}

      if (this.dynamicData) {
        for (const key in this.dynamicData) {
          var item = this.dynamicData[key]
          queryData[item.key] = item.value
        }
      }
      this.loading = true
      this.api.loadFormFieldOptionsWithQuery(this.item.fieldTypeKey, '', this.$route.query.formId, queryData).then(res => {
        if (!res.data) return
        this.tableData = res.data
        this.loading = false
      }).catch(res => {
        this.loading = false
      })
    }
  }
}
</script>
<style lang="scss">
.dynamic-filter-form {
// .el-table__body tr.current-row>td {
//   background-color: seagreen;
// }
}

.prefilter {
    .footer{
     margin-left: auto;
    }
}
</style>
