<template>
<div>
  <div class="ve-edit" :style="{left: `${left - 1}px`, top: `${top - 1}px`}" v-if="visable">
    <textarea autofocus :value="value.text"
      :style="[{'min-width': `${width}px`, width: `${width}px`, height: `${height}px`, 'line-height': `21px`}, cellStyle(value)]"
      @mousedown.stop="()=>{}"
      @input="updateValue($event.target.value)"
      ref="input"></textarea>
    <div style="visibility: hidden; position: fixed; top: 0; left: 0;" ref="iw">{{ value.text }}</div>
  </div>
  <div v-if="showFormula"
    :style="{left: `${left - 1}px`, top: `${top + height + 5}px`, position: 'absolute', background: '#fff', border: '1px solid #ccc', 'text-align': 'left'}">
    <div class="ve-menu vertical">
      <item-icon v-for="formula in formulas"
        :key="formula.key"
        @click.stop="selectedHandler(formula)">
        {{ formula.key }} {{formula.title}}
      </item-icon>
    </div>
  </div>
</div>
</template>
<script>
import ItemIcon from './base/ItemIcon.vue'
import { cellStyle } from './settings.js'
export default {
  name: 'excel-editor',
  components: {ItemIcon},
  props: {
    target: { type: HTMLElement },
    formulas: { type: Array },
    value: { type: Object }
  },
  data () {
    const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = this.target
    return {
      showFormula: false,
      visable: true,
      top: offsetTop,
      left: offsetLeft,
      width: offsetWidth - 8,
      height: offsetHeight - 2
    }
  },
  mounted () {
    this.reload()
  },
  methods: {
    reload () {
      // console.log('target:', this.target)
      const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = this.target
      this.top = offsetTop
      this.left = offsetLeft
      const clientWidth = document.documentElement.clientWidth
      const maxWidth = clientWidth - this.left - 24
      let ow = this.$refs.iw.offsetWidth + 16
      console.log(':::', ow, offsetWidth)
      if (ow > offsetWidth) {
        if (ow > maxWidth) {
          const h = (parseInt(ow / maxWidth) + 1) * 20
          if (h > offsetHeight) {
            this.$refs.input.style.height = `${h}px`
          } else {
            this.$refs.input.style.height = `${offsetHeight}px`
          }
          ow = maxWidth
        }
        this.$refs.input.style.width = `${ow}px`
      }
    },
    selectedHandler (formula) {
      this.value.text = '=' + formula.key + '()'
      // this.showFormula = false
      // setTimeout(() => {
      //   this.reload()
      // }, 0)
    },
    updateValue (v) {
      this.changeHandler(v)
    },
    changeHandler (v) {
      this.value.text = v
      // if (v[0] === '=') {
      //   this.showFormula = true
      // } else {
      //   this.showFormula = false
      // }
      setTimeout(() => {
        this.reload()
      }, 0)
    },
    cellStyle
  }
}
</script>
