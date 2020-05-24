<template>
  <div class="dynamic-select">
    <el-dialog class="dynamic-filter-dialog" title="选择" :visible.sync="showFormDialog" width="80%" height="600px" append-to-body>
      <DynamicFilterForm
        v-if="dynamicFilterFormClass"
        v-model="performData"
        :dynamic-filter-form-class="dynamicFilterFormClass"
        :item="fieldModel"
        :columns="columns"
        @submit="handleAdded"
        @cancle="showFormDialog = false"
      />
      <BaseFormGenerator
        v-if="listItemCreationFormClass"
        v-model="performData"
        type="submit"
        :form-class="listItemCreationFormClass"
        @input="handleAdded"
        @cancle="showFormDialog = false"
      />
    </el-dialog>

    <div v-if="dynamicFilterFormClass || listItemCreationFormClass">
      <el-button type="primary" size="mini" @click="showFormDialog = true">
        {{ dynamicFilterFormClass ? '选择' : '添加' }}
      </el-button>
      <span v-if="fieldModel.type === 'string' || fieldModel.type === 'object'"> {{ fieldModel.value.optionDisplay }}</span>
    </div>
    <el-select
      v-else
      v-model="value"
      :placeholder="'可输入关键词进行筛选'"
      :filterable="true"
      :loading="loading"
      :remote="true"
      :remote-method="remoteOptionsLoading"
      value-key="optionValue"
      :clearable="fieldModel.type !== 'array'"
      @clear="onSimpleSelectClear"
      @change="onSimpleSelectChange"
      @focus="onSimpleSelectFocus"
    >
      <slot v-for="(opt,optidx) in options">
        <div
          v-if="opt.optionGroup && opt.optionGroup != 'null:null' && opt.optionGroup !== (options[optidx - 1] ? options[optidx - 1].optionGroup : '' )"
          :key="optidx + 1000"
          class="common-option-group"
        >
          {{ opt.optionGroup }}
        </div>
        <el-option
          v-if="optionIsSelectable(opt.optionValue)"
          :key="optidx"
          :label="opt.optionDisplay"
          :value="fieldModel.type === 'array' ? opt : opt.optionValue"
        >
          <span style="float: left">{{ opt.optionDisplay }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">{{ opt.optionValue }}</span>
        </el-option>
      </slot>
    </el-select>
  </div>
</template>
<script>
import FormApi from '@/apis/formApi'
import BaseFormGenerator from '../BaseFormGenerator'
import DynamicFilterForm from './DynamicFilterForm'
import * as formUtil from '@/utils/formUtils.js'

export default {
  components: {
    DynamicFilterForm,
    BaseFormGenerator
  },
  model: {
    event: 'change'
  },
  props: {
    fieldModel: {
      type: Object,
      default: null,
      required: true
    },
    columns: {
      type: Array,
      default: null,
      required: false
    },
    queryData: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      value: null,
      options: [],
      loading: false,
      api: {},
      currentKey: null,
      dynamicFilterFormClass: null,
      listItemCreationFormClass: null,
      showFormDialog: false,
      performData: []
    }
  },
  watch: {
    fieldModel: {
      immediate: true,
      handler(newv) {
        if (!newv) {
          return
        }
        console.log('字段定义发生变化：')
        console.log(newv)
        if (!newv['__initialized']) {
          newv['__initialized'] = true
          if (newv.type === 'object') {
            if (newv.value) {
              this.options.push(newv.value)
              this.value = newv.value.optionValue
            }
          }
          if (newv.dynamicFilterFormClass) {
            this.dynamicFilterFormClass = formUtil.parseFormClass(newv.dynamicFilterFormClass)
          }
          if (newv.listItemCreationFormClass) {
            this.listItemCreationFormClass = formUtil.parseFormClass(newv.listItemCreationFormClass)
            this.listItemCreationFormClass.eventFormType = 'EDIT'
          }
        }
      }
    }
  },
  created() {
    this.formApi = new FormApi(
      this.$route.params.form_name || this.$route.query.formName
    )
  },
  methods: {
    optionIsSelectable(optValue) {
      if (this.fieldModel.type !== 'array') {
        return true
      }
      // 解决如果可选和已选只有一个的情况被隐藏问题
      if (!this.fieldModel.value || this.options.length === 1) {
        return true
      }
      return this.$jian.tool.inArray(optValue, this.fieldModel.value) < 0
    },
    remoteOptionsLoading(query) {
      var form = {}
      if (this.queryData) {
        for (const item of this.queryData) {
          form[item.key] = item.value
        }
      }
      this.loading = true
      this.formApi.loadFormFieldOptionsWithQuery(this.fieldModel.fieldTypeKey, query, this.$route.query.formId, form).then(res => {
        if (!res.data) return
        this.options = res.data
        this.loading = false
      }).finally(res => {
        this.loading = false
      })
    },
    handleAdded(e) {
      if (typeof this.performData === 'object' && this.listItemCreationFormClass) {
        this.performData = [this.performData]
      }

      this.showFormDialog = false
      for (const o of this.performData) {
        this.onSimpleSelectChange(o)
      }
    },
    onSimpleSelectChange(e) {
      this.$emit('change', e)
      this.$forceUpdate()
    },
    onSimpleSelectClear(e) {
      this.value = null
      this.$forceUpdate()
    },
    onSimpleSelectFocus(e) {
      this.remoteOptionsLoading()
    }
  }
}
</script>
<style lang="scss">
.dynamic-select {

}
 .dynamic-filter-dialog {
   .el-table {
         height: 49vh;
    overflow-y: scroll;
   }
    .prefilter {
    display: flex;
    align-items: center;
    width: 100%;
    .el-select,
    .el-input__inner,
    .el-input {
      width: auto !important;
    }
    }
  }
</style>
