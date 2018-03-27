<template>
  <div class="v-excel">
    <div class="ve-bars">
      <excel-toolbar
        :formats="formats"
        :fonts="fonts"
        :formulas="formulas"
        :attrs="cellAttrs"
        :history="historyValues"
        :reHistory="popHistoryValues"
        @change="changeToolbarHandler"
        @change-paint="changePaintHandler"
        @change-merge="changeMergeHandler"
        @undo="undoHandler"
        @redo="redoHandler"
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
              {{ value[rindex] && value[rindex][cindex] && renderCell(value[rindex][cindex]) }}
            </td>
          </tr>
        </tbody>
      </table>
      <excel-border
        ref="eborder"
        @change="changeBorderHandler"
        @copy="copyBorderHandler">
      </excel-border>
      <excel-paint-border
        :target="pborderTarget"/>
      <excel-editor
        :target="editor.target"
        :formulas="formulas"
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
import {bind} from './event.js'
import ExcelBorder from './ExcelBorder'
import ExcelPaintBorder from './ExcelPaintBorder'
import ExcelEditor from './ExcelEditor'
import ExcelResizer from './ExcelResizer'
import ExcelEditorBar from './ExcelEditorBar'
import ExcelToolbar from './ExcelToolbar'
import { defaultCols, formats, fonts, formulas, formulaFilterKey, defaultCellAttrs, cellStyle, getStyleAttrs, formatRenderHtml } from './settings.js'

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
      current: null,
      historyValues: [],
      popHistoryValues: []
    }
  },
  mounted () {
    bind('keydown', this.copyPasteHandler)
  },
  methods: {
    renderCell (cell) {
      const colMap = {}
      this.value.cols.forEach((col, i) => {
        colMap[col.index] = i
      })
      const txt = formulaFilterKey(cell.text, (fx, params) => {
        let paramValues = []
        try {
          if (params.indexOf(':') !== -1) {
            const [min, max] = params.split(':')
            const idx = /\d+/.exec(min).index
            const maxIdx = /\d+/.exec(max).index
            let minC = min.substring(0, idx)
            let minR = parseInt(min.substring(idx))

            let maxC = max.substring(0, maxIdx)
            let maxR = parseInt(max.substring(maxIdx))
            // console.log(min, max, minR, maxR, minC, maxC)
            if (maxC === minC) {
              for (let i = minR; i <= maxR; i++) {
                paramValues.push(Number(this.getDataRowCol(i - 1, colMap[minC]).text))
              }
            } else {
              for (let i = colMap[minC]; i <= colMap[maxC]; i++) {
                paramValues.push(Number(this.getDataRowCol(minR - 1, i).text))
              }
            }
          } else if (params.indexOf(',') !== -1) {
            paramValues = params.split(',').map(p => {
              const idx = /\d+/.exec(p).index
              const c = p.substring(0, idx)
              const r = p.substring(idx)
              return Number(this.getDataRowCol(r - 1, colMap[c]).text)
            })
          }
        } catch (e) {
          // console.log('warning:', e)
        }
        // console.log('values:', paramValues)
        return fx.fn(paramValues)
      })
      return formatRenderHtml(cell.format, txt)
    },
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
      this.addHistoryValues()
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
      this.addHistoryValues()
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
      // console.log(this.editor)
      if (this.editor !== null && this.editor.target) {
        // this.addHistoryValues()
        this.editor = null
      }
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
    undoHandler () {
      if (this.historyValues.length > 0) {
        const v = this.historyValues.pop()
        this.popHistoryValues.push(v)
        console.log('history: ', v)
        this.resetValue(v)
        this.setCellAttrs(this.current.row, this.current.col)
      }
    },
    redoHandler () {
      if (this.popHistoryValues.length > 0) {
        const v = this.popHistoryValues.pop()
        this.historyValues.push(v)
        this.resetValue(v)
        this.setCellAttrs(this.current.row, this.current.col)
      }
    },
    copyPasteHandler (evt) {
      // console.log('::::::::>>>', evt)
      if (evt.ctrlKey) {
        // ctrl + c
        if (evt.keyCode === 67) {
          console.log('>>>', this.$refs.eborder)
          this.copyPasteCells = this.$refs.eborder.getActivies()
          evt.returnValue = false
        }
        // ctrl + x
        if (evt.keyCode === 88) {
          this.isClearCopyCells = true
          this.copyPasteCells = this.$refs.eborder.getActivies()
          evt.returnValue = false
        }

        // ctrl + v
        if (evt.keyCode === 86) {
          // console.log('ctrlV')
          if (this.copyPasteCells !== null) {
            const { rows, cols } = this.copyPasteCells
            // console.log('rows: ', rows, ', cols: ', cols)
            const c = this.$refs.eborder.getActivies()
            // console.log(rows, cols, '>>>>>>')
            this.addHistoryValues()
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
        this.addHistoryValues()
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
    copyBorderHandler (evt, position, x, y, x1, y1) {
      // console.log('>>>', evt, x, y, x1, y1)
      const { rows, cols } = this.$refs.eborder.getActivies()
      const colMap = {}
      this.value.cols.forEach((col, i) => {
        colMap[col.index] = i
      })
      this.addHistoryValues()
      for (let i = x; i <= x1; i++) {
        for (let j = y; j <= y1; j++) {
          const copyRow = rows[(i - x) % rows.length]
          const copyCol = cols[(j - y) % cols.length]
          // console.log(copyRow, copyCol, i, j, evt.ctrlKey)
          this.copyStyleAttrs(copyRow, copyCol, i, j, true, (cell) => {
            // int handler
            if (evt.ctrlKey) {
              let txt = cell.text
              // console.log('::::::::', txt, position)
              if (/^\d*$/.test(txt)) {
                let tint = parseInt(txt)
                if (position === 'top' || position === 'left') {
                  tint -= (copyRow - i) + (copyCol - j)
                } else {
                  tint += (i - copyRow) + (j - copyCol)
                }
                cell.text = tint
              }
            }
            // formalus handler
            if (!/^\s*$/.test(cell.text)) {
              const replaceFormula = (_v) => {
                const idx = /\d+/.exec(_v).index
                let vc = _v.substring(0, idx)
                let vr = parseInt(_v.substring(idx))
                if (position === 'top') {
                  vr -= (copyRow - i) + (copyCol - j)
                } else if (position === 'left') {
                  vc = this.value.cols[colMap[vc] - ((copyRow - i) + (copyCol - j))].index
                } else if (position === 'bottom') {
                  vr += (j - copyCol) + (i - copyRow)
                } else if (position === 'right') {
                  vc = this.value.cols[colMap[vc] + ((j - copyCol) + (i - copyRow))].index
                }
                return `${vc}${vr}`
              }
              formulaFilterKey(cell.text, (fx, params) => {
                if (params.indexOf(':') !== -1) {
                  params = params.split(':').map(replaceFormula).join(':')
                } else {
                  params = params.split(',').map(replaceFormula).join(',')
                }
                cell.text = `=${fx.key}(${params})`
              })
            }
            return cell
          })
        }
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
        this.addHistoryValues()
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
          this.addHistoryValues()
          const cell = this.getDataRowCol(rows[0], cols[0])
          this.current = {row: rows[0], col: cols[0], cell}
          this.$set(cell, 'rowspan', rows.length)
          this.$set(cell, 'colspan', cols.length)
          for (let i = 0; i < rows.length; i++) {
            for (let j = 0; j < cols.length; j++) {
              if (i === 0 && j === 0) continue
              this.setDataRowCol(rows[i], cols[j], {text: '', invisable: true, merge: [rows[0], cols[0]]})
            }
          }
          this.setCellAttrs(rows[0], cols[0])
        }
      }
      // console.log(this.value)
    },
    changeToolbarHandler (attrs) {
      // console.log('attr: ', attrs)
      this.addHistoryValues()
      this.$refs.eborder.cellForEach((row, rowIndex, col, colIndex) => {
        const cell = this.getDataRowCol(row, col)
        if (!cell.invisable) {
          this.setDataRowCol(row, col, Object.assign({}, cell, attrs), false, false)
        }
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
    copyStyleAttrs (fromRow, fromCol, toRow, toCol, copyText = false, filter = (cell) => cell) {
      let {merge, ...fromCell} = this.getDataRowCol(fromRow, fromCol)
      // console.log('merge::', merge)
      if (merge) {
        merge = [merge[0] + (toRow - fromRow), merge[1] + (toCol - fromCol)]
      }
      // console.log('>>>merge::', merge)
      this.setDataRowCol(toRow, toCol, filter({merge, ...fromCell}), copyText)
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
    resetValue (v) {
      Object.keys(v).forEach(k => {
        if (/^\d+$/.test(k)) {
          // this.value.$set(k, v[k])
          // console.log(k, v[k])
          Object.keys(v[k]).forEach(k1 => {
            this.setDataRowCol(k, k1, v[k][k1])
          })
        }
        // this.$set(this.value, k, v[k])
      })
    },
    setDataRowCol (row, col, v, copyText = true, copyspan = true) {
      // console.log('history: ', this.historyValues)
      let r = this.getDataRow(row)
      const cell = r[col]
      console.log(':::::>', row, col, cell)
      if (!copyText && cell) {
        v.text = cell.text
      }
      if (!copyspan && cell && cell.rowspan) {
        v.rowspan = cell.rowspan
      }
      if (!copyspan && cell && cell.colspan) {
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
    addHistoryValues () {
      this.historyValues.push(JSON.parse(JSON.stringify(this.value)))
    },
    changeHandler () {
      this.$emit('change', this.value)
    },
    cellStyle,
    formatRenderHtml
  }
}

</script>
