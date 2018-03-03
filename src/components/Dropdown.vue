<template>
  <div @click.stop="clickHandler" class="ve-dropdown">
    <slot name="title">{{ title }}</slot>
    <div class="ve-dropdown-content" v-if="visable">
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: 'dropdown',
  props: {
    title: { type: String, default: '' }
  },
  data () {
    return {
      visable: false
    }
  },
  methods: {
    clickHandler () {
      this.visable = !this.visable
    }
  }
}
</script>
