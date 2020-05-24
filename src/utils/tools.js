const tool = {
  isFirefox() {
    return navigator.userAgent.toLowerCase().indexOf('firefox') > -1
  },

  /**
   * 基于 JSON 的数据复制
   * @param {Object} data
   */
  jsonCopy(data) {
    return JSON.parse(JSON.stringify(data))
  },

  /**
   * 获取标题
   * @param {String} subtitle
   */
  title(subtitle, apply) {
    var title = (window.$title || '简流程') + ' - ' + this.stringify(subtitle)
    if (apply === true) {
      document.title = title
    }
    return title
  },

  /* check string */
  isString(data) {
    return typeof (data) === 'string'
  },

  /* check number */
  isNumber(data) {
    return typeof (data) === 'number' && !isNaN(data)
  },

  /* check undefined */
  isUndef(data) {
    return typeof (data) === 'undefined'
  },

  isNull(data) {
    return data === null
  },

  /* check null or undefined */
  isUndefOrNull(v) {
    return this.isUndef(v) || this.isNull(v)
  },

  /* force to string */
  stringify(str) {
    if (this.isUndefOrNull(str)) {
      return ''
    }
    return '' + str
  },

  /* trim space on starts and ends */
  trim(str) {
    return this.remove(/^\s+|\s+$/, str)
  },

  /* replace all $regex to empty */
  remove(regex, str) {
    return this.stringify(str).replace(regex, '')
  },

  /* check blank */
  isEmpty(v) {
    return this.stringify(v).length === 0
  },

  /* check blank */
  isBlank(v) {
    return this.trim(v).length === 0
  },

  /**
   * default if blank
   */
  ifBlank(val, def) {
    return this.isBlank(val) ? def : val
  },

  /* check is boolean */
  isBoolean(data) {
    return typeof (data) === 'boolean'
  },
  /* looks like integer */
  looksLikeInteger(data) {
    return !!(((this.isNumber(data) || this.isString(data)) &&
      (data + '').match(/^[\-|\+]?\d+$/)))
  },

  /**
   * Check functiona
   */
  isFunction(func) {
    // console.log("Tool: checking function")
    // console.log(typeof func)
    return typeof func === 'function'
  },

  /**
   * 判断是否为标准数组，参考 jQuery 的实现
   */
  isArray(data) {
    if (this.isUndefOrNull(data)) {
      return false
    }
    if (Array.isArray) {
      return Array.isArray(data)
    }
    return this.toLower(data) === '[object array]'
  },

  /**
   * 判断是否被数组包含，通过 checker 参数可自定义比较规则
   * @param {Object} val
   * @param {Array} arr
   * @param {Function} checker
   * @return 返回匹配的首个数组下标，不包含则返回 -1
   */
  inArray(val, arr, checker) {
    if (!this.isFunction(checker)) {
      checker = function(a, b) {
        return a === b
      }
    }
    if (this.isArray(arr) && arr.length > 0) {
      for (var i = 0; i < arr.length; i++) {
        if (checker.call(this, arr[i], val)) {
          return i
        }
      }
    }
    return -1
  },

  /**
   * 判断是否为纯粹对象，参考 jQuery 的实现
   */
  isPlainObject(obj) {
    // 先确认是有效的对象
    if (!obj || this.toLower(obj) !== '[object object]') {
      return false
    }

    // 获取对象原型
    var protoType = Object.getPrototypeOf(obj)

    // 如果对象没有原型，那也算纯粹的对象，比如用 Object.create(null) 这种方式创建的对象
    if (!protoType) {
      return true
    }

    // 最后判断是不是通过 "{}" 或 "new Object" 方式创建的对象：
    //       判断给定对象的构造函数是否与 Object 的相同
    var constructor = Object.hasOwnProperty.call(protoType, 'constructor') && protoType.constructor

    // 通过调用 Function.prototype.toString 方法来确认构造器函数是否返回相同的字串值：类似 - "function Object() { [native code] }"
    var fun2String = Object.hasOwnProperty.toString
    return typeof constructor === 'function' && fun2String.call(constructor) === fun2String.call(Object)
  },

  /**
   * default if a === b
   * @param {Object} a
   * @param {Object} b
   * @param {Object} deflt
   * @return a === b ? deflt : a
   */
  defaultIfEquals(a, b, deflt) {
    return a === b ? deflt : a
  },

  /* check own property */
  hasOwnProperty(obj, pro) {
    return this.isUndef(obj) ? false : Object.hasOwnProperty.call(obj, pro)
  },

  /* parse integer, if error return NaN */
  parseInteger(number) {
    try {
      return parseInt(number)
    } catch (err) {
      return NaN
    }
  },

  /* string compare */
  stringEquals(a, b, ignoreCase, trimed) {
    a = this.stringify(a)
    b = this.stringify(b)
    if (trimed) {
      a = this.trim(a)
      b = this.trim(b)
    }
    if (ignoreCase) {
      a = a.toLowerCase()
      b = b.toLowerCase()
    }
    return a === b
  },

  stringEqualsIgnoreCase(a, b) {
    return this.stringEquals(a, b, true, false)
  },

  stringEqualsTrimed(a, b) {
    return this.stringEquals(a, b, false, true)
  },

  stringEqualsTrimedIgnoreCase(a, b) {
    return this.stringEquals(a, b, true, true)
  },

  /* escape & " < > */
  escape(data, space) {
    var text = this.stringify(data).replace(/&/g, '&amp;')
      .replace(/>/g, '&gt;')
      .replace(/</g, '&lt;')
      .replace(/\"/g, '&quot;')
    /* " */
    if (space) {
      // eslint-disable-next-line
      text = text.replace(/  /g, ' &nbsp;')
    }
    return text
  },

  /* same as escape, but replace ' to &apos; */
  escapeXML(data, space) {
    return this.escape(data, space).replace(/'/g, '&apos;')
  },

  /* escape for csv text */
  escapeCSV(str, trimed) {
    str = this.stringify(str).replace(/"/g, '""')
    return str.match(/["\,\s+]/) ? ('"' + str + '"') : str
  },

  /* encode URI */
  encodeURI(str) {
    return encodeURIComponent(str)
  },

  /* decode URI */
  decodeURI(str) {
    return decodeURIComponent(str)
  },

  /* escape URL */
  encodeURL(str) {
    return encodeURI(str)
  },

  /* decode URL */
  decodeURL(str) {
    return decodeURI(str)
  },

  /* escape regular expression */
  /* * . ? + $ ^ [ ] ( ) { } | \ / */
  escapeREG(str) {
    return this.stringify(str).replace(
      /([\*\.\+\$\^\[\]\(\)\{\}\\\|\/])/g,
      '\\$1'
    )
  },

  /* to lower case */
  toLower(str) {
    return this.stringify(str).toLowerCase()
  },

  /* to upper case */
  toUpper(str) {
    return this.stringify(str).toUpperCase()
  },

  /**
   * 用指定字符进行固定长度的前补全
   */
  lengthPrefixed(val, length, chr) {
    val = this.stringify(val)
    chr = this.stringify(chr)
    if (chr.length <= 0) {
      chr = ' '
    }
    while (val.length < length) {
      val = chr + val
    }
    return val
  },

  /**
   * 数组排序并去重
   * @param {Array} arr
   * @param {Function} checker
   * @param {Boolean} nocopy
   */
  arraySortAndUnique(arr, checker, nocopy) {
    if (!this.isArray(arr)) {
      return
    }
    if (this.isBoolean(checker)) {
      nocopy = checker
    }
    var uniqued = arr
    if (!nocopy) {
      uniqued = arr.concat([])
    }
    uniqued.sort()
    if (!this.isFunction(checker)) {
      checker = function(a, b) {
        return a === b
      }
    }
    for (var i = uniqued.length - 1; i >= 0; i--) {
      if (i > 0 && checker.call(this, uniqued[i], uniqued[i - 1])) {
        uniqued.splice(i, 1)
      }
    }
    return uniqued
  },

  /* 给数字中添加逗号 */
  formatNumber(num) {
    if (!/^(\+|\-)?(\d+)(\.\d+)?$/.test(num)) {
      return num
    }
    var a = RegExp.$1
    var b = RegExp.$2
    var c = RegExp.$3
    var re = /(\d)(\d{3})(,|$)/
    while (re.test(b)) {
      b = b.replace(re, '$1,$2$3')
    }
    return a + b + c
  }
}

export default tool
