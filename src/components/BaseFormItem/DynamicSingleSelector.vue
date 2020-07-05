<template>
  <div class="dynamic-single-selector">
    <el-select
      v-model="value"
      size="mini"
      :placeholder="'可输入关键词进行动态筛选'"
      :clearable="true"
      :filterable="true"
      :loading="loading"
      :remote="true"
      :remote-method="onQueryApply"
      value-key="optionValue"
      @clear="onClear"
      @change="onChange"
      @focus="onFocus"
    >
      <slot v-for="(opt, optidx) in selectedOptions">
        <div
          v-if="opt.optionGroup && opt.optionGroup != 'null:null' && opt.optionGroup !== (selectedOptions[optidx - 1] ? selectedOptions[optidx - 1].optionGroup : '' )"
          :key="optidx + 1000"
          class="common-option-group"
        >
          {{ opt.optionGroup }}
        </div>
        <el-option
          v-if="optionWillBeSelectable(opt)"
          :key="optidx"
          :label="opt.optionDisplay"
          :value="opt"
        >
          <span style="float: left">{{ opt.optionDisplay }}</span>
          <!-- <span style="float: right; color: #8492a6; font-size: 13px">{{ opt.optionValue }}</span> -->
        </el-option>
      </slot>
    </el-select>
  </div>
</template>
<script>
import tool from '@/utils/tools'
import FormApi from '@/apis/formApi'

export default {
  model: {
    event: 'change'
  },
  props: {
    formId: {
      type: [String, Number],
      default: null
    },
    formName: {
      type: String,
      required: true
    },
    fieldModel: {
      type: Object,
      required: true
    },
    parentFieldModels: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      value: null,
      loading: false,
      formApi: null,
      selectedOptions: []
    }
  },
  watch: {
    formName: {
      immediate: true,
      handler(formName) {
        if (tool.isBlank(formName)) {
          this.formApi = null
          return
        }
        this.formApi = new FormApi(formName)
      }
    },
    fieldModel: {
      immediate: true,
      handler(fieldModel) {
        this.value = null
        this.selectedOptions = []
        // console.log('sdddddddddd', fieldModel.value)
        if (fieldModel) {
          if (tool.isString(fieldModel.value)) {
            fieldModel.value = { optionValue: fieldModel.value, optionDisplay: fieldModel.value }
          }
          if (tool.isPlainObject(fieldModel.value)) {
            this.setCurrentOptions([fieldModel.value])
            this.value = fieldModel.value
          }
        }
      }
    }
  },
  methods: {
    /**
     * 是否隐藏选项，在多选场景下过滤已选择项
     * @param {Object} option
     */
    optionWillBeSelectable(option) {
      if (!this.fieldModel.value) {
        return true
      }
      if (this.fieldModel.type !== 'array') {
        return true
      }
      return tool.inArray(option, this.fieldModel.value, function(a, b) {
        return a && a.optionValue === b.optionValue
      }) < 0
    },
    /**
     * 可选列表数据查询
     */
    onQueryApply(keyword) {
      // console.log('动态可选项简单检索参数如下：', keyword)
      if (!this.formApi) {
        throw new Error('当前的表单还未设置，请确认流程单上下文正确设置')
      }
      var params = {}
      // console.log('动态下拉选项查询：父表单模型 - ', this.parentFieldModels)
      if (this.parentFieldModels && tool.isArray(this.parentFieldModels)) {
        for (const field of this.parentFieldModels) {
          params[field.key] = field.value
        }
      }
      this.loading = true
      this.formApi.loadFormFieldOptionsWithQuery(
        this.fieldModel.fieldTypeKey,
        keyword,
        this.formId,
        params
      ).then((res) => {
        this.setCurrentOptions(res.data)
        // console.log('动态可选项简单检索结果如下', res.data)
      }).finally(() => {
        this.loading = false
      })
    },
    /**
     * 动态注入当前的下拉菜单可选项，为确保当前选中的项目被添加进来。
     * 多选的场景下仅用于选择，因此无需考虑当前的选择值。
     * @param {Array} options
     */
    setCurrentOptions(options) {
      if (!tool.isArray(options)) {
        return
      }
      if (this.fieldModel.type === 'array') {
        this.selectedOptions = options
        return
      }
      var preSelectedIndx = -1
      var preOptions = this.selectedOptions
      if (this.value) {
        preSelectedIndx = tool.inArray(this.value, preOptions, function(a, b) {
          return a.optionValue === b.optionValue
        })
      }
      var selected = preSelectedIndx >= 0 ? preOptions[preSelectedIndx] : null
      this.selectedOptions = selected ? [selected] : []
      for (const option of options) {
        if (!option) {
          continue
        }
        if (selected && selected.optionValue === option.optionValue) {
          continue
        }
        this.selectedOptions.push(option)
      }
    },
    onChange(value) {
      this.$emit('change', value)
      this.$forceUpdate()
    },
    onClear() {
      this.$emit('change', null)
      this.$forceUpdate()
    },
    onFocus() {
      this.onQueryApply('')
    }
  }
}
</script>
<style lang="scss">
.dynamic-single-selector {

}
</style>
