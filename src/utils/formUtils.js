import tool from '@/utils/tools.js'

export const FORM_FIELD_OPTIONS = {
  /**
   * 默认字段
   */
  Default: 0,
  /**
   * 列表字段
   */
  ListOnly: 1,
  /**
   * 列表字段（如果为空，则使用表单字段）
   */
  ListFirst: 2,
  /**
   * 包含分隔符
   */
  SeparatorIncluded: 4,
  /**
   * 包含隐藏字段
   */
  HiddenIncluded: 8,
  /**
   * 当分组字段值均为空时，排除掉；
   * 注意，此时必须配合数据来使用；
   */
  HiddenIfAllEmpty: 16,
  /**
   * 排除未明确排序的字段
   */
  OrderUndefinedExcluded: 32,
  /**
   * 所有字段，不做任何过滤
   */
  All: 1024
}

/**
 * 根据字段模型，设置并返回字段的显示控件
 * @param {Object} fieldModel
 */
export function setFieldComponentType(fieldModel) {
  if (!fieldModel) {
    return
  }
  /* 首先，必须重置控制字段标记 */
  fieldModel.hiddenCtl = false
  fieldModel.separator = false
  var fieldType = tool.toLower(fieldModel.fieldType)
  switch (fieldType) {
    case 'password':
      fieldModel.comType = 'password'
      break
    case 'text':
    case 'textarea':
    case 'areatext':
    case 'textdelta':
      if (!fieldModel.comSpan) {
        fieldModel.comSpan = 12
      }
      fieldModel.comType = 'areaText'
      break
    case 'file':
      if (!fieldModel.comSpan) {
        fieldModel.comSpan = 12
      }
      fieldModel.comType = 'file'
      break
    case 'table':
    case 'tableview':
      if (fieldModel.type === 'array') {
        if (!fieldModel.comSpan) {
          fieldModel.comSpan = 12
        }
        fieldModel.comType = 'tableView'
      } else {
        fieldModel.comType = 'dynamicSelect'
      }
      break
    case 'form':
    case 'formview':
      if (!fieldModel.comSpan) {
        fieldModel.comSpan = 12
      }
      fieldModel.comType = 'innerForm'
      break
    case 'date':
    case 'dateonly':
      fieldModel.comType = 'DateOnly'
      break
    case 'datetime':
      fieldModel.comType = 'DateTime'
      break
    case 'time':
    case 'timeonly':
      fieldModel.comType = 'TimeOnly'
      break
    case 'separator':
      fieldModel.separator = true
      fieldModel.comType = 'separator'
      break
    default:
      if (fieldType.indexOf('hidden') === 0) {
        fieldModel.hiddenCtl = true
        fieldModel.separator = true
        fieldModel.comType = 'separator'
      } else if (fieldModel.type === 'button') {
        fieldModel.comType = 'button'
      } else if (fieldModel.fieldOptionsType === 'DYNAMIC') {
        fieldModel.comType = 'dynamicSelect'
      } else if (fieldModel.fieldOptionsType === 'STATIC') {
        fieldModel.comType = (fieldModel.type === 'array' && fieldModel.staticOptions)
          ? 'checkbox' : 'select'
      } else if (fieldModel.type === 'boolean') {
        fieldModel.comType = 'switch'
      } else if (fieldModel.type === 'array' && tool.isPlainObject(fieldModel.items)) {
        if (!fieldModel.comSpan) {
          fieldModel.comSpan = 12
        }
        fieldModel.comType = 'tableView'
      } else {
        fieldModel.comType = fieldModel.placerows > 1 ? 'areaText' : 'input'
      }
      if (!fieldModel.comSpan) {
        fieldModel.comSpan = fieldType.indexOf('text') >= 0 ? 12 : 4
      }
      break
  }
  if (!fieldModel.comSpan) {
    fieldModel.comSpan = 4
  }
}

/**
 * 解析原始的表单数据
 */
