<template>
  <div class="ve-toolbar">
    <div class="ve-menu horizontal">
      <item-icon :icon="it" :key="it" v-for="it in ['undo', 'redo', 'print', 'paintformat', 'clearformat']"></item-icon>
      <dropdown :title="selectedFormat.title" class="ve-item" width="250px">
        <div class="ve-menu vertical">
          <item-icon v-for="(format, index) in formats" :key="index" @click="selectFormatHandler(format)">
            {{format.title}}
            <div class="label">{{format.label}}</div>
          </item-icon>
        </div>
      </dropdown>
      <div class="ve-item-separator"></div>
      <dropdown :title="selectedFont.title" class="ve-item" width="170px">
        <div class="ve-menu vertical">
          <item-icon v-for="(font, index) in fonts" :key="index" @click="selectFontHandler(font)">
            {{ font.title }}
          </item-icon>
        </div>
      </dropdown>
      <dropdown :title="`${selectedFontSize}`" class="ve-item" width="70px">
        <div class="ve-menu vertical">
          <item-icon v-for="fontSize in [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 30, 36]"
            :key="fontSize" @click="selectFontSizeHandler(fontSize)" style="text-align: center;">
            {{ fontSize }}
          </item-icon>
        </div>
      </dropdown>
      <div class="ve-item-separator"></div>
      <item-icon :icon="it" :key="it" v-for="it in ['bold', 'italic', 'underline', 'strikethrough', 'text-color']"></item-icon>
      <div class="ve-item-separator"></div>
      <item-icon :icon="it" :key="it" v-for="it in ['cell-color', 'merge']"></item-icon>
      <div class="ve-item-separator"></div>
      <item-icon :icon="it" :key="it" v-for="it in ['align-left', 'valign-middle', 'textwrap']"></item-icon>
      <div class="ve-item-separator"></div>
      <item-icon :icon="it" :key="it" v-for="it in ['autofilter', 'formula']"></item-icon>
    </div>
  </div>
</template>
<script>
import ItemIcon from './ItemIcon.vue'
import Dropdown from './Dropdown.vue'
export default {
  name: 'excel-toolbar',
  components: {ItemIcon, Dropdown},
  props: {
    formats: { type: Array, default: () => [] },
    fonts: { type: Array, default: () => [] },
    selectedFormat: { type: Object },
    selectedFont: { type: Object },
    selectedFontSize: { type: Number }
  },
  methods: {
    selectFormatHandler (format) {
      this.$emit('change-format', format)
    },
    selectFontHandler (font) {
      this.$emit('change-font', font)
    },
    selectFontSizeHandler (fontSize) {
      this.$emit('change-font-size', fontSize)
    }
  }
}
</script>
