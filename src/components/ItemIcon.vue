<template>
  <div class="ve-item">
    <icon :name="icon"/>
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
  }
}
</script>
