// 字段排序
export function fieldOrder(sortObj, sortField = 'position') {
  // console.log('--1--', sortObj)
  sortObj = sortObj || null
  if (!sortObj) return {}
  var sortArray = []
  for (var key in sortObj) {
    if (sortObj[key][sortField]) {
      sortArray.push({
        key: key,
        order: sortObj[key][sortField]
      })
    }
  }
  var result = {}
  sortArray.sort((n, o) => n.order - o.order)
  sortArray.forEach(t => {
    result[t.key] = sortObj[t.key]
  })
  // console.log('--2--', result)
  return result
}

// 表单展示排序
export function formFieldOrder(sortObj, sortField = 'position') {
  // 需要显示一行的字段
  var linesField = ['TEXT', 'TEXTLINE']
  var sorts = fieldOrder(sortObj, sortField)
  var lineTxt = ''
  var linesTxt = ''
  var attachment = ''
  var tableItems = []
  for (var key in sorts) {
    if (sorts[key].position < 0) continue
    if (linesField.indexOf(sorts[key].fieldType) > -1) {
      linesTxt += `,"${key}":${JSON.stringify(sorts[key])}`
    } else if (sorts[key].fieldType === 'File') {
      attachment += `,"${key}":${JSON.stringify(sorts[key])}`
    } else if (sorts[key].fieldType === 'TableView' && sorts[key].type === 'array') { // TableView && array 才表格形式显示
      sorts[key].key = key
      tableItems.push(sorts[key])
    } else {
      lineTxt += `,"${key}":${JSON.stringify(sorts[key])}`
    }
  }
  return {
    wholeLine: JSON.parse(`{${lineTxt.substr(1)}}`),
    multiLine: JSON.parse(`{${linesTxt.substr(1)}}`),
    attachment: JSON.parse(`{${attachment.substr(1)}}`),
    tableItems
  }
}

// 根据对象获取字段类型
export function getFieldType(fieldObj) {
  if (!fieldObj) return 'input'
  if (fieldObj.fieldType === 'Date' || fieldObj.fieldType === 'DateOnly') {
    return 'date'
  } else if (fieldObj.fieldType === 'TimeOnly') {
    return 'time'
  } else if (fieldObj.fieldType === 'DATERANGE') {
    return 'daterange'
  } else if (fieldObj.fieldType === 'DateTime') {
    return 'datetime'
  } else if (fieldObj.fieldType === 'TEXT') {
    return 'textarea'
  } else if (fieldObj.fieldType === 'Simple' && fieldObj.staticOptions && fieldObj.staticOptions.length > 0) {
    return 'select'
  } else if (fieldObj.fieldType === 'PASSWORD') {
    return 'password'
  } else if (fieldObj.fieldType === 'File') {
    return 'file'
  } else if (fieldObj.fieldType === 'TableView') {
    return 'tableView'
  } else if (fieldObj.fieldType === 'Subsystem:idd') {
    return 'system'
  } else if (fieldObj.fieldType === 'USER') {
    return 'input'
  } else {
    return 'input'
  }
}
