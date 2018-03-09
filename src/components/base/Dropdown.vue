<template>
  <div class="ve-dropdown" ref="dropdown" v-clickoutside="awayHandler">
    <div class="ve-dropdown-header">
      <div class="ve-dropdown-title" v-if="title">{{ title }}</div>
      <slot name="title"></slot>
      <div class="ve-dropdown-icon" @click="clickHandler">
        <icon name="arrow-down"/>
      </div>
    </div>
    <div class="ve-dropdown-content" :style="{width: width}" v-if="visable" @click.stop="awayHandler">
      <slot></slot>
    </div>
  </div>
</template>
<script>
import clickoutside from '../../directives/clickoutside'
import Icon from './Icon.vue'
export default {
  name: 'dropdown',
  components: {Icon},
  directives: { clickoutside },
  props: {
    title: { type: String, default: '' },
    width: { type: String, default: 'auto' }
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
