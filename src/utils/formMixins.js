var formMixin = {
  data() {
    return {
      pageData: { // 默认的分页信息
        limit: 10,
        page: 1
      },
      totalCount: 0, // 一共多少条数据
      actions: [],
      queries: [],
      filterParams: {}// 筛选组件的 v-model
    }
  },
  methods: {
    // table中column的数据format
    columnFmt(row, column, cellValue, index) {
      var ret = ''
      var item = this.queries.resultClass.properties[column.property]
      if (cellValue == null || !item) return ''
      switch (item.fieldType) {
        case 'Simple':
        case 'String':
          if (item.fieldOptionsType === 'NULL') {
            ret = cellValue
          } else if (item.fieldOptionsType === 'DYNAMIC') {
            // 动态取?
          } else {
            // 取静态值

            for (const iterator of item.staticOptions) {
              if (iterator.value === cellValue.toString()) {
                ret = iterator.display
                break
              }
            }
          }
          break

        case 'TableView':
          if (item.type === 'array') {
            ret = cellValue.map(item => {
              return item.display || item.optionDisplay
            }).toString()
          } else if (item.type === 'object') {
            ret = cellValue.display || cellValue.optionDisplay
          }
          break

        default:
          break
      }
      return ret.length ? ret : cellValue
    }
  }
}

export default formMixin
