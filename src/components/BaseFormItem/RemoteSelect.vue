<template>
  <el-select
    v-model="obj.value"
    :placeholder="obj.title"
    :filterable="true"
    :loading="loading"
    automatic-dropdown
    :remote="true"
    :remote-method="filterRemoteMethod"
    value-key="optionValue"
    :clearable="obj.type !== 'array'"
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
        :value="obj.type === 'array' ? opt : opt.optionValue"
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
    obj: {
      type: Object,
      default: null,
      loading: false
    }
  },
  data() {
    return {
      dynamicFilterFormClass: null,
      filterOptions: [],
      api: {},
      loading: false
    }
  },
  watch: {
    obj: {
      immediate: true,
      handler(newv) {
        if (!newv) return
        this.api = new FormApi(this.$route.params.form_name || this.$route.query.formName)
        this.filterRemoteMethod(' ')
      }
    }
  },
  methods: {
    filterRemoteMethod(query) {
      if (query !== '') {
        this.loading = true

        this.api.loadFormFieldOptionsWithQuery(this.obj.fieldTypeKey, query, this.$route.query.formId).then(res => {
          if (!res.data) return
          this.filterOptions = res.data
          this.loading = false
        }).catch(res => {
          this.loading = false
        })
      } else {
        this.options = []
      }
    }
  }
}
</script>
