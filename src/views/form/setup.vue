<template>
  <div class="form-setup">
    <el-page-header class="common-page-header" :content="'设置 “'+formTitle+'”'" @back="$router.go(-1)" />
    <el-tabs type="border-card">
      <el-tab-pane key="'查询视图'" label="查询视图">
        <el-tabs type="border-card">
          <el-tab-pane v-for="(queryData, queryKey, queryIndex) in formQueryViewAttrs" :key="'form-query-tab-' + queryIndex" :label="queryData.display">
            <el-tabs type="border-card">
              <el-tab-pane v-if="queryData.formClass" :key="'form-query-cond-tab' + queryIndex" label="表单视图">
                <SetupViewPane :form-class="queryData.formClass" :save-click="saveViewAttributes" />
              </el-tab-pane>
              <el-tab-pane v-if="queryData.resultClass" :key="'form-query-result-tab' + queryIndex" label="结果视图">
                <SetupViewPane :form-class="queryData.resultClass" :save-click="saveViewAttributes" />
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>

      <el-tab-pane label="事件视图">
        <el-tabs type="border-card">
          <el-tab-pane v-for="(actionData, actionKey, actionIndex) in formActionViewAttrs" :key="'form-action-tab-' + actionIndex" :label="actionData.display">
            <el-tabs type="border-card">
              <el-tab-pane v-if="actionData.formClass.data" :key="'form-action-cond-tab' + actionIndex" label="表单视图">
                <SetupViewPane :form-class="actionData.formClass" :save-click="saveViewAttributes" />
              </el-tab-pane>
              <el-tab-pane v-if="actionData.resultClass.data" :key="'form-action-result-tab' + actionIndex" label="结果视图">
                <SetupViewPane :form-class="actionData.resultClass" :save-click="saveViewAttributes" />
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>

      <el-tab-pane :key="'form-detail-tab'" label="详情视图">
        <SetupViewPane :form-class="formDetailViewAttrs" :save-click="saveViewAttributes" />
      </el-tab-pane>

      <el-tab-pane :key="'form-extras-tab'" label="关联视图">
        <div style="margin-bottom: 20px;">
          <el-select :key="'form-extras-selector'" v-model="formExtraViewAttrs.formClass.classPath" class="width600" placeholder="请选择关联视图" @change="loadExtraViewAttributes">
            <el-option v-for="extra in formExtraViewAttrs.names" :key="`form-extra-name-${extra}`" :label="extra" :value="extra" />
          </el-select>
          <el-button type="primary" size="small" style="margin-left: 20px;" @click="showExtraViewCreationForm()">
            添加关联
          </el-button>
          <el-button type="primary" size="small" style="margin-left: 20px;" @click="removeSelectedExtraView()">
            删除当前视图
          </el-button>
        </div>
        <SetupViewPane :form-class="formExtraViewAttrs.formClass" :save-click="saveViewAttributes" />
      </el-tab-pane>
    </el-tabs>

    <el-dialog title="添加关联视图" :modal-append-to-body="false" :close-on-click-modal="false" :visible.sync="formViewCreation.visible" width="800px">
      <el-form ref="viewCreationForm" :rules="formViewCreation.rules" :model="formViewCreation.data" label-position="right" label-width="90px" class="demo-form-inline">
        <el-form-item label="服务key：" prop="view">
          <el-input v-model="formViewCreation.data.view" class="width600" :placeholder="'请输入视图将模型的路径（ClassPath）'" />
        </el-form-item>
        <el-form-item label>
          <el-button type="primary" size="small" @click="closeExtraViewCreationForm(true)">
            保存
          </el-button>
          <el-button size="small" @click="closeExtraViewCreationForm()">
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import { Loading } from 'element-ui'
import FormApi from '@/apis/formApi'
import SetupViewPane from './setupPane'
import tool from '@/utils/tools.js'
export default {
  components: {
    SetupViewPane
  },
  data() {
    return {
      formName: this.$route.params.form_name,
      formTitle: '',
      /**
       * 详情视图界面数据
       */
      formDetailViewAttrs: {
        data: {}
      },
      /**
       * 查询视图的数据
       */
      formQueryViewAttrs: {
      },
      /**
       * 事件视图的数据
       */
      formActionViewAttrs: {
      },
      /**
       * 关联视图界面数据
       */
      formExtraViewAttrs: {
        names: [],
        formClass: {
          data: null,
          classPath: ''
        }
      },
      /**
       * 新增字关联视图
       */
      formViewCreation: {
        data: {
          view: ''
        },
        target: {

        },
        rules: {
          view: [
            { required: true, message: '内容不能为空', trigger: 'blur' }
          ]
        },
        visible: false
      }
    }
  },
  created() {
    this.formApi = new FormApi(this.formName)
  },
  mounted() {
    /**
     * 初始化流程定义数据
     */
    this.formApi.loadDefinition().then(definition => {
      this.formTitle = definition.title
      this.getDetailViewAttributes(definition.formClass)
      this.getQueriesViewAttriutes(definition.queries, definition.otherQueries)
      this.getActionsViewAttriutes(definition.actions, definition.otherActions)
      this.loadExtraViewNames()
    })
  },
  methods: {
    /**
     * 往关联视图清单中添加视图
     */
    addExtraViewNames(names) {
      if (tool.isBlank(names)) {
        return
      }
      if (!tool.isArray(names)) {
        names = [names]
      }
      for (var i = 0; i < names.length; i++) {
        this.formExtraViewAttrs.names.push(names[i])
      }
      tool.arraySortAndUnique(this.formExtraViewAttrs.names, true)
    },

    // /**
    // * 从关联视图清单中移除视图
    // */
    // delExtraViewNames(names) {
    //   if (tool.isBlank(names)) {
    //     return
    //   }
    //   if (!tool.isArray(names)) {
    //     names = [names]
    //   }
    //   for (var i = this.formExtraViewAttrs.names.length - 1; i >= 0; i--) {
    //     if (tool.inArray(this.formExtraViewAttrs.names[i], names) >= 0) {
    //       this.formExtraViewAttrs.names.splice(i, 1)
    //     }
    //   }
    // },

    /**
     * 从关联视图清单中移除视图
     */
    removeSelectedExtraView() {
      const that = this
      const formViewKey = that.formExtraViewAttrs.formClass.classPath
      if (tool.isBlank(formViewKey)) {
        return
      }
      this.$confirm(`是否确认移当前的视图关联 : ${formViewKey} ?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        var removed = []
        for (var index in that.formExtraViewAttrs.names) {
          var idxName = that.formExtraViewAttrs.names[index]
          if (idxName === formViewKey) {
            continue
          }
          removed.push(idxName)
        }
        that.formApi.saveExtraViewNames(removed).then(res => {
          for (var i = that.formExtraViewAttrs.names.length - 1; i >= 0; i--) {
            if (formViewKey === that.formExtraViewAttrs.names[i]) {
              that.formExtraViewAttrs.names.splice(i, 1)
              that.formExtraViewAttrs['formClass'] = {}
            }
          }
        })
      })
    },

    /**
     * 初始化表单详情页的视图数据
     */
    getDetailViewAttributes(origin) {
      this.formApi.loadViewAttributes(origin.classPath).then(customs => {
        this.formDetailViewAttrs = { data: this.mergeViewAttributes(origin.properties, customs), classPath: origin.classPath }
      })
    },

    /**
     * 初始化预定义查询的界面视图数据
     */
    getQueriesViewAttriutes(queries, otherQueries) {
      var count = 0
      var formQueryViewAttrs = {}
      if (!tool.isArray(queries)) {
        queries = []
      }
      if (tool.isArray(otherQueries)) {
        queries = queries.concat(otherQueries)
      }
      console.log('获取到的查询定义数据如下：')
      console.log(queries)
      console.log('开始加载用户自定义查询视图数据 ...')
      queries.forEach((query, index) => {
        var formQueryViewAttrsKey = 'formqueries' + tool.lengthPrefixed(index, 2, '0')
        formQueryViewAttrs[formQueryViewAttrsKey] = { name: query.name, display: query.display }
        return ((index, query) => {
          this.formApi.loadViewAttributes(query.formClass.classPath).then(customs => {
            ++count
            formQueryViewAttrs[formQueryViewAttrsKey]['formClass'] = {
              classPath: query.formClass.classPath,
              data: this.mergeViewAttributes(query.formClass.properties, customs)
            }
            if (count === queries.length * 2) {
              this.formQueryViewAttrs = formQueryViewAttrs
            }
          })
          this.formApi.loadViewAttributes(query.resultClass.classPath).then(customs => {
            ++count
            formQueryViewAttrs[formQueryViewAttrsKey]['resultClass'] = {
              classPath: query.resultClass.classPath,
              data: this.mergeViewAttributes(query.resultClass.properties, customs)
            }
            if (count === queries.length * 2) {
              console.log('加载用户自定义查询视图数据完成，合并数据如下：')
              console.log(formQueryViewAttrs)
              this.formQueryViewAttrs = formQueryViewAttrs
            }
          })
        })(index, query)
      })
    },

    /**
     * 初始化可执行事件的界面视图数据
     */
    getActionsViewAttriutes(actions, otherActions) {
      var count = 0
      var formActionViewAttrs = {}
      if (!tool.isArray(actions)) {
        actions = []
      }
      if (tool.isArray(otherActions)) {
        actions = actions.concat(otherActions)
      }
      console.log('获取到的查询定义数据如下：')
      console.log(actions)
      console.log('开始加载用户自定义查询视图数据 ...')
      actions.forEach((action, index) => {
        var formActionViewAttrsKey = 'formactions' + tool.lengthPrefixed(index, 2, '0')
        formActionViewAttrs[formActionViewAttrsKey] = { name: action.name, display: action.display }
        return ((index, action) => {
          this.formApi.loadViewAttributes(action.formClass.classPath).then(customs => {
            ++count
            formActionViewAttrs[formActionViewAttrsKey]['formClass'] = {
              classPath: action.formClass.classPath,
              data: this.mergeViewAttributes(action.formClass.properties, customs)
            }
            if (count === actions.length * 2) {
              console.log('加载用户自定义查询视图数据完成，合并数据如下：')
              console.log(formActionViewAttrs)
              this.formActionViewAttrs = formActionViewAttrs
            }
          })
          this.formApi.loadViewAttributes(action.resultClass.classPath).then(customs => {
            ++count
            formActionViewAttrs[formActionViewAttrsKey]['resultClass'] = {
              classPath: action.resultClass.classPath,
              data: this.mergeViewAttributes(action.resultClass.properties, customs)
            }
            if (count === actions.length * 2) {
              console.log('加载用户自定义查询视图数据完成，合并数据如下：')
              console.log(formActionViewAttrs)
              this.formActionViewAttrs = formActionViewAttrs
            }
          })
        })(index, action)
      })
    },

    /**
     * 加载关联视图模型清单
     */
    loadExtraViewNames() {
      this.formApi.loadExtraViewNames().then(names => {
        console.log('获取到的表单关联的视图清单如下：')
        console.log(names)
        this.addExtraViewNames(names)
      })
    },

    /**
     * 加载关联视图模型数据
     */
    loadExtraViewAttributes(formViewKey) {
      // console.log(formViewKey)
      if (formViewKey && formViewKey.value) {
        formViewKey = formViewKey.value
      }
      console.log('"' + tool.trim(tool.stringify(formViewKey)) + '"')
      if (tool.isBlank(formViewKey)) {
        return
      }
      this.formExtraViewAttrs['formClass'] = { classPath: formViewKey }
      this.formApi.loadViewDefinition(formViewKey).then((formViewData) => {
        this.formApi.loadViewAttributes(formViewKey).then(customs => {
          this.formExtraViewAttrs['formClass'] = {
            classPath: formViewKey,
            data: this.mergeViewAttributes(formViewData.properties, customs)
          }
        }).catch((e) => {
          this.$message.error('加载表单界面视图自定义数据失败：' + formViewKey)
        })
      }).catch((e) => {
        this.$message.error('加载表单界面视图原始数据失败：' + formViewKey)
      })
    },

    mergeViewAttributes(origin, customs) {
      if (!origin) {
        return
      }
      var result = {}
      for (var key in origin) {
        result[key] = {
          title: origin[key].title || '',
          group: origin[key].group || '',
          position: origin[key].position || '',
          description: origin[key].description || '',
          fieldType: origin[key].fieldType || 'string',
          type: origin[key].type || 'string',
          template: origin[key].template || '',
          classPath: origin[key].items ? (origin[key].items.classPath || '') : (origin[key].classPath || '')
        }
        /**
         * 所有发现的关联视图，都将被自动添加到可选列表中
         */
        if (!tool.isBlank(result[key].classPath)) {
          this.addExtraViewNames(result[key].classPath)
        }
      }

      if (tool.isArray(customs)) {
        for (var i = 0; i < customs.length; i++) {
          /* 内建字段中不存在的，一律视为扩展字段 */
          var innerField = null
          for (var keyr in result) {
            if (customs[i].field === keyr) {
              innerField = result[keyr]
              break
            }
          }
          if (!innerField) {
            result[customs[i].field] = { type: 'string', fieldType: '_custom' }
            innerField = result[customs[i].field]
          }
          Object.assign(innerField, {
            'title': tool.defaultIfEquals(tool.ifBlank(customs[i].title, innerField.title), '<empty>', ''),
            'group': tool.defaultIfEquals(tool.ifBlank(customs[i].group, innerField.group), '<empty>', ''),
            'position': tool.defaultIfEquals(tool.ifBlank(customs[i].position, innerField.position), '<empty>', ''),
            'template': tool.defaultIfEquals(tool.ifBlank(customs[i].template, innerField.template), '<empty>', ''),
            'placement': tool.defaultIfEquals(tool.ifBlank(customs[i].placement, innerField.placement), '<empty>', ''),
            'description': tool.defaultIfEquals(tool.ifBlank(customs[i].description, innerField.description), '<empty>', '')
          })
        }
      }
      return this.sortFieldByPosition(result)
    },

    /**
     * 保存当前的视图界面数据
     */
    saveViewAttributes(formClassViewAttributes) {
      this.$confirm(`是否确认保存?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var uploadData = []
        for (var key in formClassViewAttributes.data) {
          var attrs = formClassViewAttributes.data[key]
          uploadData.push({
            field: key,
            title: attrs.title,
            group: attrs.group,
            position: attrs.position,
            description: attrs.description,
            fieldType: attrs.fieldType,
            template: attrs.template,
            placement: attrs.placement
          })
        }
        var loading = Loading.service({
          fullscreen: true,
          text: '请求中…',
          background: 'rgba(0, 0, 0, 0.1)'
        })
        this.formApi.saveViewAttributes(formClassViewAttributes.classPath, uploadData).then(res => {
          formClassViewAttributes.data = this.sortFieldByPosition(formClassViewAttributes.data)
          this.$message.success(`保存成功`)
        }).finally(e => {
          loading.close()
        })
      })
    },

    /**
     * 根据字段定义的位置数据，进行自动的排序
     */
    sortFieldByPosition(formViewData) {
      if (!tool.isPlainObject(formViewData)) {
        return
      }
      var sortArray = []
      var noSortObj = {}
      for (var key in formViewData) {
        if (formViewData[key]['position'] && formViewData[key]['position'] > 0) {
          sortArray.push({
            key: key,
            order: formViewData[key]['position']
          })
        } else {
          noSortObj[key] = formViewData[key]
        }
      }
      var result = {}
      sortArray.sort((n, o) => n.order - o.order)
      sortArray.forEach(t => {
        result[t.key] = formViewData[t.key]
      })
      return Object.assign(result, noSortObj)
    },

    /**
     * 打开关联视图模型添加窗口
     */
    showExtraViewCreationForm() {
      this.formViewCreation.data = {}
      this.formViewCreation.visible = true
    },

    /**
     * 关闭关联视图模型添加窗口
     */
    closeExtraViewCreationForm(saveView) {
      if (!saveView) {
        this.formViewCreation.visible = false
        return
      }
      console.log('当前添加的视图信息如下：')
      console.log(this.formViewCreation)
      this.$refs['viewCreationForm'].validate(valid => {
        if (!valid) {
          return
        }
        var loading = Loading.service({
          fullscreen: true,
          text: '请求中…',
          background: 'rgba(0, 0, 0, 0.1)'
        })
        var extranames = [this.formViewCreation.data.view]
        for (var key in this.formExtraViewAttrs.names) {
          extranames.push(this.formExtraViewAttrs.names[key])
        }
        this.formApi.saveExtraViewNames(extranames).then(res => {
          this.closeExtraViewCreationForm()
          this.addExtraViewNames(this.formViewCreation.data.view)
        }).finally(e => {
          loading.close()
        })
      })
    }
  }
}
</script>
<style lang='scss'>
.form-setup {
  .el-dialog__header {
    border-bottom: 1px solid #ddd;
  }
  .el-input {
    display: initial !important;
  }
  .width600 .el-input__inner{
    width: 600px !important;
  }
}
</style>
