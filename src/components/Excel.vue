<template>
  <div class="v-excel">
    <div class="ve-bars">
      <excel-toolbar
        :formats="formats"
        :fonts="fonts"
        :formulas="formulas"
        :attrs="cellAttrs"
        @change="changeToolbarHandler"
        @change-paint="changePaintHandler"
        ref="toolbar"
        v-if="cellAttrs"></excel-toolbar>
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
            v-for="(col, index) in value.cols"
            :width="col.width"
            :key="col.index"
            :ref="`col_${index}`"/>
        </colgroup>
        <thead>
          <tr>
            <th>&nbsp;</th>
            <th v-for="(col, index) in value.cols"
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
            v-for="(col, index) in value.cols"
            :width="col.width"
            :key="col.index"
            :ref="`col_${index}`"/>
        </colgroup>
        <tbody>
          <tr v-for="(row, rindex) in value.rows" :key="rindex">
            <td :ref="`row_${rindex}`"
              :height="row.height"
              @mouseover="rowColMouseOverHandler('row', rindex, $event)">{{rindex + 1}}</td>
            <td v-for="(col, cindex) in value.cols" :key="col.index" :ref="`cell_${rindex}_${cindex}`"
              :style="value[rindex] && value[rindex][cindex] && cellStyle(value[rindex][cindex])"
              :row-index="rindex" :col-index="cindex" type="cell"
              @dblclick.left.stop="cellDblclickHandler(rindex, cindex, $event)"
              @mousedown.left="cellMousedownHandler(rindex, cindex, $event)">
              {{ value[rindex] && value[rindex][cindex] && value[rindex][cindex].text }}
            </td>
          </tr>
        </tbody>
      </table>
      <excel-border ref="eborder" @change="changeBorderHandler">
      </excel-border>
      <excel-paint-border
        :target="pborderTarget"/>
      <excel-editor
        :target="editor.target"
        v-model="editor.value"
        v-if="editor && editor.target"
        ref="editor">
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
import ExcelPaintBorder from './ExcelPaintBorder'
import ExcelEditor from './ExcelEditor'
import ExcelResizer from './ExcelResizer'
import ExcelEditorBar from './ExcelEditorBar'
import ExcelToolbar from './ExcelToolbar'
import { defaultCols, formats, fonts, formulas, defaultCellAttrs, cellStyle } from './settings.js'

export default {
  name: 'v-excel',
  components: {
    ExcelBorder,
    ExcelPaintBorder,
    ExcelEditor,
    ExcelResizer,
    ExcelEditorBar,
    ExcelToolbar
  },
  props: {
    formats: { type: Array, default: () => formats },
    fonts: { type: Array, default: () => fonts },
    formulas: { type: Array, default: () => formulas },
    value: { type: Object, default: () => { return {} } } // [[{text: '', type: '', style: ''}]..]
  },
  data () {
    const { value } = this
    const defaultColWidth = 100
    if (value.cols === undefined) {
      value.cols = defaultCols.map((col, index) => {
        return {width: defaultColWidth, index: col}
      })
    }
    if (value.rows === undefined) {
      const max = (((Object.keys(value).length - 1) / defaultColWidth) + 1) * 100
      value.rows = []
      for (let i = 0; i < max; i++) {
        value.rows[i] = {height: 22}
      }
    }
    return {
      editor: {},
      editorBar: {},
      pborderTarget: null,
      rowResizer: null,
      colResizer: null,
      cellAttrs: Object.assign({}, defaultCellAttrs)
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
      const { value } = this
      const w = value.cols[index].width + distance
      if (w <= 50) return
      value.cols[index].width = w
      this.$refs[`col_${index}`].forEach(c => {
        c.width = w
      })
      this.$refs.eborder.reload()
      this.$refs.editor && this.$refs.editor.reload()
    },
    rowChangeResizerHandler (index, distance) {
      const { value } = this
      const h = value.rows[index].height + distance
      if (h <= 22) return
      value.rows[index].height = h
      this.$refs[`row_${index}`].forEach(c => {
        c.height = h
      })
      this.$refs.eborder.reload()
      this.$refs.editor && this.$refs.editor.reload()
    },
    cellDblclickHandler (row, col, evt) {
      this.editor = {target: evt.target, value: this.getEditValue(row, col)}
    },
    cellMousedownHandler (row, col, evt) {
      this.editor = null
      if (!evt.shiftKey) {
        this.editorBar = {cell: `${this.value.cols[col].index}${row + 1}`, value: this.getEditValue(row, col)}
      }
      Object.assign(this.cellAttrs, defaultCellAttrs, this.value[row][col])
    },
    changeBorderHandler (rows, cols) {
      // if paint format
      // const cellStyle = this.$refs.toolbar.getCopyCellStyle()
      // if (cellStyle !== null) {
      //   this.changeToolbarHandler(cellStyle)
      //   cellStyle.forEach(({key, v, isDefault}) => {
      //     this.cellAttrs[key] = v
      //   })
      // }
    },
    changePaintHandler (isCopy) {
      if (isCopy) {
        //
      }
    },
    changeToolbarHandler (attrs) {
      this.$refs.eborder.cellForEach((row, col) => {
        // console.log('row: ', row, ', col:', col)
        let cell = this.getDataRowCol(row, col)
        attrs.forEach(({key, v, isDefault}) => {
          // console.log('key: ', cell, key, v, isDefault)
          if (isDefault) {
            this.$delete(cell, key)
          } else {
            // console.log(':::::::::', cell, key, v)
            this.$set(cell, key, v)
          }
        })
      })
    },
    getEditValue (row, col) {
      return this.getDataRowCol(row, col)
    },
    getDataRowCol (row, col) {
      this.value[row] = this.value[row] || {}
      this.value[row][col] = this.value[row][col] || {text: ''}
      return this.value[row][col]
    },
    cellStyle
  }
}

</script>
