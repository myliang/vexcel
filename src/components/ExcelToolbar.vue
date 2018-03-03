<template>
  <div class="ve-toolbar">
    <div class="ve-menu horizontal">
      <item-icon :it="it" :key="it" v-for="it in ['undo', 'redo', 'print', 'paintformat', 'clearformat']"></item-icon>
      <div class="ve-item-separator"></div>
      <item-icon :it="it" :key="it" v-for="it in ['bold', 'italic', 'underline', 'strikethrough', 'text-color']"></item-icon>
      <div class="ve-item-separator"></div>
      <item-icon :it="it" :key="it" v-for="it in ['cell-color', 'merge']"></item-icon>
      <div class="ve-item-separator"></div>
      <item-icon :it="it" :key="it" v-for="it in ['align-left', 'valign-middle', 'textwrap']"></item-icon>
      <div class="ve-item-separator"></div>
      <item-icon :it="it" :key="it" v-for="it in ['autofilter', 'formula']"></item-icon>
    </div>
  </div>
</template>
<script>
import ItemIcon from './ItemIcon.vue'
export default {
  name: 'excel-toolbar',
  components: {ItemIcon}
}
</script>
