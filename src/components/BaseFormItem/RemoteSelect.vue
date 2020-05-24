<template>
  <el-select
    v-model="fieldModel.value"
    :placeholder="fieldModel.title + (fieldModel.required ? '(必填)' : '')"
    :filterable="true"
    :loading="loading"
    automatic-dropdown
    :remote="true"
    :remote-method="filterRemoteMethod"
    value-key="optionValue"
    :clearable="fieldModel.type !== 'array'"
    @change="$forceUpdate()"
  >
    <slot v-for="(opt,optidx) in filterOptions">
      <div
        v-if="opt.optionGroup && opt.optionGroup != 'null:null' && opt.optionGroup !== (filterOptions[optidx - 1] ? filterOptions[optidx - 1].optionGroup : '' )"
        :key="optidx + 1000"
        class="common-option-group"
      >
        {{ opt.optionGroup }}
      </div>
      <el-option
        :key="optidx"
        :label="opt.optionDisplay"
        :value="fieldModel.type === 'array' ? opt : opt.optionValue"
      >
        <span style="float: left">{{ opt.optionDisplay }}</span>
        <span style="float: right; color: #8492a6; font-size: 13px">{{ opt.optionValue }}</span>
      </el-option>
    </slot>
  </el-select>
</template>
<script>
import FormApi from '@/apis/formApi'
export default {
  props: {
    fieldModel: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      formApi: null,
      loading: false,
      filterOptions: []
    }
  },
  watch: {
    fieldModel: {
      immediate: true,
      handler(newv) {
        if (!newv || this.formApi) {
          return
        }
        this.formApi = new FormApi(this.$route.params.form_name || this.$route.query.formName)
        this.filterRemoteMethod()
      }
    }
  },
  methods: {
    filterRemoteMethod(query) {
      this.loading = true
      this.formApi.loadFormFieldOptionsWithQuery(this.fieldModel.fieldTypeKey, query, this.$route.query.formId).then(res => {
        this.filterOptions = res.data || []
      }).finally(res => {
        this.loading = false
      })
    }
  }
}
</script>
