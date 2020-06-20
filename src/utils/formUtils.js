import tool from '@/utils/tools.js'

/**
 * 根据字段模型，设置并返回字段的显示控件
 * @param {Object} fieldModel
 */
export function setFieldComponentType(fieldModel) {
  if (!fieldModel) {
    return
  }
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
    default:
      if (fieldModel.fieldOptionsType === 'DYNAMIC') {
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
export function parseFormClass(formClass, defaultData) {
  if (tool.isUndef(formClass) || tool.isNull(formClass)) {
    return formClass
  }
  formClass = tool.isString(formClass)
    ? JSON.parse(formClass) : tool.jsonCopy(formClass)
  if (!formClass.properties) {
    return formClass
  }
  // console.log('界面模型基本数据结构:', formClass)
  if (!defaultData) {
    defaultData = {}
  }
  /* 表单的默认宽度设置 10/12 */
  if (!formClass.placement && formClass.customPlacement) {
    formClass.placement = tool.parseInteger(formClass.customPlacement, 10)
  }
  for (const key in formClass.properties) {
    var fieldModel = formClass.properties[key]
    fieldModel.key = key
    /* 填充字段的默认值 */
    var value = defaultData[key]
    if (fieldModel.type === 'array') {
      value = value || []
    } else if (fieldModel.type === 'object') {
      value = value || null
    } else if (fieldModel.type === 'boolean') {
      value = !!value
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
    /* 处理空标题的特殊值 */
    fieldModel.title = tool.trim(fieldModel.title)
    if (fieldModel.title.toLowerCase() === '<empty>') {
      fieldModel.title = ''
    }
    fieldModel.smallTitle = false
    if (fieldModel.title.length < 2) {
      fieldModel.smallTitle = true
    }
    /* 布局信息, 长高信息 */
    if (!fieldModel.placement && fieldModel.customPlacement) {
      fieldModel.placement = fieldModel.customPlacement
    }
    if (!fieldModel.listWidth && fieldModel.customListWidth) {
      fieldModel.listWidth = fieldModel.customListWidth
    }
    if (!fieldModel.listPosition && fieldModel.customListPosition) {
      fieldModel.listPosition = fieldModel.customListPosition
    }
    if (!fieldModel.placerows && fieldModel.customPlacerows) {
      fieldModel.placerows = fieldModel.customPlacerows
    }
    fieldModel.placement = tool.parseInteger(fieldModel.placement, '')
    fieldModel.placerows = tool.parseInteger(fieldModel.placerows, '')
    fieldModel.listWidth = tool.parseInteger(fieldModel.listWidth, '')
    fieldModel.listPosition = tool.parseInteger(fieldModel.listPosition, '')
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
 * @param {String} style list(列表模式) | form(表单模式)
 * @param {Object} defaultData
 */
export function getVisibleFieldModels(formClass, style, defaultData) {
  var fieldPosition = 'position'
  if (tool.isString(style)) {
    if (style === 'list') {
      fieldPosition = 'listPosition'
    }
  } else if (arguments.length === 2) {
    defaultData = style
  }
  var formModel = parseFormClass(formClass, defaultData)
  if (tool.isBlank(formModel) || !formModel.properties) {
    return null
  }
  // console.log('表单模型数据如下：', formModel)
  var fieldModels = []
  var fieldNoSort = []
  var maxPosition = 0
  for (const key in formModel.properties) {
    var fieldModel = formModel.properties[key]
    var position = fieldModel[fieldPosition]
    if (tool.isBlank(position)) {
      fieldNoSort.push(fieldModel)
    } else if (position > 0) {
      if (position > maxPosition) {
        maxPosition = position
      }
      fieldModels.push(fieldModel)
    }
  }
  if (fieldPosition === 'listPosition' && fieldModels.length <= 0) {
    return getVisibleFieldModels(formClass, defaultData)
  }
  /* 返回前按排序设置进行排序 */
  fieldModels.sort((a, b) => {
    return a[fieldPosition] - b[fieldPosition]
  })
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
  for (const fieldModel of fieldNoSort) {
    if (tool.inArray(fieldModel.key, ignoreFields) >= 0) {
      continue
    }
    maxPosition += 10
    fieldModel[fieldPosition] = maxPosition
    fieldModels.push(fieldModel)
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
  return clearEmptyObject(convertOptionToDisplay(textDisplay, true))
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
