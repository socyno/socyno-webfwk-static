<template>
  <div class="form-detial-generator">
    <slot v-for="(o, k) in columnData" class="subitem">
      <div v-if="o.fieldType === 'TEXT' || o.fieldType === 'TEXTLINE'" :key="k" class="row-line">
        <div v-if="o.title" class="title">
          {{ o.title || '' }}：
        </div>
        <div class="content">
          {{ getDetail(o) }}
        </div>
      </div>
      <div v-else-if="o.fieldType === 'File'" :key="k">
        <UploadDisplay :files="getDetail(o)" />
      </div>
      <div v-else-if="o.fieldType === 'TextHtml'" :key="k" class="row-line">
        <div v-if="o.title" class="title">
          {{ o.title }}：
        </div>
        <TemplateConfig :template="o.template" :options="o" :data="detailData" />
      </div>

      <div v-else-if="o.fieldType === 'TableView' && o.type !== 'array'" :key="k" class="plain-text">
        <span v-if="o.title" class="title">{{ o.title || '' }}：</span>
        {{ detailData[o.key] ? (detailData[o.key].optionDisplay || detailData[o.key]) : '' }}
      </div>
      <div v-else-if="o.fieldType === 'TableView' && o.type === 'array'" :key="k" class="row-line">
        <span v-if="o.title" class="title">{{ o.title }}：</span>
        <InviewTable :key="k" v-model="o.value" :data="o" :prepare-data="getTablePrepareData(o)" />
      </div>
      <BaseFormDetailTextDelta
        v-else-if="o.fieldType === 'TextDelta'"
        :key="k"
        :messages="wsmessages"
        :item="o"
      />
      <div v-else :key="k" class="plain-text">
        <span class="title">{{ o.title || '' }}：</span>
        <!-- <el-tooltip :content="getDetail(o)" placement="top"> -->
        <span class="text">{{ getDetail(o) }}</span>
        <!-- </el-tooltip> -->
      </div>
    </slot>
  </div>
</template>
<script>
import InviewTable from '../BaseFormItem/InviewTable'
import TemplateConfig from '../BaseFormItem/TemplateConfig'
import BaseFormDetailTextDelta from './BaseFormDetailTextDelta'
export default {
  components: {
    InviewTable,
    TemplateConfig,
    BaseFormDetailTextDelta
  },
  props: {
    /**
     * detail的值对象会被key取
     */
    detailData: {
      type: Object,
      default() {
        return {}
      },
      required: true
    },
    /**
     * 如果有socket则把存好的socket数组传进来
     */
    wsmessages: {
      type: Array,
      default: null
    },
    /**
     * 每一项的定义
     */
    columns: {
      type: [Object, String],
      required: true
    }
  },
  data() {
    return {
      columnData: []
    }
  },
  watch: {
    columns: {
      immediate: true,
      handler(newv) {
        if (typeof newv === 'string') {
          newv = JSON.parse(newv)
          // console.log(newv)
        }

        if (!newv.properties) return
        var tempArr = []
        var keys = Object.keys(newv.properties)
        for (const iterator in keys) {
          var key = keys[iterator]
          var value = newv.properties[key]
          if (!value.position || value.position <= 0) {
            continue
          }
          value.key = key
          if (value.position) {
            tempArr.push(value)
          }
        }

        tempArr.sort((a, b) => {
          // 排序
          return a.position - b.position
        })
        this.columnData = tempArr
      }
    }
  },
  methods: {
    getTablePrepareData(o) {
      var obj = {}
      obj[o.key] = this.getDetail(o)
      return obj
    },
    getDetail(o) {
      if (this.detailData) {
        var lastMsg = this.detailData
        var retValue = ''
        if (o.fieldType === 'Simple' && o.staticOptions) {
          for (const key in o.staticOptions) {
            if (o.staticOptions.hasOwnProperty(key)) {
              const element = o.staticOptions[key]
              if (element.value === lastMsg[o.key] + '') {
                retValue = element.display
              }
            }
          }
        } else {
          retValue = lastMsg[o.key]
        }
        return retValue
      }
    }
  }
}
</script>
<style lang="scss">
.form-detial-generator {
  background-color: #fff;
  color: #222;
  font-size: 15px;
  padding: 0 20px;
  .plain-text {
    width: calc(33.3% - 0px);
    display: inline-block;
    margin-bottom: 25px;
  }
  .row-line {
    margin-bottom: 25px;
  }

  .title {
    color: #606266;
    padding-right: 5px;
  }

  .text {
    overflow: hidden;
    display: inline-block;
    width: calc(100% - 125px);
    height: 21px;
    vertical-align: top;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
