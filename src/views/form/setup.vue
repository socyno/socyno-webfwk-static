<template>
  <div class="form-setup">
    <el-page-header class="common-page-header" :content="'设置 “'+formTitle+'”'" @back="$router.go(-1)" />
    <el-tabs type="border-card">
      <el-tab-pane label="查询配置">
        <el-tabs type="border-card">
          <el-tab-pane v-if="queriesTab" label="筛选配置">
            <el-form v-if="queriesTab.data" label-position="right" style="width: 100%;" label-width="200px" class="demo-form-inline">
              <el-form-item v-for="(item, key, index) in queriesTab.data" :key="'sx'+index" :label="`${ key }：`" :prop="key">
                <i v-if="addFieldFix.test(key)" size="mini" class="el-icon-delete" @click="deleteAddField('queriesTab',key)" />
                <span class="field-name">名称：</span><el-input v-model="item.title" style="width: 150px;" class="width150" />
                <span class="field-name">序号：</span><el-input v-model="item.position" type="number" class="width90" />
                <span class="field-name">分组：</span><el-input v-model="item.group" class="width150" />
                <span v-for="(itema, keya, indexa) in item" :key="'sxzx'+indexa">
                  <span v-if="fixedField.indexOf(keya)<0">
                    <span class="field-name">{{ keya }}：</span>
                    <el-input v-model="item[keya]" class="width150" />
                    <i size="mini" class="el-icon-delete" @click="deleField('queriesTab',key,keya)" />
                  </span>
                </span>
                <i class="el-icon-circle-plus addBtn" @click="addField(true,key,'queriesTab')" />
                <div>
                  <span class="field-name">描述：</span>
                  <el-input v-model="item.description" type="textarea" :rows="2" class="field-line" />
                </div>
              </el-form-item>
              <el-form-item label>
                <i class="el-icon-plus addBtn" @click="addField(true,'','queriesTab',false)" />
              </el-form-item>
              <el-form-item label>
                <el-button type="primary" size="small" @click="submitForm('queriesTab')">
                  保存
                </el-button>
                <el-button size="small" @click="$router.go(-1)">
                  返回
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane v-if="tableTab" label="列表配置">
            <el-form label-position="right" style="width: 100%;" label-width="200px" class="demo-form-inline">
              <el-form-item v-for="(item, key, index) in tableTab.data" :key="'lb'+index" :label="`${ key }：`" :prop="key">
                <i v-if="addFieldFix.test(key)" size="mini" class="el-icon-delete" @click="deleteAddField('tableTab',key)" />
                <span class="field-name">名称：</span><el-input v-model="item.title" style="width: 150px;" class="width150" />
                <span class="field-name">序号：</span><el-input v-model="item.position" type="number" class="width90" />
                <span class="field-name">分组：</span><el-input v-model="item.group" class="width150" />
                <span class="field-name">模板：</span><el-input v-model="item.template" class="width90" />
                <span v-for="(itema, keya, indexa) in item" :key="'lbzx'+indexa">
                  <span v-if="fixedField.indexOf(keya)<0">
                    <span class="field-name">{{ keya }}：</span>
                    <el-input v-model="item[keya]" class="width150" />
                    <i size="mini" class="el-icon-delete" @click="deleField('tableTab',key,keya)" />
                  </span>
                </span>
                <i class="el-icon-edit addBtn" @click="addTemplate(true,key,'tableTab')" />
                <i class="el-icon-circle-plus addBtn" @click="addField(true,key,'tableTab')" />
                <div>
                  <span class="field-name">描述：</span>
                  <el-input v-model="item.description" type="textarea" :rows="2" class="field-line" />
                </div>
              </el-form-item>
              <el-form-item label>
                <i class="el-icon-plus addBtn" @click="addField(true,'','tableTab',false)" />
              </el-form-item>
              <el-form-item label>
                <el-button type="primary" size="small" @click="submitForm('tableTab')">
                  保存
                </el-button>
                <el-button size="small" @click="$router.go(-1)">
                  返回
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>

      <el-tab-pane v-if="formTab" label="表单配置">
        <el-form label-position="right" style="width: 90%;" label-width="200px" class="demo-form-inline">
          <el-form-item v-for="(item, key, index) in formTab.data" :key="'bd'+index" :label="`${ key }：`" :prop="key">
            <i v-if="addFieldFix.test(key)" size="mini" class="el-icon-delete" @click="deleteAddField('formTab',key)" />
            <span class="field-name">名称：</span><el-input v-model="item.title" style="width: 150px;" class="width150" />
            <span class="field-name">序号：</span><el-input v-model="item.position" type="number" class="width90" />
            <span class="field-name">分组：</span><el-input v-model="item.group" class="width150" />
            <span class="field-name">模板：</span><el-input v-model="item.template" class="width90" />
            <span v-for="(itema, keya, indexa) in item" :key="'bdzx'+indexa">
              <span v-if="fixedField.indexOf(keya)<0">
                <span class="field-name">{{ keya }}：</span>
                <el-input v-model="item[keya]" class="width150" />
                <i size="mini" class="el-icon-delete" @click="deleField('formTab',key,keya)" />
              </span>
            </span>
            <el-button v-if="item.fieldType==='TableView'&&item.type!='string'" class="btn" size="mini" round @click="showTabView(true,item)">
              TV
            </el-button>
            <i class="el-icon-edit addBtn" @click="addTemplate(true,key,'formTab')" />
            <i class="el-icon-circle-plus addBtn" @click="addField(true,key,'formTab')" />
            <div>
              <span class="field-name">描述：</span>
              <el-input v-model="item.description" type="textarea" :rows="2" class="field-line" />
            </div>
          </el-form-item>
          <el-form-item label>
            <i class="el-icon-plus addBtn" @click="addField(true,'','formTab',false)" />
          </el-form-item>
          <el-form-item label>
            <el-button type="primary" size="small" @click="submitForm('formTab')">
              保存
            </el-button>
            <el-button size="small" @click="$router.go(-1)">
              返回
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane v-if="actionTab" label="事件配置">
        <el-tabs type="border-card">
          <el-tab-pane v-for="(item, key) in actionTab" :key="'sjpz'+key" :label="item.display">
            <el-form :key="'sjpzf'+key" label-position="right" style="width: 90%;" label-width="200px" class="demo-form-inline">
              <table class="attribute">
                <tr>
                  <td>是否异步：{{ item.asyncEvent }}</td>
                  <td>视图类型：{{ item.eventFormType }}</td>
                  <td>事件类型：{{ item.eventType }}</td>
                  <td>消息是否必填：{{ item.messageRequired?'是':item.messageRequired==null?'不显示':'否' }}</td>
                  <td>事件目标状态：{{ item.targetState }}</td>
                  <td>事件是否忽略版本升级：{{ item.stateRevisionChangeIgnored }}</td>
                </tr>
                <tr>
                  <td>是否执行额外的数据接口调用：{{ item.prepareRequired }}</td>
                  <td>响应数据类型：{{ item.resultClass?JSON.parse(item.resultClass).type:'' }}</td>
                  <td colspan="4">
                    事件可执行状态：{{ item.sourceStates }}
                  </td>
                </tr>
              </table>

              <el-form-item v-for="(itema, keya) in actionsObj['actions'+key].data" :key="'shj'+keya" :label="`${ keya }：`" :prop="keya">
                <i v-if="addFieldFix.test(keya)" size="mini" class="el-icon-delete" @click="deleteAddField(`actionsObj${actionPrefix}actions${key}`,keya)" />
                <span class="field-name">名称：</span><el-input v-model="itema.title" style="width: 150px;" class="width150" />
                <span class="field-name">序号：</span><el-input v-model="itema.position" type="number" class="width90" />
                <span class="field-name">分组：</span><el-input v-model="itema.group" class="width150" />
                <span v-for="(iteme, keye, indexe) in itema" :key="'sjzx'+indexe">
                  <span v-if="fixedField.indexOf(keye)<0">
                    <span class="field-name">{{ keye }}：</span>
                    <el-input v-model="itema[keye]" class="width150" />
                    <i size="mini" class="el-icon-delete" @click="deleFixField(`actionsObj${actionPrefix}actions${key}`,keya,keye)" />
                  </span>
                </span>
                <el-button v-if="item.fieldType==='TableView'&&item.type!='string'" class="btn" size="mini" round @click="showTabView(true,item)">
                  TV
                </el-button>
                <i class="el-icon-circle-plus addBtn" @click="addField(true,keya, `actionsObj${actionPrefix}actions${key}`)" />
                <div>
                  <span class="field-name">描述：</span>
                  <el-input v-model="item.description" type="textarea" :rows="2" class="field-line" />
                </div>
              </el-form-item>
              <el-form-item label>
                <i class="el-icon-plus addBtn" @click="addField(true,'',`actionsObj${actionPrefix}actions${key}`,false)" />
              </el-form-item>
              <el-form-item label style="margin-left:20px;">
                <el-button type="primary" size="small" @click="submitForm(`actionsObj${actionPrefix}actions${key}`)">
                  保存
                </el-button>
                <el-button size="small" @click="$router.go(-1)">
                  返回
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>

      <el-tab-pane v-for="(value,idex) in addTabList" :key="'diy'+idex">
        <div slot="label">
          {{ value.substr(value.lastIndexOf('.')+1) }}
          <i size="mini" class="el-icon-delete" @click="deleteTab(idex)" />
        </div>
        <el-form v-if="showTabs" size="mini" label-position="right" style="width: 100%;" label-width="160px" class="demo-form-inline">
          <el-form-item v-for="(item, key, index) in tabObj['tab'+idex].data" :key="'sss'+index" :label="`${ key }：`" :prop="key">
            <i v-if="addFieldFix.test(key)" size="mini" class="el-icon-delete" @click="deleteAddField(`tabObj${actionPrefix}tab${idex}`,key)" />
            <span class="field-name">名称：</span><el-input v-model="item.title" style="width: 150px;" class="width150" />
            <span class="field-name">序号：</span><el-input v-model="item.position" type="number" class="width90" />
            <span class="field-name">分组：</span><el-input v-model="item.group" class="width150" />
            <span class="field-name">模板：</span><el-input v-model="item.template" class="width90" />
            <span v-for="(itema, keya, indexa) in item" :key="'diyzx'+indexa">
              <span v-if="fixedField.indexOf(keya)<0">
                <span class="field-name">{{ keya }}：</span>
                <el-input v-model="item[keya]" class="width150" />
                <i size="mini" class="el-icon-delete" @click="deleFixField(`tabObj${actionPrefix}tab${idex}`,key,keya)" />
              </span>
            </span>
            <i class="el-icon-edit addBtn" @click="addTemplate(true,key,`tabObj${actionPrefix}tab${idex}`)" />
            <i class="el-icon-circle-plus addBtn" @click="addField(true,key,`tabObj${actionPrefix}tab${idex}`)" />
            <div>
              <span class="field-name">描述：</span>
              <el-input v-model="item.description" type="textarea" :rows="2" class="field-line" />
            </div>
          </el-form-item>
          <el-form-item label>
            <i class="el-icon-plus addBtn" @click="addField(true,'',`tabObj${actionPrefix}tab${idex}`,false)" />
          </el-form-item>
          <el-form-item label>
            <el-button type="primary" size="small" @click="submitForm(`tabObj${actionPrefix}tab${idex}`)">
              保存
            </el-button>
            <el-button size="small" @click="$router.go(-1)">
              返回
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane>
        <span slot="label"><i class="el-icon-circle-plus-outline addBtn" @click="addTab(true)" /></span>
      </el-tab-pane>
    </el-tabs>

    <el-dialog title="新增Tab" :modal-append-to-body="false" :close-on-click-modal="false" :visible.sync="addTabVisible" width="700px">
      <el-form ref="tabForm" label-position="right" label-width="90px" class="demo-form-inline">
        <el-form-item label="服务key：" prop="field">
          <el-input v-model.trim="templateTxt" style="width: 80%;" />
        </el-form-item>
        <el-form-item label>
          <el-button type="primary" size="small" @click="saveTab('tabForm')">
            保存
          </el-button>
          <el-button size="small" @click="addTab(false)">
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog title="新增字段" :modal-append-to-body="false" :close-on-click-modal="false" :visible.sync="dialogAddVisible" width="700px">
      <el-form ref="formref" label-position="right" :rules="addRules" :model="addFieldObj" label-width="120px" class="demo-form-inline">
        <el-form-item label="字段：" prop="field">
          <el-input v-model.trim="addFieldObj.field" class="width180" :placeholder="isAddAttribute?'':'字段需以*结尾'" />
        </el-form-item>
        <el-form-item v-if="isAddAttribute" label="值：" prop="value">
          <el-input v-model.trim="addFieldObj.value" class="width180" />
        </el-form-item>
        <el-form-item label>
          <el-button type="primary" size="small" @click="saveField('formref')">
            保存
          </el-button>
          <el-button size="small" @click="addField(false)">
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog title="TableView配置" :modal-append-to-body="false" :close-on-click-modal="false" :visible.sync="tableViewVisible" width="80%">
      <el-form v-if="tableViewTab" label-position="right" style="width: 90%;" label-width="200px" class="demo-form-inline">
        <el-form-item v-for="(itema, keya) in tableViewTab.data" :key="'tw'+keya" :label="`${ keya }：`" :prop="keya">
          <span class="field-name">名称：</span><el-input v-model="itema.title" style="width: 150px;" class="width150" />
          <span class="field-name">序号：</span><el-input v-model="itema.position" type="number" class="width90" />
          <span class="field-name">分组：</span><el-input v-model="itema.group" class="width150" />
          <span class="field-name">模板：</span><el-input v-model="itema.template" class="width90" />
          <span v-for="(iteme, keye, indexe) in itema" :key="'twzx'+indexe">
            <span v-if="fixedField.indexOf(keye)<0">
              <span class="field-name">{{ keye }}：</span>
              <el-input v-model="itema[keye]" class="width150" />
              <i size="mini" class="el-icon-delete" @click="deleField('tableViewTab',keya,keye)" />
            </span>
          </span>
          <i class="el-icon-edit addBtn" @click="addTemplate(true,keya,'tableViewTab')" />
          <i class="el-icon-circle-plus addBtn" @click="addField(true,keya, 'tableViewTab')" />
          <div>
            <span class="field-name">描述：</span>
            <el-input v-model="item.description" type="textarea" :rows="2" class="field-line" />
          </div>
        </el-form-item>
        <el-form-item label style="margin-left:20px;">
          <el-button type="primary" size="small" @click="submitForm('tableViewTab')">
            保存
          </el-button>
          <el-button size="small" @click="showTabView(false)">
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog title="编辑模板" :modal-append-to-body="false" :close-on-click-modal="false" :visible.sync="templateVisible" width="800px">
      <div>
        <div>模板内容：</div>
        <el-input v-model="templateTxt" type="textarea" rows="10" />
      </div>
      <div>
        <el-button type="primary" size="small" @click="saveTemplate()">
          保存
        </el-button>
        <el-button size="small" @click="addTemplate(false)">
          取消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { Loading } from 'element-ui'
