<template>
  <div class="ve-item" @click="clickHandler">
    <icon :name="icon" v-if="icon"/>
    <slot></slot>
  </div>
</template>
<script>
import Icon from './Icon.vue'
export default {
  name: 'menu-item-icon',
  components: {Icon},
  props: {
    icon: { type: String }
  },
  methods: {
    clickHandler (evt) {
      this.$emit('click', evt)
    }
  }
}
</script>
