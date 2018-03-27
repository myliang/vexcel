<template>
<div>
  <div class="ve-edit" :style="{left: `${left - 1}px`, top: `${top - 1}px`}" v-if="visable">
    <textarea autofocus :value="value.text"
      :style="[{'min-width': `${width}px`, width: `${width}px`, height: `${height}px`, 'line-height': `21px`}, cellStyle(value)]"
      @mousedown.stop="()=>{}"
      @input="updateValue($event.target.value)"
      @keydown.stop="keydownHandler"
      ref="input"></textarea>
    <div style="visibility: hidden; position: fixed; top: 0; left: 0;" ref="iw">{{ value.text }}</div>
  </div>
  <div v-if="showFormula"
    class="ve-autocomplete"
    :style="{left: `${left - 1}px`, top: `${top + height + 5}px`}">
    <div class="ve-menu vertical">
      <item-icon v-for="(formula, index) in formulas"
        :key="formula.key"
        :active="index === formulaActive"
        @click.stop.prevent="selectedHandler(formula)">
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
      formulaActive: -1,
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
      // console.log(':::', ow, offsetWidth)
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
      // this.value.text = '=' + formula.key + '()'
      this.changeHandler('=' + formula.key + '()')
      setTimeout(() => {
        this.$refs.input.selectionStart = formula.key.length + 2
        this.$refs.input.selectionEnd = formula.key.length + 2
      }, 10)
      this.showFormula = false
    },
    keydownHandler (evt) {
      if (evt.keyCode === 38) {
        // arrow up
        this.formulaActive--
        if (this.formulaActive < 0) {
          this.formulaActive = this.formulas.length
        }
      } else if (evt.keyCode === 40) {
        // arrow down
        this.formulaActive++
        if (this.formulaActive >= this.formulas.length) {
          this.formulaActive = -1
        }
      } else if (evt.keyCode === 39) {
        this.selectedHandler(this.formulas[this.formulaActive])
      }
      // console.log('evt:::', evt)
    },
    updateValue (v) {
      this.changeHandler(v)
    },
    changeHandler (v) {
      this.value.text = v
      if (v === '=') {
        this.showFormula = true
      } else {
        this.showFormula = false
      }
      setTimeout(() => {
        this.reload()
      }, 0)
    },
    cellStyle
  }
}
</script>
