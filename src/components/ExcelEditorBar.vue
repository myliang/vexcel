<template>
  <div class="ve-editor-bar" :style="style" ref="bar">
    <div class="ve-formula-bar">
      <div class="ve-formula-label">
        {{ cell || 'A1' }}
      </div>
      <textarea :value="value && value.text || ''" @input="updateValue($event.target.value)"></textarea>
    </div>
    <div class="ve-formula-bar-resizer" @mousedown.left="mousedownHandler">
    </div>
  </div>
</template>
<script>
export default {
  name: 'excecl-editor-bar',
  props: {
    cell: { type: String },
    value: { type: Object }
  },
  data () {
    return {
      style: {},
      startEvent: null
    }
  },
  mounted () {
    window.addEventListener('mouseup', this.mouseupHandler)
  },
  destroyed () {
    window.removeEventListener('mouseup', this.mouseupHandler)
  },
  methods: {
    mousedownHandler (evt) {
      this.startEvent = evt
      window.addEventListener('mousemove', this.mousemoveHandler)
    },
    mousemoveHandler (evt) {
      const { bar } = this.$refs
      // console.log(':::::', bar.offsetHeight, evt.y - this.startEvent.y)
      const nheight = bar.offsetHeight + (evt.y - this.startEvent.y)
      if (nheight > 150 || nheight < 26) return
      this.style = { height: `${nheight}px`, 'line-height': `${nheight}px` }
      this.startEvent = evt
    },
    mouseupHandler () {
      window.removeEventListener('mousemove', this.mousemoveHandler)
    },
    updateValue (v) {
      this.changeHandler(v)
    },
    changeHandler (v) {
      this.value.text = v
    }
  }
}
</script>
