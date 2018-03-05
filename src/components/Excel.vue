<template>
  <div class="v-excel">
    <div class="ve-bars">
      <excel-toolbar
        :formats="formats"
        :fonts="fonts"
        :selectedFormat="toolbar.format"
        :selectedFont="toolbar.font"
        :selectedFontSize="toolbar.fontSize"
        @change-format="changeFormatHandler"
        @change-font="changeFontHandler"
        @change-font-size="changeFontSizeHandler"
        ></excel-toolbar>
      <excel-editor-bar
        :cell="editorBar.cell"
        v-model="editorBar.value"
        v-if="editorBar">
      </excel-editor-bar>
    </div>
    <div class="ve-header">
      <table>
        <colgroup>
          <col width="60"/>
          <col
            v-for="(col, index) in data.cols"
            :width="col.width"
            :key="col.index"
            :ref="`col_${index}`"/>
        </colgroup>
        <thead>
          <tr>
            <th>&nbsp;</th>
            <th v-for="(col, index) in data.cols"
              :key="col.index"
              :ref="`col_h${index}`"
              @mouseover="rowColMouseOverHandler('col', index, $event)">{{col.index}}</th>
          </tr>
        </thead>
      </table>
      <excel-resizer
        vertical
        :target="colResizer.target"
        :index="colResizer.index"
        @change="colChangeResizerHandler"
        v-if="colResizer && colResizer.target">
      </excel-resizer>
    </div>
    <div class="ve-body" ref="body">
      <table>
        <colgroup>
          <col width="60"/>
          <col
            v-for="(col, index) in data.cols"
            :width="col.width"
            :key="col.index"
            :ref="`col_${index}`"/>
        </colgroup>
        <tbody>
          <tr v-for="(row, rindex) in data.rows" :key="rindex">
            <td :ref="`row_${rindex}`"
              :height="row.height"
              @mouseover="rowColMouseOverHandler('row', rindex, $event)">{{rindex + 1}}</td>
            <td v-for="(col, cindex) in data.cols" :key="col.index" :ref="`cell_${rindex}_${cindex}`"
              :row-index="rindex" :col-index="cindex" type="cell"
              @dblclick.left.stop="cellDblclickHandler(rindex, cindex, $event)"
              @mousedown.left="cellMousedownHandler(rindex, cindex, $event)">
              {{ data[rindex] && data[rindex][cindex] && data[rindex][cindex].text || '' }}
            </td>
          </tr>
        </tbody>
      </table>
      <excel-border ref="eborder">
      </excel-border>
      <excel-editor
        :target="editor.target"
        v-model="editor.value"
        v-if="editor && editor.target">
      </excel-editor>
      <excel-resizer
        :target="rowResizer.target"
        :index="rowResizer.index"
        @change="rowChangeResizerHandler"
        v-if="rowResizer && rowResizer.target">
      </excel-resizer>
    </div>
  </div>
</template>
<script>
import ExcelBorder from './ExcelBorder'
import ExcelEditor from './ExcelEditor'
import ExcelResizer from './ExcelResizer'
import ExcelEditorBar from './ExcelEditorBar'
import ExcelToolbar from './ExcelToolbar'
import { defaultCols, formats, fonts } from './settings.js'

export default {
  name: 'v-excel',
  components: {
    ExcelBorder,
    ExcelEditor,
    ExcelResizer,
    ExcelEditorBar,
    ExcelToolbar
  },
  props: {
    formats: { type: Array, default: () => formats },
    fonts: { type: Array, default: () => fonts },
    data: { type: Object, default: () => { return {} } } // [[{text: '', type: '', style: ''}]..]
  },
  data () {
    const { data } = this
    const defaultColWidth = 100
    if (data.cols === undefined) {
      data.cols = defaultCols.map((col, index) => {
        return {width: defaultColWidth, index: col}
      })
    }
    if (data.rows === undefined) {
      const max = (((Object.keys(data).length - 1) / defaultColWidth) + 1) * 100
      data.rows = []
      for (let i = 0; i < max; i++) {
        data.rows[i] = {height: 22}
      }
    }
    return {
      editor: {},
      editorBar: {},
      rowResizer: null,
      colResizer: null,
      toolbar: {font: this.fonts[0], format: this.formats[0], fontSize: 10}
    }
  },
  mounted () {
  },
  methods: {
    rowColMouseOverHandler (type, index, evt) {
      // mouse key left pressed
      if (evt.buttons !== 1) {
        console.log(index)
        this[`${type}Resizer`] = {target: evt.target, index}
      }
    },
    colChangeResizerHandler (index, distance) {
      const { data } = this
      const w = data.cols[index].width + distance
      if (w <= 50) return
      data.cols[index].width = w
      this.$refs[`col_${index}`].forEach(c => {
        c.width = w
      })
      this.$refs.eborder.reload()
    },
    rowChangeResizerHandler (index, distance) {
      const { data } = this
      const h = data.rows[index].height + distance
      if (h <= 22) return
      data.rows[index].height = h
      this.$refs[`row_${index}`].forEach(c => {
        c.height = h
      })
      this.$refs.eborder.reload()
    },
    cellDblclickHandler (row, col, evt) {
      this.editor = {target: evt.target, value: this.getEditValue(row, col)}
    },
    cellMousedownHandler (row, col, evt) {
      this.editor = null
      if (!evt.shiftKey) {
        this.editorBar = {cell: `${this.data.cols[col].index}${row + 1}`, value: this.getEditValue(row, col)}
      }
    },
    changeFormatHandler (format) {
      this.toolbar.format = format
    },
    changeFontHandler (font) {
      this.toolbar.font = font
    },
    changeFontSizeHandler (fontSize) {
      this.toolbar.fontSize = fontSize
    },
    getEditValue (row, col) {
      this.data[row] = this.data[row] || {}
      this.data[row][col] = this.data[row][col] || {text: ''}
      return this.data[row][col]
    }
  }
}
</script>
