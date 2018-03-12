<template>
  <div class="ve-edit" :style="{left: `${left - 1}px`, top: `${top - 1}px`}" v-if="visable">
    <textarea autofocus :value="value.text"
      :style="[{width: `${width - 8}px`, height: `${height - 2}px`, 'line-height': `20px`}, cellStyle(value)]"
      @mousedown.stop="()=>{}"
      @input="updateValue($event.target.value)"></textarea>
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
      width: offsetWidth,
      height: offsetHeight
    }
  },
  watch: {
    value (nval, oval) {
      // console.log('nval:', nval)
    }
  },
  methods: {
    reload () {
      // console.log('target:', this.target)
      const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = this.target
      this.top = offsetTop
      this.left = offsetLeft
      this.width = offsetWidth
      this.height = offsetHeight
    },
    updateValue (v) {
      this.changeHandler(v)
    },
    changeHandler (v) {
      this.value.text = v
    },
    cellStyle
  }
}
</script>
