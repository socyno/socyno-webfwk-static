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
        <el-form-item v-show="type !== 'submit' && idx >= itemsCntByRow ? !isFold : !item.readonly || (item.comType === 'tableView' && item.type === 'array')" :key="idx" :class="item.isRequired ? 'is-required' : ''" :label="item.title" :prop="item.key">
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

          <FormUploader v-if="item.comType === 'file'" v-model="item.value" :item="item" :files="item.value" />
          <div v-if="item.comType === 'fileList'">
            <FormUploader v-model="item.value" :item="item" has-table :files="defaultData[item.key]" />
          </div>

          <ProductLineSelect v-if="item.comType === 'productline'" v-model="item.value" @change="productLineOnchage" />
          <SystemSelect v-if="item.comType === 'system'" v-model="item.value" :productline-id="seletedProductLine" />
          <SystemCascader v-if="item.comType === 'cascaderSystem'" v-model="item.value" />
          <InviewTable v-if="item.comType === 'tableView'" v-model="item.value" :can-edit="!item.readonly" :data="item" :prepare-data="mergedPrepareData()" />
          <DynamicSelect
            v-if="item.comType === 'dynamicSelect'"
            v-model="item.value"
            :item="item"
            :filter="item.fieldType !== 'FormState'"
            :state="item.fieldType === 'FormState'"
            :query-data="queryData"
          />
        </el-form-item>
        <el-form-item v-if="defaultData" v-show="type === 'submit' && item.readonly && !(item.comType === 'tableView' && item.type === 'array')" :label="item.title">
          {{ item.key === 'state' ? data.prepareData[item.key] : defaultData[item.key] }}
        </el-form-item>
      </slot>

      <el-form-item v-if="data.eventFormType === 'EDIT' || type != 'submit'" class="btns">
        <el-button type="primary" :loading="isSubmitLoading" @click="onSubmit">
          {{ type != 'submit' ? '查询' : '确认' }}
        </el-button>
        <el-button type="info" @click="onReset">
          {{ type != 'submit' ? '重置' : '取消' }}
        </el-button>
        <el-button v-if="queryData.length >= 4 && type != 'submit'" type="text" @click="isFold = !isFold">
          {{ isFold ? '展开' : '收起' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import DynamicSelect from '../BaseFormItem/DynamicSelect'
import InviewTable from '../BaseFormItem/InviewTable'
import FormUploader from '../BaseFormItem/FormUploader'
export default {
  name: 'BaseFormGenerator',
  components: {
    DynamicSelect,
    InviewTable,
    FormUploader
  },
  props: {
    /**
     * json parse过的formClass
     */
    data: {
      type: Object,
      default: null,
      required: true
    },
    /**
     * 用来区分是filter还是submit排版
     */
    type: { // filter | submit
      type: String,
      default: 'filter',
      required: false
    },
    /**
     * 用来取detail中的值
     */
    defaultData: {
      type: Object,
      default: null
    },
    isSubmitLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isFold: true,
      seletedProductLine: null,
      formInline: {},
      queryData: [],
      fileList: [],
      fileResultData: {},
      itemsCntByRow: 3
    }
  },
  watch: {
    data: {
      immediate: true,
      handler(query) {
        if (!query || !query.type) {
          return
        }
        var tempArr = []
        for (const key in query.properties) {
          var item = query.properties[key]
          // console.log('获取到的界面字段定义如下：' + key + ' => ')
          // console.log(item)
          if (!item.position || item.position <= 0) {
            continue
          }
          switch (item.fieldType) {
            case '':
            case 'simple':
            case 'string':
            case 'textline':
              if (item.fieldOptionsType === 'STATIC') {
                if (item.type === 'array' && item.staticOptions && item.staticOptions.length) {
                  item.comType = 'checkbox'
                } else {
                  item.comType = 'select'
                }
              } else if (item.fieldOptionsType === 'DYNAMIC') {
                item.comType = 'dynamicSelect'
              } else if (item.type === 'boolean') {
                item.comType = 'switch'
              } else {
                item.comType = 'input'
              }
              break
            case 'password':
              item.comType = 'password'
              break
            case 'text': // 长文本
              item.comType = 'areaText'
              break
            case 'file': // 文件上传
              item.comType = 'file'
              break
            case 'tableview':
              if (item.type === 'array') {
                if (item.staticOptions && item.staticOptions.length) {
                  item.comType = 'checkbox'
                } else {
                  item.comType = 'tableView'
                }
              } else {
                item.comType = 'dynamicSelect'
              }
              break
            case 'dateonly':
              item.comType = 'DateOnly'
              break
            case 'datetime':
              item.comType = 'DateTime'
              break
            case 'timeonly':
              item.comType = 'TimeOnly'
              break
            default:
              break
          }

          item.key = key
          item.value = this.getDefaultValue(item)

          if (query.required && query.required.length) { // 必填字段
            for (const requiredKey of query.required) {
              if (item.key === requiredKey) {
                item.isRequired = true
              }
            }
          }
          tempArr.push(item)
        }

        tempArr.sort((a, b) => { // 排序
          return a.position - b.position
        })

        this.queryData = tempArr
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
    mergedPrepareData() {
      if (this.data.prepareData && this.defaultData) {
        var ret = {}
        Object.assign(ret, this.defaultData)
        Object.assign(ret, this.data.prepareData)
        return ret
      } else {
        return (this.data.prepareData || this.defaultData) || {}
      }
    },
    getDefaultValue(item) {
      var value = null
      // if (item.readonly && item.isRequired !== true) {
      //   return value
      // }

      var prepareData = {}
      if (this.defaultData && this.defaultData.hasOwnProperty(item.key)) {
        value = this.defaultData[item.key]
      }

      if (this.data.prepareData && this.data.prepareData.hasOwnProperty(item.key)) { // remote search select or file or something
        value = this.defaultData[item.key]
        Object.assign(prepareData, this.data.prepareData[item.key])
      }

      if (item.type === 'object' && value) {
        prepareData.options = value
        value = value.optionValue || value
      }

      item.prepareData = prepareData

      if (item.type === 'boolean') {
        return !value ? false : value
      }

      if (item.type === 'array') {
        if (item.fieldType === 'TableView' && item.staticOptions && item.staticOptions.length) {
          return value || []
        } else if (item.staticOptions && item.staticOptions.length) {
          return value || []
        }
        return {}
      }

      // 非数组一律强转
      return value !== null ? value + '' : ''
    },
    onFileUploaded(response, file, fileList) {
      // console.log('--==--',response, file, fileList)
      if (response.data && response.data.length) {
        this.fileResultData[file.uid] = response.data[0]
      }
    },
    onFileRemoved(file, fileList) {
      if (this.fileResultData.hasOwnProperty(file.uid)) {
        delete this.fileResultData[file.uid]
      }
    },
    productLineOnchage(e) {
      this.seletedProductLine = e
    },
    onReset() {
      // window.location.reload()
      // this.queryData = null
      this.$emit('cancle')
    },
    onSubmit() {
      var form = {}
      var isValidPass = true

      var validation = function(item) {
        if (item.comType === 'file' || item.comType === 'fileList') { // 只支持一个文件上传的控件,这个判断必须放第一个
          var temp = [] // 把item.value里边的文件id取出来用来post
          for (const key in item.value) {
            if (item.value.hasOwnProperty(key)) {
              const element = item.value[key]
              temp.push({ id: element.id })
            }
          }
          item.value = temp
          return true
        }
        if (item.value === null || item.value === undefined) {
          return false
        }
        if (typeof item.value === 'string' && !item.value.length) {
          return false
        }
        return true
      }

      for (const item of this.queryData) {
        if (this.type === 'submit') {
          if (item.isRequired) {
            if (!validation(item)) {
              isValidPass = false
              this.$message.error(item.title + '不能为空')
              break
            }
          }
        }

        if (validation(item)) {
          form[item.key] = item.value.optionValue || item.value
        }
      }
      if (isValidPass) {
        this.$emit('input', form)
      }
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
      width: 230px;
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
