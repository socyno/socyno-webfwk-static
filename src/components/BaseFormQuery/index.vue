<template>
  <div class="form-query-filter">
    <BaseFormContent
      v-if="queryModel"
      ref="queryForm"
      :editable="true"
      :form-id="formId"
      :form-name="formName"
      :show-only-first-line="showOnlyFirstLine"
      :form-model="queryModel.formClass"
      :parent-field-models="parentFieldModels"
    />
    <div class="form-query-buttons">
      <el-button v-if="!showOnlyFirstLine" type="text" size="mini" @click="showOnlyFirstLine = true">
        收起更多字段
      </el-button>
      <el-button v-else type="text" size="mini" @click="showOnlyFirstLine = false">
        展开更多字段
      </el-button>
      <el-button type="primary" size="mini" @click="onFormSubmitOrQuery">
        查询
      </el-button>
      <!-- 由于后端状态机V1版本的兼容性问题，无法显示多查询的中文名，暂隐藏该功能 -->
      <el-select v-show="queryModels && queryModels.length < -1" v-model="selected" size="mini" :clearable="false" :multiple="false">
        <slot v-for="(query, queryIdx) in queryModels">
          <el-option :key="queryIdx" :label="query.display" :value="queryIdx" />
        </slot>
      </el-select>
    </div>
  </div>
</template>
<script>
import tool from '@/utils/tools'
export default {
  name: 'BaseFormQuery',
  components: {
    BaseFormContent: () => import('../BaseFormContent')
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
    /**
     * 可用查询模型清单
     */
    queryModels: {
      type: Array,
      required: true
    },
    parentFieldModels: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      selected: 0,
      queryModel: null,
      showOnlyFirstLine: true
    }
  },
  watch: {
    selected: {
      // immediate: true,
      handler(selected) {
        if (!this.queryModels) {
          return
        }
        // console.log('当前选择查询为 ：', selected)
        this.queryModel = this.queryModels[selected]
        // console.log('当前选择查询为 ：', this.queryModel)
        this.onSelectedChanged(this.queryModel)
      }
    },
    queryModels: {
      immediate: true,
      handler(queries) {
        if (tool.isUndefOrNull(this.selected) || this.selected < 0 || this.selected >= queries.length) {
          this.selected = 0
          return
        }
        this.queryModel = queries[this.selected]
        this.onSelectedChanged(this.queryModel)
      }
    }
  },
  methods: {
    /**
     * 表单的查询或提交操作
     */
    onFormSubmitOrQuery() {
      var params
      if (!(params = this.$refs.queryForm.getFormValidData())) {
        return
      }
      this.$emit('input', params)
    },
    /**
     * 切换查询时的回调
     */
    onSelectedChanged(queryModel) {
      // console.log('查询发生变化', selected)
      this.$emit('change', queryModel)
    }
  }
}
</script>
<style lang="scss">
.form-query-filter {
  background-color: #fff;
  color: #222;
  display: block;
  .form-query-buttons {
    margin-left: 135px;
  }
}
</style>
