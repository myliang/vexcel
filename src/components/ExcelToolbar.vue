<template>
  <div class="ve-toolbar">
    <div class="ve-menu horizontal">
      <item-icon :icon="it" :key="it" v-for="it in ['undo', 'redo', 'print', 'paintformat', 'clearformat']"></item-icon>
      <dropdown :title="styleAttrs.format.title" class="ve-item" width="250px">
        <div class="ve-menu vertical">
          <item-icon v-for="(format, index) in formats" :key="index" @click="selectedHandler('format', format)">
            {{format.title}}
            <div class="label">{{format.label}}</div>
          </item-icon>
        </div>
      </dropdown>
      <div class="ve-item-separator"></div>
      <dropdown :title="styleAttrs.font.title" class="ve-item" width="170px">
        <div class="ve-menu vertical">
          <item-icon v-for="(font, index) in fonts" :key="index" @click="selectedHandler('font', font)">
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
        <icon :name="styleAttrs.align" :style="{width: '18px'}" slot="title"></icon>
        <div class="ve-menu vertical">
          <item-icon v-for="align in ['align-left', 'align-center', 'align-right']"
            style="text-align: center;"
            :icon="align"
            :key="align"
            @click="selectedHandler('align', align)">
          </item-icon>
        </div>
      </dropdown>
      <dropdown class="ve-item" width="60px">
        <icon :name="styleAttrs.valign" :style="{width: '18px'}" slot="title"></icon>
        <div class="ve-menu vertical">
          <item-icon v-for="valign in ['valign-top', 'valign-middle', 'valign-bottom']"
            style="text-align: center;"
            :icon="valign"
            :key="valign"
            @click="selectedHandler('valign', valign)">
          </item-icon>
        </div>
      </dropdown>
      <item-icon :icon="it" :key="it" v-for="it in ['textwrap']"></item-icon>
      <div class="ve-item-separator"></div>
      <item-icon :icon="it" :key="it" v-for="it in ['autofilter']"></item-icon>
      <dropdown class="ve-item" width="160px">
        <icon name="formula" :style="{width: '18px'}" slot="title"></icon>
        <div class="ve-menu vertical">
          <item-icon v-for="formula in formulas"
            :key="formula.key"
            @click="selectedHandler('formula', formula)">
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
    // font: { type: Strirng },
    // fontSize: { type: Number },
    // color: { type: String },
    // backgroundColor: { type: String }
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
    }
  }
}
</script>
