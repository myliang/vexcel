<template>
  <div class="ve-icon">
    <div :class="['ve-icon-img', name]"></div>
  </div>
</template>
<script>
export default {
  name: 'icon',
  props: {
    name: { type: String }
  }
}
</script>
