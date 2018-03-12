<template>
  <div class="ve-edit" :style="{left: `${left - 1}px`, top: `${top - 1}px`}" v-if="visable">
    <textarea autofocus :value="value.text"
      :style="[{'min-width': `${width}px`, width: `${width}px`, height: `${height}px`, 'line-height': `21px`}, cellStyle(value)]"
      @mousedown.stop="()=>{}"
      @input="updateValue($event.target.value)"
      ref="input"></textarea>
    <div style="visibility: hidden; position: fixed; top: 0; left: 0;" ref="iw">{{ value.text }}</div>
  </div>
</template>
<script>
import { cellStyle } from './settings.js'
export default {
  name: 'excel-editor',
  props: {
    target: { type: HTMLElement },
    value: { type: Object }
  },
  data () {
    const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = this.target
    return {
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
      let ow = this.$refs.iw.offsetWidth + 12
      // console.log(':::', ow, maxWidth, this.left, clientWidth)
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
    updateValue (v) {
      this.changeHandler(v)
    },
    changeHandler (v) {
      this.value.text = v
      this.reload()
    },
    cellStyle
  }
}
</script>
