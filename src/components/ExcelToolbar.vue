<template>
  <div class="ve-toolbar">
    <div class="ve-menu horizontal">
      <item-icon :icon="it" :key="it" v-for="it in ['undo', 'redo', 'print', 'paintformat', 'clearformat']"></item-icon>
      <dropdown :title="formatTitle" class="ve-item" width="250px">
        <div class="ve-menu vertical">
          <item-icon v-for="(format, index) in formats" :key="index" @click="selectedHandler('format', format.key)">
            {{format.title}}
            <div class="label">{{format.label}}</div>
          </item-icon>
        </div>
      </dropdown>
      <div class="ve-item-separator"></div>
      <dropdown :title="fontTitle" class="ve-item" width="170px">
        <div class="ve-menu vertical">
          <item-icon v-for="(font, index) in fonts" :key="index" @click="selectedHandler('font', font.key)">
            {{ font.title }}
          </item-icon>
        </div>
      </dropdown>
      <dropdown :title="`${styleAttrs.fontSize}`" class="ve-item" width="70px">
        <div class="ve-menu vertical">
          <item-icon v-for="fontSize in [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 30, 36]"
            :key="fontSize" @click="selectedHandler('fontSize', fontSize)" style="text-align: center;">
            {{ fontSize }}
          </item-icon>
        </div>
      </dropdown>
      <div class="ve-item-separator"></div>
      <item-icon :icon="it" :key="it" v-for="it in ['bold', 'italic', 'underline', 'strikethrough']"></item-icon>
      <dropdown class="ve-item">
        <icon name="text-color" :style="{'border-bottom': `3px solid ${styleAttrs.color}`, width: '18px', height: '16px'}" slot="title"></icon>
        <color-panel @change="selectedColorHandler"></color-panel>
      </dropdown>
      <div class="ve-item-separator"></div>
      <dropdown class="ve-item">
        <icon name="cell-color" :style="{'border-bottom': `3px solid ${styleAttrs.backgroundColor}`, width: '18px', height: '16px'}" slot="title"></icon>
        <color-panel @change="selectedBackgroundColorHandler"></color-panel>
      </dropdown>
      <item-icon :icon="it" :key="it" v-for="it in ['merge']"></item-icon>
      <div class="ve-item-separator"></div>
      <dropdown class="ve-item" width="60px">
        <icon :name="`align-${styleAttrs.align}`" :style="{width: '18px'}" slot="title"></icon>
        <div class="ve-menu vertical">
          <item-icon v-for="align in ['left', 'center', 'right']"
            style="text-align: center;"
            :icon="`align-${align}`"
            :key="align"
            @click="selectedHandler('align', align)">
          </item-icon>
        </div>
      </dropdown>
      <dropdown class="ve-item" width="60px">
        <icon :name="`valign-${styleAttrs.valign}`" :style="{width: '18px'}" slot="title"></icon>
        <div class="ve-menu vertical">
          <item-icon v-for="valign in ['top', 'middle', 'bottom']"
            style="text-align: center;"
            :icon="`valign-${valign}`"
            :key="valign"
            @click="selectedHandler('valign', valign)">
          </item-icon>
        </div>
      </dropdown>
      <item-icon :icon="it" :key="it" v-for="it in ['textwrap']"></item-icon>
      <div class="ve-item-separator"></div>
      <!-- <item-icon :icon="it" :key="it" v-for="it in ['autofilter']"></item-icon> -->
      <dropdown class="ve-item" width="160px">
        <icon name="formula" :style="{width: '18px'}" slot="title"></icon>
        <div class="ve-menu vertical">
          <item-icon v-for="formula in formulas"
            :key="formula.key"
            @click="selectedHandler('formula', formula.key)">
            {{ formula.key }} {{formula.title}}
          </item-icon>
        </div>
      </dropdown>
    </div>
  </div>
</template>
<script>
import ItemIcon from './ItemIcon.vue'
import Dropdown from './Dropdown.vue'
import Icon from './Icon.vue'
import ColorPanel from './ColorPanel.vue'
export default {
  name: 'excel-toolbar',
  components: {ItemIcon, Dropdown, Icon, ColorPanel},
  props: {
    formats: { type: Array, default: () => [] },
    fonts: { type: Array, default: () => [] },
    formulas: { type: Array, default: () => [] },
    styleAttrs: { type: Object, default: () => {} }
  },
  computed: {
    fontTitle () {
      return this.fonts.filter(f => f.key === this.styleAttrs.font)[0].title
    },
    formatTitle () {
      return this.formats.filter(f => f.key === this.styleAttrs.format)[0].title
    }
  },
  methods: {
    selectedColorHandler (color) {
      this.selectedHandler('color', color)
    },
    selectedBackgroundColorHandler (color) {
      this.selectedHandler('backgroundColor', color)
    },
    selectedHandler (key, v) {
      this.styleAttrs[key] = v
      this.$emit('change', this.styleAttrs)
    }
  }
}
</script>
