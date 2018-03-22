<template>
  <div class="ve-toolbar">
    <div class="ve-menu horizontal">
      <!-- <item-icon icon="undo" disabled></item-icon> -->
      <!-- <item-icon icon="redo" disabled></item-icon> -->
      <!-- <item-icon icon="print" @click="printHandler"></item-icon> -->
      <item-icon icon="paintformat" :active="paintFormatActive" @click="copyFormatHandler"></item-icon>
      <item-icon icon="clearformat" @click="clearFormatHandler"></item-icon>
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
      <dropdown :title="`${attrs.fontSize}`" class="ve-item" width="70px">
        <div class="ve-menu vertical">
          <item-icon v-for="fontSize in [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 30, 36]"
            :key="fontSize" @click="selectedHandler('fontSize', fontSize)" style="text-align: center;">
            {{ fontSize }}
          </item-icon>
        </div>
      </dropdown>
      <div class="ve-item-separator"></div>
      <item-icon icon="bold" :active="attrs.fontWeight === 'bold'" @click="radioHandler('fontWeight', 'bold')"></item-icon>
      <item-icon icon="italic" :active="attrs.fontStyle === 'italic'" @click="radioHandler('fontStyle', 'italic')"></item-icon>
      <item-icon icon="underline" :active="attrs.textDecoration === 'underline'" @click="radioHandler('textDecoration', 'underline')"></item-icon>
      <dropdown class="ve-item">
        <icon name="text-color" :style="{'border-bottom': `3px solid ${attrs.color}`, width: '18px', height: '16px'}" slot="title"></icon>
        <color-panel @change="selectedColorHandler"></color-panel>
      </dropdown>
      <div class="ve-item-separator"></div>
      <dropdown class="ve-item">
        <icon name="cell-color" :style="{'border-bottom': `3px solid ${attrs.backgroundColor}`, width: '18px', height: '16px'}" slot="title"></icon>
        <color-panel @change="selectedBackgroundColorHandler"></color-panel>
      </dropdown>
      <item-icon icon="merge" :active="attrs.rowspan > 1 || attrs.colspan > 1" @click="mergeHandler"></item-icon>
      <div class="ve-item-separator"></div>
      <dropdown class="ve-item" width="60px">
        <icon :name="`align-${attrs.align}`" :style="{width: '18px'}" slot="title"></icon>
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
        <icon :name="`valign-${attrs.valign}`" :style="{width: '18px'}" slot="title"></icon>
        <div class="ve-menu vertical">
          <item-icon v-for="valign in ['top', 'middle', 'bottom']"
            style="text-align: center;"
            :icon="`valign-${valign}`"
            :key="valign"
            @click="selectedHandler('valign', valign)">
          </item-icon>
        </div>
      </dropdown>
      <item-icon icon="textwrap" :active="attrs.wordWrap === 'break-word'" @click="radioHandler('wordWrap', 'break-word')"></item-icon>
      <div class="ve-item-separator"></div>
      <!-- <item-icon :icon="it" :key="it" v-for="it in ['autofilter']"></item-icon> -->
      <!-- <dropdown class="ve-item" width="160px">
        <icon name="formula" :style="{width: '18px'}" slot="title"></icon>
        <div class="ve-menu vertical">
          <item-icon v-for="formula in formulas"
            :key="formula.key"
            @click="selectedHandler('formula', formula.key)">
            {{ formula.key }} {{formula.title}}
          </item-icon>
        </div>
      </dropdown> -->
    </div>
  </div>
</template>
<script>
import ItemIcon from './base/ItemIcon.vue'
import Dropdown from './base/Dropdown.vue'
import Icon from './base/Icon.vue'
import ColorPanel from './base/ColorPanel.vue'
import { defaultCellAttrs } from './settings.js'
export default {
  name: 'excel-toolbar',
  components: {ItemIcon, Dropdown, Icon, ColorPanel},
  props: {
    formats: { type: Array, default: () => [] },
    fonts: { type: Array, default: () => [] },
    formulas: { type: Array, default: () => [] },
    attrs: { type: Object, default: () => {} }
  },
  data () {
    return {
      paintFormatActive: false
    }
  },
  computed: {
    fontTitle () {
      // console.log(this.attrs)
      return this.fonts.filter(f => f.key === (this.attrs.font))[0].title
    },
    formatTitle () {
      // console.log('>>>', this.attrs)
      return this.formats.filter(f => f.key === (this.attrs.format))[0].title
    }
  },
  methods: {
    radioHandler (key, v) {
      this.selectedHandler(key, this.attrs[key] === v ? defaultCellAttrs[key] : v)
    },
    mergeHandler () {
      this.$emit('change-merge')
    },
    clearFormatHandler () {
      // const attrs = Object.keys(defaultCellAttrs).map(key => {
      //   this.attrs[key] = defaultCellAttrs[key]
      //   return {key, v: defaultCellAttrs[key], isDefault: true}
      // })
      this.$emit('change', {})
    },
    copyFormatHandler () {
      this.paintFormatActive = !this.paintFormatActive
      this.$emit('change-paint', this.paintFormatActive)
    },
    clearPaintFormatActive () {
      this.paintFormatActive = false
    },
    selectedColorHandler (color) {
      this.selectedHandler('color', color)
    },
    selectedBackgroundColorHandler (color) {
      this.selectedHandler('backgroundColor', color)
    },
    selectedHandler (key, v) {
      this.attrs[key] = v
      // this.$emit('change', [{key, v, isDefault: v === defaultCellAttrs[key]}])
      const nAttrs = {}
      Object.keys(this.attrs).forEach(k => {
        if (defaultCellAttrs[k] !== this.attrs[k]) {
          nAttrs[k] = this.attrs[k]
        }
      })
      this.$emit('change', nAttrs)
    },
    printHandler () {
      window.print()
    }
  }
}
</script>