export function parseFormClass(formClass, formData) {
  if (tool.isUndef(formClass) || tool.isNull(formClass)) {
    return formClass
  }
  formClass = tool.isString(formClass)
    ? JSON.parse(formClass) : tool.jsonCopy(formClass)
  if (!formClass.properties) {
    return formClass
  }
  // console.log('界面模型基本数据结构:', formClass)
  if (!tool.isPlainObject(formData)) {
    formData = {}
  } else {
    formData = tool.jsonCopy(formData)
  }
  for (const key in formClass.properties) {
    var fieldModel = formClass.properties[key]
    fieldModel.key = key
    /* 填充字段的默认值 */
    var value = formData[key]
    if (fieldModel.type === 'array') {
      value = value || []
    } else if (fieldModel.type === 'object') {
      value = value || null
    } else if (fieldModel.type === 'boolean') {
      value = !!value
    } else if (tool.isUndef(value)) {
      value = null
    }
    /**
     * 针对静态可选项，由于后端出来的 StaticOption 的始终是
     * 字串类型的键值对，因此这里需强制将值转换为字串，否则
     * 对于以 boolean 或 integer 标识的开关(是/否)类选项将
     * 无法自动匹配
     */
    if (tool.toLower(fieldModel.fieldOptionsType) === 'static' &&
      (tool.isUndefOrNull(value) || tool.isNumber(value) || tool.isBoolean(value))) {
      value = tool.stringify(value)
    }
    fieldModel.value = value
    /* 处理标题相关的配置，显示、宽度、冒号等 */
    fieldModel.title = tool.trim(fieldModel.title)
    if (fieldModel.title.toLowerCase() === '<empty>') {
      fieldModel.title = ''
    }
    fieldModel.titleWithoutColon = false
    fieldModel.customTitleWithoutColon = tool.toLower(fieldModel.customTitleWithoutColon)
    if (fieldModel.customTitleWithoutColon &&
            fieldModel.customTitleWithoutColon !== '0' &&
            fieldModel.customTitleWithoutColon !== 'no' &&
            fieldModel.customTitleWithoutColon !== 'off' &&
            fieldModel.customTitleWithoutColon !== 'false') {
      fieldModel.titleWithoutColon = true
    }
    fieldModel.titleWidth = tool.parseInteger(fieldModel.customTitleWidth, '')
    /* 字段的显示及布局信息 */
    if (!tool.isBlank(fieldModel.customPosition)) {
      fieldModel.position = tool.parseInteger(fieldModel.customPosition, 0)
    }
    if (!tool.isBlank(fieldModel.customPlacement)) {
      fieldModel.placement = tool.parseInteger(fieldModel.customPlacement, '')
    }
    if (!tool.isBlank(fieldModel.customListWidth)) {
      fieldModel.listWidth = tool.parseInteger(fieldModel.customListWidth, '')
    }
    if (!tool.isBlank(fieldModel.customListPosition)) {
      fieldModel.listPosition = tool.parseInteger(fieldModel.customListPosition, 0)
    }
    if (!tool.isBlank(fieldModel.customPlacerows)) {
      fieldModel.placerows = tool.parseInteger(fieldModel.customPlacerows, '')
    }
    fieldModel.placement = tool.parseInteger(fieldModel.placement, '')
    fieldModel.listWidth = tool.parseInteger(fieldModel.listWidth, 0)
    fieldModel.listPosition = tool.parseInteger(fieldModel.listPosition, 0)
    fieldModel.placerows = tool.parseInteger(fieldModel.placerows, '')
    /* 填充字段的控件类型 */
    setFieldComponentType(fieldModel)
    /* 处理字段说明信息 */
    fieldModel.description = tool.trim(fieldModel.description)
    if (!fieldModel.contentip) {
      var description
      if ((description = tool.removeOrNull(/^\*+/, fieldModel.description))) {
        fieldModel.contentip = 'bottom'
        fieldModel.description = description
      } else if ((description = tool.removeOrNull(/^\#+/, fieldModel.description))) {
        fieldModel.contentip = 'top'
        fieldModel.description = description
      }
    }
    /* 填充字段的是否必填属性 */
    fieldModel.required = tool.inArray(key, formClass.required) >= 0
    /* 解析嵌套的动态选项值筛选表单 */
    if (fieldModel.dynamicFilterFormClass) {
      fieldModel.dynamicFilterFormClass = parseFormClass(fieldModel.dynamicFilterFormClass)
    }
    /* 解析嵌套的动态选项值创建表单 */
    if (fieldModel.listItemCreationFormClass) {
      fieldModel.listItemCreationFormClass = parseFormClass(fieldModel.listItemCreationFormClass)
      fieldModel.listItemCreationFormClass.eventFormType = 'EDIT'
      // console.log('listItemCreationFormClass 发现：', fieldModel.listItemCreationFormClass)
    }
    if (fieldModel.items && fieldModel.items.properties) {
      fieldModel.items = parseFormClass(fieldModel.items)
    }
    /* 格式验证模式处理 */
    if (!fieldModel.pattern && fieldModel.customPattern) {
      fieldModel.pattern = fieldModel.customPattern
    }
    /* 自定义显示模板处理 */
    if (!fieldModel.template && fieldModel.customTemplate) {
      fieldModel.template = fieldModel.customTemplate
    }
  }
  return formClass
}

/**
 * 根据表单的定义和默认数据，获取表单的可显示字段模型列表
 * @param {Object} formClass
 * @param {Object} formData
 * @param {Number} parser options
 */
export function getVisibleFieldModels(formClass, formData, options) {
  if (arguments.length < 3) {
    options = FORM_FIELD_OPTIONS.Default
    if (tool.isNumber(formData)) {
      options = formData
      formData = {}
    }
  }
  // console.log('界面模型可见字段解析，options = ', options)
  if (!tool.isNumber(options)) {
    throw new Error('第三个参数(options)必须为数字')
  }
  var fieldPosition = 'position'
  if ((options & FORM_FIELD_OPTIONS.ListFirst) !== 0 ||
       (options & FORM_FIELD_OPTIONS.ListOnly) !== 0) {
    fieldPosition = 'listPosition'
  }
  // console.log('界面模型可见字段解析，position field = ', fieldPosition)
  var formModel = parseFormClass(formClass, formData)
  if (tool.isBlank(formModel) || !formModel.properties) {
    return null
  }
  // console.log('表单模型数据如下：', formModel)
  var fieldModels = []
  var fieldNoSort = []
  var maxPosition = 0
  var fieldModel = null
  var fieldType = null
  var hiddenControlOrdered = false
  var showAllFields = (options & FORM_FIELD_OPTIONS.All) !== 0
  for (const key in formModel.properties) {
    fieldModel = formModel.properties[key]
    fieldType = tool.toLower(fieldModel.fieldType)
    var position = fieldModel[fieldPosition]
    if (tool.looksLikeInteger(position) && position > 0) {
      if (position > maxPosition) {
        maxPosition = position
      }
      fieldModels.push(fieldModel)
      if (fieldType === 'hidden') {
        hiddenControlOrdered = true
      }
    } else {
      if (showAllFields) {
        fieldNoSort.push(fieldModel)
      } else if (fieldType.indexOf('hidden') !== 0 &&
         fieldType !== 'separator' &&
         (tool.isBlank(position) || tool.trim(position) === '0')
      ) {
        /**
         * 针对未明确定义序号的字段，除功能控件外的有效字段均收集起来，
         * 追加到最后面
         */
        fieldNoSort.push(fieldModel)
      }
    }
  }

  /* 所有明确定义顺序的字段，确保按顺序存储，以便做后续的处理 */
  fieldModels.sort((a, b) => {
    return a[fieldPosition] - b[fieldPosition]
  })
  /**
   * 处理 HiddenIfAllEmpty 的字段
   */
  if (!showAllFields && (options & FORM_FIELD_OPTIONS.HiddenIfAllEmpty) !== 0) {
    var emptyHiddenFields = null
    var emptyRemovedFields = []
    fieldModels.push({ fieldType: 'hiddenIfAllEmpty' })
    for (fieldModel of fieldModels) {
      fieldType = tool.toLower(fieldModel.fieldType)
      if (fieldType.indexOf('hidden') === 0) {
        // console.log('发现隐藏控制字段：', fieldModel, emptyHiddenFields)
        if (emptyHiddenFields && emptyHiddenFields.length > 0) {
          var gfield
          var hasNonEmptyData = false
          for (gfield of emptyHiddenFields) {
            if ((fieldType === 'separator') ||
              tool.isBlank(gfield.value) ||
              (tool.isArray(gfield.value) && gfield.value.length <= 0) ||
              (tool.isPlainObject(gfield.value) && Object.keys(gfield.value).length <= 0)) {
              continue
            }
            // console.log('发现值非空的字段：', gfield)
            hasNonEmptyData = true
          }
          if (hasNonEmptyData) {
            for (gfield of emptyHiddenFields) {
              emptyRemovedFields.push(gfield)
            }
          }
        }
        emptyHiddenFields = null
        if (fieldType === 'hiddenifallempty') {
          emptyHiddenFields = []
        } else {
          emptyRemovedFields.push(fieldModel)
        }
      } else if (emptyHiddenFields) {
        emptyHiddenFields.push(fieldModel)
      } else {
        emptyRemovedFields.push(fieldModel)
      }
    }
    fieldModels = emptyRemovedFields
  }
  /**
   * 处理 HiddenIncluded
   */
  if (!showAllFields && (options & FORM_FIELD_OPTIONS.HiddenIncluded) === 0) {
    var hiddenRemovedFields = []
    var hiddenFieldsStarted = false
    for (fieldModel of fieldModels) {
      if ((fieldType = tool.toLower(fieldModel.fieldType)).indexOf('hidden') === 0) {
        hiddenFieldsStarted = false
        if (fieldType === 'hidden') {
          hiddenFieldsStarted = true
        }
      } else if (!hiddenFieldsStarted) {
        hiddenRemovedFields.push(fieldModel)
      }
    }
    fieldModels = hiddenRemovedFields
  }

  /**
   * 移除 hidden 开头的控制类型字段
   */
  if (!showAllFields) {
    var controlRemovedFields = []
    for (fieldModel of fieldModels) {
      if (tool.toLower(fieldModel.fieldType).indexOf('hidden') !== 0) {
        controlRemovedFields.push(fieldModel)
      }
    }
    fieldModels = controlRemovedFields
  }

  /**
   * 处理 SeparatorIncluded
   */
  if (!showAllFields && (options & FORM_FIELD_OPTIONS.SeparatorIncluded) === 0) {
    var separatorRemovedFields = []
    for (fieldModel of fieldModels) {
      if (tool.toLower(fieldModel.fieldType) !== 'separator') {
        separatorRemovedFields.push(fieldModel)
      }
    }
    fieldModels = separatorRemovedFields
  }

  /**
   * 针对列表优先的情况，在列表字段为空时，需要重新按照表单的形式重新计算
   */
  if ((options & FORM_FIELD_OPTIONS.ListFirst) !== 0 && fieldModels.length <= 0) {
    return getVisibleFieldModels(formClass, formData, options - FORM_FIELD_OPTIONS.ListFirst)
  }

  /**
   * 针对未明确排序的字段，如果存在 hidden 类型控制字段，则全部排除；
   * 另外，如果明确提供了 OrderUndefinedExcluded 选项时，全部排除；
   * 否则，将被追加到字段的最后面
   */
  var ignoreFields = [
    // 通用流程表单编号
    'id',
    // 通用流程表单版本
    'revision',
    // 通用流程表单状态
    'state',
    // 通用流程查询结果集大小
    'limit',
    // 通用流程查询结果集页码
    'page',
    // 可选项的 value 字段
    'optionValue',
    // 可选项的 label 字段
    'optionDisplay'
  ]
  // console.log('检查是否包含未排序字段：hiddenControlOrdered = ', hiddenControlOrdered, options)
  if (showAllFields || (!hiddenControlOrdered && (options & FORM_FIELD_OPTIONS.OrderUndefinedExcluded) === 0)) {
    fieldNoSort.sort((a, b) => {
      return b[fieldPosition] - a[fieldPosition]
    })
    for (fieldModel of fieldNoSort) {
      if (tool.isBlank(fieldModel.title) || tool.inArray(fieldModel.key, ignoreFields) >= 0) {
        if (!showAllFields) {
          continue
        }
      }
      // console.log('添加未排序字段：', fieldModel)
      maxPosition += 10
      fieldModel[fieldPosition] = maxPosition
      fieldModels.push(fieldModel)
    }
  }
  return fieldModels
}

/**
 * 根据字段模型及字段的值，获取文本的显示内容
 * @param {Object} fieldModel
 * @param {Object} fieldValue
 */
export function getFieldValueDisplay(fieldModel, fieldValue) {
  // console.log('正在获取字段的现实文本，参数信息如下：')
  // console.log(fieldValue)
  // console.log(fieldModel)
  if (tool.isNull(fieldValue) || tool.isUndef(fieldValue)) {
    return ''
  }
  if (!fieldModel) {
    return fieldValue
  }
  var clearEmptyObject = function(v) {
    if (tool.isArray(v) && v.length <= 0) {
      return ''
    } else if (tool.isPlainObject(v) && Object.keys(v).length <= 0) {
      return ''
    }
    return v
  }
  var textDisplay = fieldValue
  switch (fieldModel.fieldType) {
    case 'table':
    case 'Table':
    case 'tableview':
    case 'TableView':
      if (fieldModel.type === 'array' && tool.isArray(fieldValue)) {
        textDisplay = fieldValue.map(v => {
          if (v.display || v.optionDisplay) {
            return v.display || v.optionDisplay
          }
          return v
        })
        textDisplay = textDisplay.join(',')
      } else if (fieldModel.type === 'object' && (fieldValue.display || fieldValue.optionDisplay)) {
        textDisplay = fieldValue.display || fieldValue.optionDisplay
      }
      break
    default:
      if (tool.toLower(fieldModel.fieldOptionsType) === 'static') {
        var arrayValue = fieldValue
        if (!tool.isArray(arrayValue)) {
          arrayValue = [arrayValue]
        }
        var checker = function(a, v) {
          v = tool.stringify(v)
          return a && (v === a.value || v === a.optionValue)
        }
        textDisplay = []
        for (const val of arrayValue) {
          var findex = tool.inArray(val, fieldModel.staticOptions, checker)
          var ftext = findex >= 0 ? (fieldModel.staticOptions[findex].display ||
                      fieldModel.staticOptions[findex].optionDisplay) : val
          textDisplay.push(ftext)
          // console.log('静态选项值：', val, ', 显示文本：', ftext, ', 可选项有：', fieldModel.staticOptions)
        }
        textDisplay = textDisplay.join(',')
      } else if (tool.isBoolean(fieldValue)) {
        return fieldValue ? '是' : '否'
      }
      break
  }
  return clearEmptyObject(convertOptionToDisplay(textDisplay))
}

/**
 * 获取字段的占位格
 * @param {Object} fieldModel
 */
export function getFieldPlacement(fieldModel) {
  if (!fieldModel) {
    return 0
  }
  setFieldComponentType(fieldModel)
  return tool.parseInteger(fieldModel.placement, fieldModel.comSpan)
}
/**
 * 针对通用编辑页面中未设置 placement 的兼容性特殊处理
 * 目前只针对事件编辑页
 */
export function fixNoPlacementCompatibility(formModel) {
/* 为兼容 placement 出现之前的默认事件表单样式，为设置的统一使用整行 */
  if (formModel && formModel.properties) {
    for (const key in formModel.properties) {
      var field = formModel.properties[key]
      if (field && field.comSpan && !field.placement) {
        field.comSpan = 12
      }
    }
  }
  return formModel
}

/**
 * 将数据中所有包含 optionValue 的对象，转换成 optionValue 值
 */
export function convertOptionToValue(data, asDisplay) {
  if (tool.isPlainObject(data)) {
    if (asDisplay === true) {
      if (data.hasOwnProperty('optionDisplay')) {
        return data.optionDisplay
      }
    } else if (data.hasOwnProperty('optionValue')) {
      return data.optionValue
    }
    var valdata = {}
    for (const key of Object.keys(data)) {
      if (!data.hasOwnProperty(key)) {
        continue
      }
      valdata[key] = convertOptionToValue(data[key], asDisplay)
    }
    return valdata
  }
  if (tool.isArray(data)) {
    var valarr = []
    for (const item of data) {
      valarr.push(convertOptionToValue(item, asDisplay))
    }
    return valarr
  }
  return data
}
export function convertOptionToDisplay(data) {
  return convertOptionToValue(data, true)
}
