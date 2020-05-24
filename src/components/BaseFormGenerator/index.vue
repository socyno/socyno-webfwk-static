<template>
  <div class="form-generator">
    <el-form
      ref="ruleForm"
      :size="type != 'submit' ? 'mini' : 'medium'"
      :inline="type != 'submit' ? true : false"
      label-suffix=": "
      :model="formInline"
      :label-width="type != 'submit' ? '120px' : '150px'"
    >
      <slot v-for="(item, idx) in queryData">
        <!-- 详情页面下如果是tableview && array 则过滤掉readonly -->
        <el-form-item
          v-show="type !== 'submit' && idx >= itemsCntByRow ? ! fieldsWillFold : !item.readonly || (item.comType === 'tableView' && item.type === 'array')"
          :key="idx"
          :class="item.required ? 'is-required' : ''"
          :label="item.title"
          :prop="item.key"
        >
          <el-input
            v-if="item.comType === 'input'"
            v-model="item.value"
            :placeholder="'请输入' + item.title"
            @keyup.enter.native="onSubmit"
            @input="$forceUpdate()"
          />

          <el-input
            v-if="item.comType === 'areaText'"
            v-model="item.value"
            type="textarea"
            :placeholder="'请输入' + item.title"
            @input="$forceUpdate()"
          />

          <el-input
            v-if="item.comType === 'password'"
            v-model="item.value"
            type="password"
            :placeholder="'请输入' + item.title"
            @input="$forceUpdate()"
          />

          <el-select
            v-if="item.comType === 'select'"
            v-model="item.value"
            :placeholder="'请选择' + item.title"
            :clearable="type === 'submit'"
            :multiple="item.type === 'array'"
            @change="$forceUpdate()"
          >
            <el-option v-if="type !== 'submit'" :key="-1" :label="'全部'" value="" />
            <slot v-for="(opt,optidx) in item.staticOptions">
              <div v-if="opt.group && (optidx >= 1 ? item.staticOptions[optidx - 1].group != opt.group : true)" :key="optidx + 1000" class="common-option-group">
                {{ opt.optionGroup || opt.group }}
              </div>
              <el-option :key="optidx" :label="opt.display" :value="opt.value" />
            </slot>
          </el-select>

          <el-checkbox-group v-if="item.comType === 'checkbox'" v-model="item.value" @change="$forceUpdate()">
            <el-checkbox v-for="(opt, optidx) in item.staticOptions" :key="optidx" :label="opt.optionValue" :value="opt.optionValue">
              {{ opt.optionDisplay }}
            </el-checkbox>
          </el-checkbox-group>

          <el-switch
            v-if="item.comType === 'switch'"
            v-model="item.value"
            @change="$forceUpdate()"
          />

          <el-date-picker
            v-if="item.comType === 'DateOnly'"
            v-model="item.value"
            placeholder="请选择日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            type="date"
            @input="$forceUpdate()"
          />

          <el-date-picker
            v-if="item.comType === 'DateTime'"
            v-model="item.value"
            placeholder="请选择日期"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="datetime"
            @input="$forceUpdate()"
          />

          <el-time-picker
            v-if="item.comType === 'TimeOnly'"
            v-model="item.value"
            placeholder="请选择时间"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            @input="$forceUpdate()"
          />

          <FormUploader
            v-if="item.comType === 'file'"
            v-model="item.value"
            has-table
            :item="item"
            :files="getDefaultValue(item)"
          />
          <InviewTable
            v-if="item.comType === 'tableview'"
            v-model="item.value"
            :can-edit="!item.readonly"
            :data="item"
            :prepare-data="defaultData"
          />
          <DynamicSelect
            v-if="item.comType === 'dynamicSelect'"
            v-model="item.value"
            :field-model="item"
            :query-data="queryData"
          />
        </el-form-item>
        <el-form-item v-show="type === 'submit' && item.readonly && !(item.comType === 'tableview' && item.type === 'array')" :label="item.title">
          {{ item.textDisplay }}
        </el-form-item>
      </slot>

      <el-form-item v-if="formClass.eventFormType === 'EDIT' || type != 'submit'" class="btns">
        <el-button type="primary" :loading="isSubmitLoading" @click="onSubmit">
          {{ type != 'submit' ? '查询' : '提交' }}
        </el-button>
        <el-button type="info" @click="onReset">
          {{ type != 'submit' ? '重置' : '取消' }}
        </el-button>
        <!-- 作为筛选表单用途时，如果长度超过 4， 则有收起和展开的功能 -->
        <el-button v-if="type != 'submit' && queryData.length > itemsCntByRow" type="text" @click="fieldsWillFold = !fieldsWillFold">
          {{ fieldsWillFold ? '展开' : '收起' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import DynamicSelect from '../BaseFormItem/DynamicSelect'
import InviewTable from '../BaseFormItem/InviewTable'
import FormUploader from '../BaseFormItem/FormUploader'
import tool from '@/utils/tools'
import * as formUtil from '@/utils/formUtils'
export default {
  name: 'BaseFormGenerator',
  components: {
    DynamicSelect,
    InviewTable,
    FormUploader
  },
  props: {
    /**
     * 视图模型
     */
    formClass: {
      type: Object,
      default: function() {
        return {}
      },
      required: true
    },
    /**
     * 查询或是提交（filter || submit）
     */
    type: {
      type: String,
      default: 'filter',
      required: false
    },
    /**
     * 初始化数据
     */
    defaultData: {
      type: Object,
      default: function() {
        return {}
      }
    },
    isSubmitLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formInline: {},
      queryData: [],
      itemsCntByRow: 3,
      fieldsWillFold: true
    }
  },
  watch: {
    formClass: {
      immediate: true,
      handler(clazz) {
        if (!clazz || !clazz.type || !clazz.properties) {
          return
        }
        this.queryData = tool.jsonCopy(formUtil.getSortedVisibleColumns(clazz))
      }
    },
    defaultData: {
      immediate: true,
      handler(data) {
        for (const field of this.queryData) {
          field.value = this.getDefaultValue(field)
          field.textDisplay = formUtil.getFieldValueDisplay(field, field.value)
        }
        console.log('操作或查询视图界面元数据（queryData）如下：')
        console.log(this.queryData)
      }
    }
  },
  mounted() {
    function getCountByWidth() {
      return Math.round(window.innerWidth / 450)
    }
    if (this.type !== 'submit') {
      this.itemsCntByRow = getCountByWidth()

      const that = this
      window.onresize = function(event) {
        that.itemsCntByRow = getCountByWidth()
      }
    }
  },
  methods: {
    getDefaultValue(fieldDefinition) {
      var value = null
      var fieldKey = fieldDefinition.key
      if (this.defaultData && this.defaultData.hasOwnProperty(fieldKey)) {
        value = this.defaultData[fieldKey]
      }
      var fieldType = fieldDefinition.type
      if (fieldType === 'boolean') {
        return !value ? false : value
      }
      if (fieldType === 'array') {
        return value || []
      }
      if (fieldType === 'object') {
        return value || {}
      }
      return tool.stringify(value)
    },
    onReset() {
      this.$emit('cancle')
    },
    onSubmit() {
      var validation = function(item) {
        if (tool.isBlank(item.value)) {
          return false
        }
        return true
      }

      var form = {}
      for (const item of this.queryData) {
        if (this.type === 'submit') {
          if (item.required) {
            if (!validation(item)) {
              this.$message.error('字段（' + item.title + '）不能为空')
              return
            }
          }
        }
        form[item.key] = item.value
      }
      this.$emit('input', form)
    }
  }
}
</script>
<style lang='scss'>
.form-generator {
    background-color: #fff;
    padding: 2px 5px;
    padding-top: 18px;
    .btns {
      margin-left: 10px;
    }
    .el-select,
    .el-input,
    .el-range-editor--mini.el-input__inner {
      width: 200px;
    }
  }

  .el-dialog {
    .form-generator {
    align-items: center;

    .el-select,
    .el-input,
    .el-textarea,
    .el-range-editor--mini.el-input__inner {
      width: 490px;
    }

    .el-upload-list {
      width: 365px;
    }
}
}
</style>
