<template>
  <div class="ve-editor-bar">
    <div class="ve-formula-bar">
      <div class="ve-formula-label">
        {{ cell || 'A1' }}
      </div>
      <textarea :value="value && value.text || ''" @input="updateValue($event.target.value)"></textarea>
    </div>
    <div class="ve-formula-bar-resizer">
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
