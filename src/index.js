import './excel.less'

import Excel from './components/Excel.vue'

const install = function (Vue, opts = {}) {
  // console.log(component.name)
  Vue.component(Excel.name, Excel)
}

// auto install
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default Object.assign({}, {Excel}, {install})
