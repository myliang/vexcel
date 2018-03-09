<template>
  <div :class="['ve-item', {'active': active}, {'disabled': disabled}]" @click="clickHandler">
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
    icon: { type: String },
    active: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  methods: {
    clickHandler (evt) {
      this.$emit('click', evt)
    }
  }
}
</script>
