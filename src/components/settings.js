const formats = [
  {key: 'normal', title: '常规'},
  {key: 'text', title: '纯文本'},
  {key: 'number', title: '数字', label: '1,000.12'},
  {key: 'percent', title: '百分比', label: '10.12%'},
  {key: 'scientific', title: '科学计数', label: '1.01E+03'},
  {key: 'RMB', title: '人民币', label: '￥10.00'},
  {key: 'USD', title: '美元', label: '$10.00'},
  {key: 'HK', title: '港币', label: 'HK$10.00'},
  {key: 'time', title: '时间', label: '00:00:00'},
  {key: 'date', title: '日期', label: '2016/12/12'},
  {key: 'dateTime', title: '日期时间', label: '2016/12/12 00:00:00'}
]
const fonts = [
  {key: 'Microsoft YaHei', title: '微软雅黑'},
  {key: 'STFangsong', title: '华文仿宋'},
  {key: 'Comic Sans MS', title: 'Comic Sans MS'},
  {key: 'Arial', title: 'Arial'},
  {key: 'Courier New', title: 'Courier New'},
  {key: 'Verdana', title: 'Verdana'}
]
const formulas = [
  {key: 'SUM', title: '求和'},
  {key: 'AVERAGE', title: '平均值'},
  {key: 'MAX', title: '最大值'},
  {key: 'MIN', title: '最小值'}
]

const defaultCellAttrs = {
  font: fonts[0].key,
  format: formats[0].key,
  fontSize: 14,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  color: '#666',
  backgroundColor: '#fff',
  align: 'left',
  valign: 'middle',
  wordWrap: 'normal',
  formula: '',
  invisable: false,
  rowspan: 1,
  colspan: 1
}

const cellStyle = (attrs) => {
  const style = {}
  if (attrs) {
    if (attrs.font) style['font-family'] = attrs.font
    if (attrs.fontSize) style['font-size'] = `${attrs.fontSize}px`
    if (attrs.fontWeight) style['font-weight'] = attrs.fontWeight
    if (attrs.fontStyle) style['font-style'] = attrs.fontStyle
    if (attrs.textDecoration) style['text-decoration'] = attrs.textDecoration
    if (attrs.color) style['color'] = attrs.color
    if (attrs.backgroundColor) style['background-color'] = attrs.backgroundColor
    if (attrs.align) style['text-align'] = attrs.align
    if (attrs.valign) style['vertical-align'] = attrs.valign
    if (attrs.invisable) {
      style['display'] = 'none'
    }
    if (attrs.wordWrap) {
      style['word-wrap'] = attrs.wordWrap
      style['white-space'] = 'normal'
    }
  }
  // console.log('style:', style)
  return style
}

const keyIsStyleAttr = (key) => {
  return key !== 'formula' && key !== 'rowspan' && key !== 'colspan' && key !== 'text'
}

const filterStyleAttrs = (attrs) => {
  const style = {}
  Object.keys(defaultCellAttrs).forEach(key => {
    // console.log('key: ', key)
    if (keyIsStyleAttr(key)) {
      if (attrs[key] !== defaultCellAttrs[key]) {
        style[key] = attrs[key]
      }
    }
  })
  return style
}

const getStyleAttrs = (attrs) => {
  const style = {}
  Object.keys(attrs).forEach(key => {
    if (keyIsStyleAttr(key)) {
      style[key] = attrs[key]
    }
  })
  return style
}

const compareStyleAttrs = (attrs, cb) => {
  Object.keys(defaultCellAttrs).forEach(key => {
    if (keyIsStyleAttr(key)) {
      cb(key, attrs[key], attrs[key] === defaultCellAttrs[key])
    }
  })
}

const defaultCols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

export {
  defaultCols,
  formats,
  fonts,
  formulas,
  defaultCellAttrs,
  cellStyle,
  filterStyleAttrs,
  compareStyleAttrs,
  getStyleAttrs
}
