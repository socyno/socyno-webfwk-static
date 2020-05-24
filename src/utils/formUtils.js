import tool from '@/utils/tools.js'

/**
 * 根据视图模型中的字段定义，或字段数据的显示文本
 *
 * @param {Object} fieldDefinition
 * @param {Object} fieldValue
 */
export function getFieldValueDisplay(fieldDefinition, fieldValue) {
  // console.log('Starting to parse form field display text ...')
  // console.log('The following is field definition and value:')
  // console.log(fieldDefinition)
  // console.log(fieldValue)
  if (tool.isUndefOrNull(fieldValue)) {
    return ''
  }
  if (!fieldDefinition || !fieldDefinition.fieldType) {
    return fieldValue
  }
  var display = fieldValue
  switch (fieldDefinition.fieldType) {
    case 'tableview':
      if (fieldDefinition.type === 'array' && tool.isArray(fieldValue)) {
        display = fieldValue.map(item => {
          return fieldDefinition.display || fieldDefinition.optionDisplay || item
        })
        display = display.join(',')
      } else if (fieldDefinition.type === 'object') {
        display = display.display || display.optionDisplay || display
      }
      break
    default:
      if (fieldDefinition.fieldOptionsType === 'STATIC' && tool.isArray(fieldDefinition.staticOptions)) {
        if (!tool.isArray(display)) {
          display = [display]
        }
        var result = []
        for (const iterator of display) {
          var soidx = tool.inArray(iterator, fieldDefinition.staticOptions, function(a, b) {
            return tool.stringify(b) === (a.value || a.optionValue)
          })
          if (soidx >= 0) {
            var option = fieldDefinition.staticOptions[soidx]
            result.push(option.display || option.optionDisplay)
          } else {
            result.push(iterator)
          }
        }
        display = result.join(',')
      }
      break
  }
  return display
}

/**
 * 解析通用表单视图模型解析
 * @param {Object} formClass
 */
export function parseFormClass(formClass) {
  if (tool.isString(formClass)) {
    formClass = JSON.parse(formClass)
  }
  if (!formClass.properties) {
    return formClass
  }
  for (const fieldKey in formClass.properties) {
    var fieldDef = formClass.properties[fieldKey]
    // console.log(fieldDef)
    /**
     * 标记字段唯一键
     */
    fieldDef.key = fieldKey
    /**
     * 标记字段类型
     */
    fieldDef.fieldType = tool.toLower(fieldDef.fieldType) || 'string'
    /**
     * 标记字段是否必填
     */
    fieldDef.required = ((tool.inArray(fieldKey, formClass.required)) >= 0)
    /**
     * 匹配合适的显示控件
     */
    switch (fieldDef.fieldType) {
      case '':
      case 'simple':
      case 'string':
      case 'boolean':
      case 'textline':
        if (fieldDef.fieldOptionsType === 'STATIC') {
          fieldDef.comType = (fieldDef.type === 'array' && tool.isArray(fieldDef.staticOptions) && fieldDef.staticOptions.length)
            ? 'checkbox' : 'select'
        } else if (fieldDef.fieldOptionsType === 'DYNAMIC') {
          fieldDef.comType = 'dynamicSelect'
        } else if (fieldDef.type === 'boolean') {
          fieldDef.comType = 'switch'
        } else {
          fieldDef.comType = 'input'
        }
        break
      case 'password':
        fieldDef.comType = 'password'
        break
      case 'text':
      case 'textarea':
        fieldDef.comType = 'areaText'
        break
      case 'file':
        fieldDef.comType = 'file'
        break
      case 'tableview':
        if (fieldDef.fieldOptionsType === 'STATIC') {
          fieldDef.comType = (fieldDef.type === 'array' && tool.isArray(fieldDef.staticOptions) && fieldDef.staticOptions.length)
            ? 'checkbox' : 'select'
        } else {
          fieldDef.comType = (fieldDef.type === 'array') ? 'tableview' : 'dynamicSelect'
        }
        break
      case 'dateonly':
        fieldDef.comType = 'DateOnly'
        break
      case 'datetime':
        fieldDef.comType = 'DateTime'
        break
      case 'timeonly':
        fieldDef.comType = 'TimeOnly'
        break
      default:
        break
    }
  }
  return formClass
}

/**
 * 获取视图模型中的可显示字段并排序后返回
 * @param {Object} formClass
 */
export function getSortedVisibleColumns(formClass) {
  var columns = []
  formClass = parseFormClass(formClass)
  if (!tool.isPlainObject(formClass.properties)) {
    return columns
  }
  for (const key in formClass.properties) {
    var iterator = formClass.properties[key]
    if (iterator.position && iterator.position > 0) {
      columns.push(iterator)
    }
  }
  columns.sort((a, b) => a.position - b.position)
  return columns
}
