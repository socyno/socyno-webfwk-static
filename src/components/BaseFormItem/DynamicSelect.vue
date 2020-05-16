<template>
  <div class="dynamic-select">
    <el-dialog class="dynamic-filter-dialog" title="选择" :visible.sync="showFormDialog" width="80%" height="600px" append-to-body>
      <DynamicFilterForm
        v-if="dynamicFilterFormClass"
        v-model="performData"
        :dynamic-filter-form-class="dynamicFilterFormClass"
        :item="item"
        :columns="columns"
        @submit="handleAdded"
        @cancle="showFormDialog = false"
      />
      <BaseFormGenerator
        v-if="listItemCreationFormClass"
        v-model="performData"
        type="submit"
        :data="listItemCreationFormClass"
        @input="handleAdded"
        @cancle="showFormDialog = false"
      />
    </el-dialog>

    <div v-if="dynamicFilterFormClass || listItemCreationFormClass">
      <el-button type="primary" size="mini" @click="showFormDialog = true">
        选择
      </el-button>
      <span v-if="item.type === 'string' || item.type === 'object'"> {{ item.value.optionDisplay }}</span>
    </div>
    <el-select
      v-if="!dynamicFilterFormClass && !listItemCreationFormClass"
      v-model="value"
      :placeholder="filter ? '请输入关键词' : '请选择'"
      :filterable="filter"
      :loading="loading"
      :remote="filter"
      :remote-method="remoteMethod"
      value-key="optionValue"
      :clearable="item.type !== 'array'"
      @clear="onClear"
      @change="onChange"
      @focus="onFocus"
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
          v-if="isOptDeselect(opt.optionValue)"
          :key="optidx"
          :label="opt.optionDisplay"
          :value="item.type === 'array' ? opt : opt.optionValue"
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
import DynamicFilterForm from './DynamicFilterForm'

export default {
  components: { DynamicFilterForm, BaseFormGenerator: () => import('../BaseFormGenerator') },
  model: {
    prop: 'selected',
    event: 'change'
  },
  props: {
    selected: {
      type: [Object, String, Array],
      default: null
    },
    item: {
      type: Object,
      default: null,
      required: true
    },
    filter: {
      type: Boolean,
      default: true,
      required: true
    },
    state: {
      type: Boolean,
      default: false,
      required: false
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
    item: {
      immediate: true,
      handler(newv) {
        if (!newv) return
        this.api = new FormApi(
          this.$route.params.form_name || this.$route.query.formName
        )

        var isInit = true

        if (newv.type === 'object') {
          if (newv.prepareData && newv.prepareData.options) {
            this.options.push(newv.prepareData.options)
            isInit = false
          }
        }

        if (newv.dynamicFilterFormClass) {
          this.dynamicFilterFormClass = JSON.parse(newv.dynamicFilterFormClass)
        }

        if (newv.listItemCreationFormClass) {
          this.listItemCreationFormClass = JSON.parse(newv.listItemCreationFormClass)
          this.listItemCreationFormClass.eventFormType = 'EDIT'
        }
        this.value = this.selected
        // if (!this.filter) {
        this.loadData(isInit)
        // }
      }
    }
  },
  methods: {
    isOptDeselect(optValue) {
      if (this.options.length === 1) return true // 解决如果可选和已选只有一个的情况被隐藏问题
      if (!this.item.value) return true
      return !(this.item.value.indexOf(optValue) > -1)
    },
    loadData(isInit) {
      this.loading = true

      var form = {}
      if (this.queryData) {
        for (const item of this.queryData) {
          form[item.key] = item.value
        }
      }
      this.api.loadFormFieldOptionsWithQuery(this.item.fieldTypeKey, '', this.$route.query.formId, form)
        .then(res => {
          this.loading = false
          if (!res.data) return
          if (!isInit) {
            this.options = this.options.concat(res.data)
          } else {
            this.options = res.data
          }
          this.$forceUpdate()
        })
    },
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true
        var form = {}
        if (this.queryData) {
          for (const item of this.queryData) {
            form[item.key] = item.value
          }
        }
        this.api.loadFormFieldOptionsWithQuery(this.item.fieldTypeKey, query, this.$route.query.formId, form).then(res => {
          if (!res.data) return
          this.options = res.data
          this.loading = false
        }).catch(res => {
          this.loading = false
        })
      } else {
        this.options = []
      }
    },
    handleAdded(e) {
      if (typeof this.performData === 'object' && this.listItemCreationFormClass) {
        this.performData = [this.performData]
      }

      this.showFormDialog = false
      for (const o of this.performData) {
        this.onChange(o)
      }
    },
    onChange(e) {
      // console.log(e)
      this.$emit('change', e)
      this.$forceUpdate()
    },
    onClear(e) {
      this.value = null
      this.$forceUpdate()
    },
    onFocus(e) {
      if (this.dynamicFilterFormClass) {
        this.remoteMethod()
      }
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
