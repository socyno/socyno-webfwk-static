const tool = {
  isFirefox() {
    return navigator.userAgent.toLowerCase().indexOf('firefox') > -1
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
    return this.remove(str, /^\s+|\s+$/)
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
    return this.trim(this.stringify(v)).length === 0
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
