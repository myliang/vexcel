<template>
  <div class="ve-edit" :style="{left: `${left}px`, top: `${top}px`}" v-if="visable">
    <textarea autofocus :value="value.text"
      :style="{width: `${width - 8}px`, height: `${height - 4}px`}"
      @mousedown.stop="()=>{}"
      @input="updateValue($event.target.value)"></textarea>
  </div>
</template>
<script>
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
  methods: {
    updateValue (v) {
      this.changeHandler(v)
    },
    changeHandler (v) {
      this.value.text = v
    }
  }
}
</script>