import * as API from '@/apis/formControl/index'
export default {
  data() {
    return {
      formName: this.$route.params.form_name,
      formTitle: '',
      fixedField: ['title', 'group', 'position', 'description', 'fieldType', 'template', 'properties', 'classPath', 'fieldTypeKey', 'fieldOptionsType', 'type'],
      noFromField: ['upload_remove', 'upload'],
      dialogAddVisible: false,
      tableViewVisible: false,
      templateVisible: false,
      addTabVisible: false,
      choseAddKey: '',
      choseObjName: '',

      addFieldObj: {
        field: '',
        value: ''
      },
      queriesTab: null,
      tableTab: null,
      formTab: null,
      actionTab: null,
      tableViewTab: null,
      actionPrefix: 'ttt',
      templateTxt: '',
      addTabList: [],
      isAddAttribute: true,
      addFieldFix: /\*$/,
      addRules: {
        field: [
          { required: true, message: '内容不能为空', trigger: 'blur' }
        ]
      },
      actionsObj: {
        actions0: {},
        actions1: {},
        actions2: {},
        actions3: {},
        actions4: {},
        actions5: {},
        actions6: {},
        actions7: {},
        actions8: {},
        actions9: {},
        actions10: {},
        actions11: {},
        actions12: {},
        actions13: {},
        actions14: {},
        actions15: {},
        actions16: {},
        actions17: {},
        actions18: {},
        actions19: {},
        actions20: {}
      },
      showTabs: false,
      tabObj: {
        tab0: {},
        tab1: {},
        tab2: {},
        tab3: {},
        tab4: {},
        tab5: {},
        tab6: {},
        tab7: {},
        tab8: {},
        tab9: {}
      },
      template: ''
    }
  },
  mounted() {
    this.getViewattrsInit()
  },
  methods: {
    getViewattrsInit() {
      API.getDefinition(this.formName).then(res => {
        this.formTitle = res.data.title
        this.getQueriesTab(res.data.queries[0].formClass)
        this.getTableTab(res.data.queries[0].resultClass)
        this.getFormTab(res.data.formClass)
        this.getActionTab(res.data.actions.filter(t => this.noFromField.indexOf(t.name) < 0))
        this.getExtraviewsInfo()
      })
    },

    getQueriesTab(orgObj) {
      API.getViewattrs(this.formName, JSON.parse(orgObj).classPath).then(rea => {
        this.queriesTab = { data: this.getObjOption(JSON.parse(orgObj).properties, JSON.parse(rea.data)), classPath: JSON.parse(orgObj).classPath }
      })
    },
    getTableTab(orgObj) {
      API.getViewattrs(this.formName, JSON.parse(orgObj).classPath).then(rea => {
        this.tableTab = { data: this.getObjOption(JSON.parse(orgObj).properties, JSON.parse(rea.data)), classPath: JSON.parse(orgObj).classPath }
      })
    },
    getFormTab(orgObj) {
      API.getViewattrs(this.formName, JSON.parse(orgObj).classPath).then(rea => {
        this.formTab = { data: this.getObjOption(JSON.parse(orgObj).properties, JSON.parse(rea.data)), classPath: JSON.parse(orgObj).classPath }
      })
    },
    getActionTab(actions) {
      var orgObj = {}
      var count = 0
      actions.forEach((item, index) => {
        orgObj = JSON.parse(item.formClass)
        return ((index, orgObj) => {
          API.getViewattrs(this.formName, orgObj.classPath).then(rea => {
            ++count
            this.actionsObj['actions' + index] = { data: this.getObjOption(orgObj.properties, JSON.parse(rea.data)), classPath: orgObj.classPath }
            if (count === actions.length) {
              this.actionTab = actions
            }
          })
        })(index, orgObj)
      })
    },
    getExtraviewsInfo() {
      this.showTabs = false
      API.getExtraviews(this.formName).then(res => { this.addTabList = res.data })
      API.getExtraviewsDefinition(this.formName).then(res => {
        var count = 0
        res.data.forEach((t, i) => {
          return ((t, i) => {
            API.getViewattrs(this.formName, JSON.parse(t).classPath).then(rea => {
              ++count
              this.tabObj['tab' + i] = { data: this.getObjOption(JSON.parse(t).properties, JSON.parse(rea.data)), classPath: JSON.parse(t).classPath }
              if (count === res.data.length) {
                this.showTabs = true
              }
            })
          })(t, i)
        })
      })
    },

    getObjOption(obj, reaArray) {
      if (!obj) return {}
      var result = {}
      for (var key in obj) {
        result[key] = {
          title: obj[key].title || '',
          group: obj[key].group || '',
          position: obj[key].position || '',
          description: obj[key].description || '',
          fieldType: obj[key].fieldType,
          type: obj[key].type,
          template: obj[key].template || '',
          properties: (obj[key].fieldType === 'TableView' && obj[key].type === 'array') ? (obj[key].items.properties || null) : (obj[key].properties || null),
          classPath: (obj[key].fieldType === 'TableView' && obj[key].type === 'array') ? (obj[key].items.classPath || '') : (obj[key].classPath || '')
        }
      }

      if (!reaArray || reaArray.length <= 0) {
        return this.sortFieldInfo(result)
      }

      for (var i = 0; i < reaArray.length; i++) {
        for (var keya in obj) {
          if (reaArray[i].field === keya) {
            delete reaArray[i].field
            delete reaArray[i].properties
            Object.assign(result[keya], reaArray[i])
            continue
          }
        }
        if (this.addFieldFix.test(reaArray[i].field)) {
          var fieldName = reaArray[i].field
          delete reaArray[i].field
          Object.assign(result, { [fieldName]: reaArray[i] })
        }
      }
      return this.sortFieldInfo(result)
    },

    addField(isShow, key, orignName, isAddAttr = true) {
      this.dialogAddVisible = isShow
      this.choseAddKey = key
      this.choseObjName = orignName
      this.isAddAttribute = isAddAttr
    },
    saveField(fname) {
      this.$refs[fname].validate(valid => {
        if (valid) {
          var checkd = true
          if (!this.isAddAttribute) {
            if (!this.addFieldFix.test(this.addFieldObj.field)) {
              this.$message.warning('新增字段结尾必须带上*号')
              checkd = false
            }
          } else if (this.fixedField.indexOf(this.addFieldObj.field) > -1) {
            this.$message.warning('该新增字段为内定字段，不能使用')
            checkd = false
          }
          if (checkd) {
            if (this.isAddAttribute) {
              if (this.choseObjName.indexOf(this.actionPrefix) > -1) {
                var tname = this.choseObjName.split(this.actionPrefix)
                this.$set(this[tname[0]][tname[1]].data[this.choseAddKey], this.addFieldObj.field, this.addFieldObj.value)
              } else {
                this.$set(this[this.choseObjName].data[this.choseAddKey], this.addFieldObj.field, this.addFieldObj.value)
              }
            } else {
              if (this.choseObjName.indexOf(this.actionPrefix) > -1) {
                var tnames = this.choseObjName.split(this.actionPrefix)
                this.$set(this[tnames[0]][tnames[1]].data, this.addFieldObj.field, {})
              } else {
                this.$set(this[this.choseObjName].data, this.addFieldObj.field, {})
              }
            }

            this.dialogAddVisible = false
            this.addFieldObj.field = ''
            this.addFieldObj.value = ''
          }
        }
      })
    },

    deleField(orignName, key, keya) {
      this.$delete(this[orignName].data[key], keya)
    },

    deleFixField(orignName, key, keya) {
      var tname = orignName.split(this.actionPrefix)
      this.$delete(this[tname[0]][tname[1]].data[key], keya)
    },

    deleteAddField(orignName, key) {
      this.$confirm(`是否确认删除该字段?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (orignName.indexOf(this.actionPrefix) > -1) {
          var tname = orignName.split(this.actionPrefix)
          this.$delete(this[tname[0]][tname[1]].data, key)
        } else {
          this.$delete(this[orignName].data, key)
        }
      })
    },

    submitForm(orignName) {
      var tabFields
      var classPath
      if (orignName.indexOf(this.actionPrefix) > -1) {
        var tname = orignName.split(this.actionPrefix)
        tabFields = this[tname[0]][tname[1]].data
        classPath = this[tname[0]][tname[1]].classPath
      } else {
        tabFields = this[orignName].data
        classPath = this[orignName].classPath
      }
      this.$confirm(`是否确认保存?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var loadObj = Loading.service({
          fullscreen: true,
          text: '请求中…',
          background: 'rgba(0, 0, 0, 0.1)'
        })
        var dataStr = ''
        for (var key in tabFields) {
          dataStr += `,{"field":"${key}"`
          for (var keye in tabFields[key]) {
            dataStr += `,"${keye}":"${tabFields[key][keye]}"`
          }
          dataStr += `}`
        }
        var resouse = JSON.parse(`[${dataStr.substr(1)}]`)
        API.updateViewattrs(this.formName, classPath, resouse).then(res => {
          loadObj.close()
          if (orignName.indexOf(this.actionPrefix) > -1) {
            var tname = orignName.split(this.actionPrefix)
            this[tname[0]][tname[1]].data = this.sortFieldInfo(this[tname[0]][tname[1]].data)
          } else {
            this[orignName].data = this.sortFieldInfo(this[orignName].data)
          }
          if (orignName === 'tableViewTab') {
            this.templateVisible = false
            this.tableViewVisible = false
            this.getViewattrsInit()
          }
          this.$message.success(`保存成功`)
        }).catch(e => {
          loadObj.close()
          this.$message.error(`保存失败,${e.message}`)
        })
      })
    },
    sortFieldInfo(sortObj) {
      sortObj = sortObj || null
      if (!sortObj) return {}
      var sortArray = []
      var noSortObj = {}
      for (var key in sortObj) {
        if (sortObj[key]['position'] && sortObj[key]['position'] > 0) {
          sortArray.push({
            key: key,
            order: sortObj[key]['position']
          })
        } else {
          noSortObj[key] = sortObj[key]
        }
      }
      var result = {}
      sortArray.sort((n, o) => n.order - o.order)
      sortArray.forEach(t => {
        result[t.key] = sortObj[t.key]
      })
      return Object.assign(result, noSortObj)
    },

    showTabView(isto, obj) {
      if (!isto) {
        this.tableViewVisible = isto
      } else {
        API.getViewattrs(this.formName, obj.classPath).then(rea => {
          this.tableViewTab = { data: this.getObjOption(obj.properties, JSON.parse(rea.data)), classPath: obj.classPath }
          this.tableViewVisible = isto
        })
      }
    },

    addTemplate(isto, key, orignName) {
      this.templateVisible = isto
      if (isto) {
        this.choseObjName = orignName
        this.choseAddKey = key
        if (orignName.indexOf(this.actionPrefix) > -1) {
          var tname = orignName.split(this.actionPrefix)
          this.templateTxt = decodeURIComponent(this[tname[0]][tname[1]].data[key].template) || ''
        } else {
          this.templateTxt = decodeURIComponent(this[orignName].data[key].template) || ''
        }
      }
    },

    saveTemplate() {
      if (this.choseObjName.indexOf(this.actionPrefix) > -1) {
        var tname = this.choseObjName.split(this.actionPrefix)
        this[tname[0]][tname[1]].data[this.choseAddKey].template = encodeURIComponent(this.templateTxt)
      } else {
        this[this.choseObjName].data[this.choseAddKey].template = encodeURIComponent(this.templateTxt)
      }
      this.templateVisible = false
    },

    addTab(isto) {
      this.templateTxt = ''
      this.addTabVisible = isto
    },
    deleteTab(index) {
      this.$confirm(`是否确认删除?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.addTabList.splice(index, 1)
        API.updateExtraviews(this.formName, this.addTabList).then(res => {
          this.getExtraviewsInfo()
        }).catch(e => {
          this.$message.error('删除失败')
        })
      })
    },
    saveTab(fname) {
      if (this.templateTxt === '') {
        this.$message.error('请填写服务Key')
        return false
      }
      var loadObj = Loading.service({
        fullscreen: true,
        text: '请求中…',
        background: 'rgba(0, 0, 0, 0.1)'
      })
      this.addTabList.splice(-1, 0, this.templateTxt)
      API.updateExtraviews(this.formName, this.addTabList).then(res => {
        this.getExtraviewsInfo()
        this.addTabVisible = false
        loadObj.close()
      }).catch(e => {
        loadObj.close()
      })
    }
  }
}
</script>
<style scoped lang='scss'>
.btn {
    margin-left:20px;
}
.el-icon-delete {
    cursor: pointer;
    color: red;
    padding: 0 5px 0 2px;
}
.addBtn {
  cursor: pointer;
  color: #409EFF;
  font-size: 21px;
  margin-left: 10px;
  vertical-align: middle;
}
.attribute {
  border: 1px solid deepskyblue;
  padding: 4px 8px;
  margin-bottom: 20px;
  color: #aaa;
  font-size: 14px;
  border-radius: 2px;
}
</style>
<style lang='scss'>
.form-setup{
  .el-dialog__header{
    border-bottom: 1px solid #ddd;
  }
  .field-name {
    display: inline-block;
    width: 50px !important;
  }
  .el-input{
    display: initial !important;
  }
  .width180 .el-input__inner{
    width: 180px !important;
  }
  .width150 .el-input__inner{
    width: 150px !important;
  }
  .width90 .el-input__inner{
    width: 90px !important;
  }
  .field-line {
    display: inline-block;
    width: calc(99% - 50px) !important;
  }
}
</style>
