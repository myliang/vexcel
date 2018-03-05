<template>
  <div @click="clickHandler" class="ve-dropdown" ref="dropdown" v-clickoutside="awayHandler">
    <div class="ve-dropdown-header">
      <slot name="title">{{ title }}</slot>
      <icon name="arrow-down"/>
    </div>
    <div class="ve-dropdown-content" :style="{width: width}" v-if="visable" @click.stop="awayHandler">
      <slot></slot>
    </div>
  </div>
</template>
<script>
import clickoutside from '../directives/clickoutside'
import Icon from './Icon.vue'
export default {
  name: 'dropdown',
  components: {Icon},
  directives: { clickoutside },
  props: {
    title: { type: String, default: '' },
    width: { type: String, default: '120px' }
  },
  data () {
    return {
      visable: false
    }
  },
  methods: {
    clickHandler (evt) {
      this.visable = !this.visable
    },
    awayHandler () {
      this.visable = false
    }
  }
}
</script>
