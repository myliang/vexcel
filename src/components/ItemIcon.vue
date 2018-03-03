<template>
  <div class="ve-item">
    <div class="ve-icon">
      <div :class="['ve-icon-img', it]"></div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'menu-item-icon',
  props: {
    it: { type: String }
  }
}
</script>
