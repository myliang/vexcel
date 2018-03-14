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
        @change-merge="changeMergeHandler"
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
              :rowspan="value[rindex] && value[rindex][cindex] && value[rindex][cindex].rowspan || 1"
              :colspan="value[rindex] && value[rindex][cindex] && value[rindex][cindex].colspan || 1"
              :style="value[rindex] && value[rindex][cindex] && cellStyle(value[rindex][cindex])"
              :row-index="rindex" :col-index="cindex" type="cell"
              @dblclick.left.stop="cellDblclickHandler(rindex, cindex, $event)"
              @mousedown.left="cellMousedownHandler(rindex, cindex, $event)">
              {{ value[rindex] && value[rindex][cindex] && formatRenderHtml(value[rindex][cindex]) }}
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
import { defaultCols, formats, fonts, formulas, defaultCellAttrs, cellStyle, getStyleAttrs, formatRenderHtml } from './settings.js'

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
      cellAttrs: Object.assign({}, defaultCellAttrs),
      selectedBox: null,
      copyPasteCells: null, // copy, paste cells
      isClearCopyCells: false,
      current: null
    }
  },
  mounted () {
    window.addEventListener('keydown', this.copyPasteHandler)
  },
  methods: {
    rowColMouseOverHandler (type, index, evt) {
      // mouse key left pressed
      // console.log('>>>>>>>>over')
      if (evt.buttons !== 1) {
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
      this.borderReload()
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
      this.borderReload()
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

      // paint
      if (this.selectedBox === null) {
        this.setCellAttrs(row, col)
      }
      // set current data cell
      this.current = {row, col, cell: this.getDataRowCol(row, col)}
    },
    copyPasteHandler (evt) {
      // console.log('::::::::>>>', evt)
      if (evt.ctrlKey) {
        // ctrl + c
        if (evt.keyCode === 67) {
          console.log('>>>', this.$refs.eborder)
          this.copyPasteCells = this.$refs.eborder.getActivies()
          evt.preventDefault()
        }
        // ctrl + x
        if (evt.keyCode === 88) {
          this.isClearCopyCells = true
          this.copyPasteCells = this.$refs.eborder.getActivies()
          evt.preventDefault()
        }

        // ctrl + v
        if (evt.keyCode === 86) {
          // console.log('ctrlV')
          if (this.copyPasteCells !== null) {
            const { rows, cols } = this.copyPasteCells
            const c = this.$refs.eborder.getActivies()
            // console.log(rows, cols, '>>>>>>')
            rows.forEach((row, rindex) => {
              cols.forEach((col, cindex) => {
                this.copyStyleAttrs(row, col, c.rows[0] + rindex, c.cols[0] + cindex, true)
                if (this.isClearCopyCells) {
                  this.setDataRowCol(row, col, {text: ''})
                  this.copyPasteCells = null
                }
              })
            })
            this.borderReload()
            this.isClearCopyCells = false
          }
        }
      }
    },
    changeBorderHandler (rows, cols) {
      // console.log('border.change....')
      // if paint format
      if (this.selectedBox !== null) {
        const { rows, cols } = this.selectedBox
        this.$refs.eborder.cellForEach((row, rowIndex, col, colIndex) => {
          // let cell = this.getDataRowCol(row, col)
          const copyRow = rows[rowIndex % rows.length]
          const copyCol = cols[colIndex % cols.length]
          this.copyStyleAttrs(copyRow, copyCol, row, col)
        })
        this.$refs.toolbar.clearPaintFormatActive()
        this.selectedBox = null
      }
    },
    changePaintHandler (isCopy) {
      if (isCopy) {
        this.selectedBox = this.$refs.eborder.getActivies()
      } else {
        this.selectedBox = null
      }
    },
    changeMergeHandler () {
      // merge cell
      let { current } = this
      console.log('merge...', current)
      // 如果当前的单元格为合并单元格
      if (current.cell.rowspan > 1 || current.cell.colspan > 1) {
        // 取消合并
        for (let i = 0; i < current.cell.rowspan; i++) {
          for (let j = 0; j < current.cell.colspan; j++) {
            if (i === 0 && j === 0) continue
            this.setDataRowCol(current.row + i, current.col + j, {text: '', invisable: false})
          }
        }
        this.$set(current.cell, 'rowspan', defaultCellAttrs.rowspan)
        this.$set(current.cell, 'colspan', defaultCellAttrs.colspan)
        this.setCellAttrs(current.row, current.col)
      } else {
        // 合并
        let { rows, cols } = this.$refs.eborder.getActivies()
        if (rows.length > 1 || cols.length > 1) {
          const cell = this.getDataRowCol(rows[0], cols[0])
          this.current = {row: rows[0], col: cols[0], cell}
          this.$set(cell, 'rowspan', rows.length)
          this.$set(cell, 'colspan', cols.length)
          for (let i = 0; i < rows.length; i++) {
            for (let j = 0; j < cols.length; j++) {
              if (i === 0 && j === 0) continue
              this.setDataRowCol(rows[i], cols[j], {text: '', invisable: true})
            }
          }
          this.setCellAttrs(rows[0], cols[0])
        }
      }
      // console.log(this.value)
    },
    changeToolbarHandler (attrs) {
      this.$refs.eborder.cellForEach((row, rowIndex, col, colIndex) => {
        this.setDataRowCol(row, col, attrs, false)
        this.borderReload()
      })
    },
    borderReload () {
      setTimeout(() => {
        this.$refs.eborder.reload()
      }, 0)
    },
    getEditValue (row, col) {
      return this.getDataRowCol(row, col)
    },
    copyStyleAttrs (fromRow, fromCol, toRow, toCol, copyText = false) {
      const {rowspan, colspan, ...fromCell} = this.getDataRowCol(fromRow, fromCol)
      this.setDataRowCol(toRow, toCol, fromCell, copyText)
    },
    setCellAttrs (row, col) {
      const cell = this.getDataRowCol(row, col)
      Object.keys(defaultCellAttrs).forEach(attr => {
        this.cellAttrs[attr] = cell[attr] || defaultCellAttrs[attr]
      })
    },
    getDataRow (row) {
      if (!this.value[row]) {
        this.$set(this.value, row, {})
      }
      return this.value[row]
    },
    setDataRowCol (row, col, v, copyText = true) {
      let r = this.getDataRow(row)
      const cell = r[col]
      if (!copyText && cell) {
        v.text = cell.text
      }
      if (cell && cell.rowspan) {
        v.rowspan = cell.rowspan
      }
      if (cell && cell.colspan) {
        v.colspan = cell.colspan
      }
      this.$set(r, col, v)
      if (this.editor !== null) {
        this.editor.value = v
      }
      return r
    },
    getDataRowColStyle (row, col) {
      return getStyleAttrs(this.getDataRowCol(row, col))
    },
    getDataRowCol (row, col) {
      if (!this.value[row]) {
        this.$set(this.value, row, {})
      }
      if (!this.value[row][col]) {
        this.$set(this.value[row], col, {text: ''})
      }
      return this.value[row][col]
    },
    cellStyle,
    formatRenderHtml
  }
}

</script>
