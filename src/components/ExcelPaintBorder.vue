<template>
  <div class="ve-paint-border"
    :style="{left: `${target.offsetLeft - 1}px`, top: `${target.offsetTop - 1}px`, width: `${target.offsetwidth - 8}px`, height: `${target.offsetHeight - 2}px`}"
    v-if="target">
  </div>
</template>
<script>
export default {
  name: 'excel-paint-border',
  props: {
    target: { type: HTMLElement }
  }
}
</script>
