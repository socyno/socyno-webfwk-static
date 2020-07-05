<template>
  <BaseFormContentBase
    :draggable="true"
    :show-all="true"
    :field-models="cachedFieldModels"
  >
    <template v-slot:content="{ field, index }">
      <el-button type="text" size="nimi" @click="showFieldSettings(field)">
        设置
        <i class="el-icon-arrow-down" />
      </el-button>
    </template>
    <template v-slot:after>
      <div v-if="actions && actions.length > 0" class="form-content-buttons">
        <el-button v-for="(item, index) in actions" :key="`form-action-${index}`" :type="item.type || 'primary'" :size="item.size || 'mini'" @click="$emit('actions', item)">
          {{ item.name || item.title || item.dispaly }}
        </el-button>
      </div>
      <el-drawer
        direction="rtl"
        :visible.sync="settingsVisible"
        :with-header="false"
        :append-to-body="true"
        :modal-append-to-body="true"
        @close="closeFieldSettings"
      >
        <el-form label-position="right" label-width="100px" size="mini">
          <el-form-item label="字段名称">
            {{ settingsFeild.key }}
            <el-button v-if="settingsFeild.custom" type="danger" size="mini" @click="deleteCustomField(settingsFeild)">
              删除
            </el-button>
          </el-form-item>
          <el-form-item label="标题显示">
            <el-input
              v-model="settingsFeild.title"
              size="mini"
            />
          </el-form-item>
          <el-form-item label="标题宽度">
            <el-select v-model="settingsFeild.titleWidth" size="mini">
              <el-option label="默认" :value="''" />
              <el-option label="20px" :value="20" />
              <el-option label="40px" :value="40" />
              <el-option label="60px" :value="60" />
              <el-option label="80px" :value="80" />
              <el-option label="120px" :value="120" />
              <el-option label="160px" :value="160" />
              <el-option label="200px" :value="200" />
              <el-option label="不显示(0px)" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item label="标题冒号">
            <el-select v-model="settingsFeild.titleWithoutColon" size="mini">
              <el-option label="不显示" :value="true" />
              <el-option label="显示" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item label="表单宽度">
            <el-select v-model="settingsFeild.placement" size="mini">
              <el-option label="默认" :value="''" />
              <el-option label="1/12" :value="1" />
              <el-option label="2/12" :value="2" />
              <el-option label="3/12" :value="3" />
              <el-option label="4/12" :value="4" />
              <el-option label="5/12" :value="5" />
              <el-option label="6/12" :value="6" />
              <el-option label="7/12" :value="7" />
              <el-option label="8/12" :value="8" />
              <el-option label="9/12" :value="9" />
              <el-option label="10/12" :value="10" />
              <el-option label="11/12" :value="11" />
              <el-option label="12/12" :value="12" />
            </el-select>
          </el-form-item>
          <el-form-item label="列表宽度">
            <el-input
              v-model="settingsFeild.listWidth"
              type="number"
              size="mini"
            />
          </el-form-item>
          <el-form-item label="内容高度">
            <el-input
              v-model="settingsFeild.placerows"
              type="number"
              size="mini"
            />
          </el-form-item>
          <el-form-item v-if="settingsFeild.custom" label="字段类型">
            <el-select v-model="settingsFeild.fieldType" size="mini">
              <el-option label="只读文本" value="readonly" />
              <el-option label="分隔线" value="separator" />
              <el-option label="以下字段不显示" value="hidden" />
              <el-option label="以下字段值全为空不显示" value="hiddenIfAllEmpty" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="settingsFeild.custom || settingsFeild.modifiable" label="可否编辑">
            <el-switch
              v-model="settingsFeild.editable"
              size="mini"
            />
          </el-form-item>
          <el-form-item v-if="settingsFeild.custom || settingsFeild.modifiable" label="是否必填">
            <el-switch
              v-model="settingsFeild.required"
              size="mini"
            />
          </el-form-item>
          <el-form-item label="校验模式">
            <el-input
              v-model="settingsFeild.pattern"
              type="textarea"
              rows="2"
              size="mini"
            />
          </el-form-item>
          <el-form-item label="字段描述">
            <el-input
              v-model="settingsFeild.description"
              type="textarea"
              rows="3"
              size="mini"
            />
          </el-form-item>
          <el-form-item label="内容模板">
            <el-input
              v-model="settingsFeild.template"
              type="textarea"
              rows="3"
              size="mini"
            />
          </el-form-item>
        </el-form>
      </el-drawer>
    </template>
  </BaseFormContentBase>
</template>
<script>
import tool from '@/utils/tools'
export default {
  name: 'BaseFormContentConfig',
  components: {
    BaseFormContentBase: () => import('./base')
  },
  props: {
    fieldModels: {
      type: Array,
      default: function() {
        return []
      }
    },
    /**
     * 自定义的操作按钮
     */
    actions: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      settingsFeild: {},
      settingsVisible: false,
      cachedFieldModels: []
    }
  },
  watch: {
    fieldModels: {
      immediate: true,
      handler(newFieldModels, oldFieldModels) {
        this.cachedFieldModels = tool.jsonCopy(newFieldModels)
      }
    }
  },
  methods: {
    /**
     * 显示字段设置界面
     */
    showFieldSettings(field, index) {
      this.settingsFeild = field
      this.settingsVisible = true
    },
    /**
     * 关闭字段设置界面
     */
    closeFieldSettings() {
      this.settingsFeild = {}
      this.settingsVisible = false
    },
    /**
     * 删除字段
     */
    deleteCustomField(field, index) {
      // console.log('删除字段：', 'index = ', index, ', field = ', field)
      this.closeFieldSettings()
      this.cachedFieldModels.splice(index, 1)
    },
    /**
     * 显示添加字段界面
     */
    createCustomField() {
      this.settingsFeild = {}
      this.settingsVisible = true
    }
  }
}
</script>
<style lang="scss">
.form-content-wrapper {
  .form-content-buttons {
    padding: 5px 50px;
    text-align: center;
  }
}
</style>
