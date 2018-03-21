<template>
  <div class="ve-borders">
    <div class="ve-border" :style="{background: color, left: `${left - 1}px`, top: `${top - 1}px`, width: `${width + 1}px`, height: '2px'}"></div>
    <div class="ve-border" :style="{background: color, left: `${left + width - 1}px`, top: `${top - 1}px`, height: `${height}px`, width: '2px'}"></div>
    <div class="ve-border" :style="{background: color, left: `${left - 1}px`, top: `${top + height - 1}px`, width: `${width}px`, height: '2px'}"></div>
    <div class="ve-border" :style="{background: color, left: `${left - 1}px`, top: `${top - 1}px`, height: `${height}px`, width: '2px'}"></div>
    <div class="ve-area-background"
      :style="{background: 'rgba(75, 137, 255, 0.03)', left: `${left}px`, top: `${top}px`, width: `${width - 2}px`, height: `${height - 2}px`}"></div>
    <div class="corner" :style="{background: color, left: `${left + width - 5}px`, top: `${top + height - 5}px`}"
      @mousedown.stop="copyHandler"></div>

    <div class="ve-paint-border"
      :style="{left: `${left - 1}px`, top: `${top - 1}px`, width: `${width}px`, height: `${height}px`}"
      ref="dashedBorder"
      v-if="visableDashedBorder">
    </div>
  </div>
</template>
<script>
import {bind, unbind, mouseMoveUp} from './event.js'
export default {
  name: 'excel-border',
  props: {
    color: { type: String, default: 'rgb(75, 137, 255)' }
  },
  data () {
    return {
      visableDashedBorder: false,
      startTarget: null,
      endTarget: null,
      left: 0,
      top: -1000,
      width: 0,
      height: 0,
      colActives: [],
      rowActives: [],
      copyActives: null
    }
  },
  mounted () {
    bind('mousedown', this.mousedownHandler)
  },
  destroyed () {
    unbind('mousedown', this.mousedownHandler)
  },
  methods: {
    setDashedBorderStyle (left, top, width, height) {
      const { dashedBorder } = this.$refs
      // console.log('dashedBorder:', left, top, width, height)
      dashedBorder.style.left = `${left - 1}px`
      dashedBorder.style.top = `${top - 1}px`
      dashedBorder.style.width = `${width}px`
      dashedBorder.style.height = `${height}px`
    },
    copyHandler (evt) {
      const { rows, cols } = this.getActivies()
      const lastRow = rows[rows.length - 1]
      const lastCol = cols[cols.length - 1]
      const firstRow = rows[0]
      const firstCol = cols[0]
      let boxRange = null
      // console.log('rows: ', rows)
      mouseMoveUp((e) => {
        this.visableDashedBorder = true
        const { target } = e
        const rowIndex = target.getAttribute('row-index')
        const colIndex = target.getAttribute('col-index')
        if (rowIndex && colIndex) {
          let rdiff = lastRow - rowIndex
          let cdiff = lastCol - colIndex
          let _rdiff = rows[0] - rowIndex
          let _cdiff = cols[0] - colIndex
          // console.log(rdiff, cdiff, ',,,', _rdiff, _cdiff)
          if (rdiff < 0) {
            // bottom
            // console.log('FCK=>bottom')
            this.setDashedBorderStyle(this.left, this.top, this.width, this.height + this.getRowsHeight(Math.abs(rdiff), lastRow))
            boxRange = ['bottom', lastRow + 1, firstCol, lastRow + Math.abs(rdiff), lastCol]
          } else if (cdiff < 0) {
            // right
            // console.log('FCK=>right')
            this.setDashedBorderStyle(this.left, this.top, this.width + this.getColsWidth(Math.abs(cdiff), lastCol), this.height)
            boxRange = ['right', firstRow, lastCol + 1, lastRow, lastCol + Math.abs(cdiff)]
          } else if (_rdiff > 0) {
            // top
            // console.log('FCK=>top')
            const h = this.getRowsHeight(Math.abs(_rdiff), firstRow)
            this.setDashedBorderStyle(this.left, this.top - h, this.width, h)
            boxRange = ['top', firstRow - Math.abs(_rdiff), firstCol, firstRow - 1, lastCol]
          } else if (_cdiff > 0) {
            // left
            // console.log('FCK=>left')
            const w = this.getColsWidth(Math.abs(_cdiff), firstCol)
            this.setDashedBorderStyle(this.left - w, this.top, w, this.height)
            boxRange = ['left', firstRow, firstCol - Math.abs(_cdiff), lastRow, firstCol - 1]
          } else {
            this.setDashedBorderStyle(this.left, this.top, this.width, this.height)
            boxRange = null
          }
        }
      }, (evt) => {
        this.visableDashedBorder = false
        if (boxRange !== null) {
          this.$emit('copy', evt, ...boxRange)
        }
      })
    },
    mousedownHandler (evt) {
      // console.log('>>>>>>>>>>mousedonw')
      // console.log(evt.target.getAttribute('type'))
      console.log(evt.type, evt.detail, evt.buttons)
      if (evt.detail === 1 && evt.target.getAttribute('type') === 'cell') {
        // console.log(evt.shiftKey)
        // if (evt.buttons === 1) {
        if (evt.shiftKey) {
          this.endTarget = evt.target
          // console.log(this.startAttrs, this.endAttrs)
          this.selectAreaOffset()
          this.change()
          return
        }
        // this.clearActives()
        const attrs = getAttrs(evt.target)
        Object.assign(this, {startTarget: evt.target, endTarget: evt.target, ...attrs})
        this.selectAreaOffset()

        // window.addEventListener('mousemove', this.mousemoveHandler)
        mouseMoveUp((e) => {
          if (e.target === this.target) return
          if (e.buttons === 1 && e.target.getAttribute('type') === 'cell') {
            this.endTarget = e.target
            this.selectAreaOffset()
          }
        }, (e) => { this.change() })
      }
    },
    reload () {
      this.selectAreaOffset()
    },
    change () {
      this.$emit('change', this.rowActives, this.colActives)
    },
    clearActives () {
      const { $refs } = this.$parent
      this.rowActives.forEach(i => {
        $refs[`row_${i}`][0].className = ''
        this.colActives.forEach(j => {
          $refs[`col_h${j}`][0].className = ''
          // $refs[`cell_${i}_${j}`][0].className = ''
        })
      })
      this.rowActives = []
      this.colActives = []
    },
    getActivies () {
      const { rowActives, colActives } = this
      rowActives.sort((a, b) => a - b)
      colActives.sort((a, b) => a - b)
      return {rows: rowActives, cols: colActives}
    },
    cellForEach (callback) {
      this.rowActives.forEach((i, iindex) => {
        this.colActives.forEach((j, jindex) => {
          callback(i, iindex, j, jindex)
        })
      })
    },
    selectAreaOffset () {
      // console.log('selectareaoffset>>>>')
      const { startTarget, endTarget } = this
      const startAttrs = getAttrs(startTarget)
      const endAttrs = getAttrs(endTarget)
      const { $parent } = this
      const { $refs } = $parent
      this.clearActives()

      let sRow = startAttrs.row
      let sCol = startAttrs.col
      let eRow = endAttrs.row
      let eCol = endAttrs.col
      if (sRow > eRow) {
        sRow = endAttrs.row
        eRow = startAttrs.row
      }
      if (sCol > eCol) {
        sCol = endAttrs.col
        eCol = startAttrs.col
      }
      // calc min, max of row
      // console.log('s: ', sRow, sCol, ', e: ', eRow, eCol, ', minRow: ', minRow)
      let [minRow, maxRow] = this.calcMinＭaxRow(sRow, eRow, sCol, eCol)

      // calc min, max of col
      let [minCol, maxCol] = this.calcMinMaxCol(minRow, maxRow, sCol, eCol)
      while (true) {
        const [minr, maxr] = this.calcMinＭaxRow(minRow, maxRow, minCol, maxCol)
        let [minc, maxc] = this.calcMinMaxCol(minRow, maxRow, minCol, maxCol)
        if (minRow === minr && maxRow === maxr && minCol === minc && maxCol === maxc) {
          break
        }
        minRow = minr
        maxRow = maxr
        minCol = minc
        maxCol = maxc
      }

      // console.log('minRow:', minRow, ',minCol:', minCol, ',maxRow:', maxRow, ',maxCol:', maxCol)

      let height = 0
      let width = 0

      for (let i = minRow; i <= maxRow; i++) {
        $refs[`row_${i}`][0].className = 'active'
        this.rowActives.push(i)
        height += this.getRowHeight(i)
      }

      for (let i = minCol; i <= maxCol; i++) {
        $refs[`col_h${i}`][0].className = 'active'
        this.colActives.push(i)
        width += this.getColWidth(i)
      }

      const {left, top} = getAttrs($refs[`cell_${minRow}_${minCol}`][0])

      // console.log(top, left, height, width)
      Object.assign(this, {top, left, height, width})
    },
    calcMinMaxCol (sRow, eRow, sCol, eCol) {
      let minCol = sCol
      let maxCol = eCol
      for (let j = sRow; j <= eRow; j++) {
        let cCol = sCol
        let dcell = this.$parent.getDataRowCol(j, cCol)
        if (dcell.merge) {
          cCol += dcell.merge[1] - cCol
        }
        if (cCol < minCol) minCol = cCol

        cCol = maxCol
        dcell = this.$parent.getDataRowCol(j, cCol)
        // console.log(j, cCol, dcell.colspan)
        const cColspan = dcell.colspan || 1
        if (parseInt(cColspan) > 1) {
          cCol += parseInt(cColspan)
        } else {
          if (dcell.merge) {
            const [r, c] = dcell.merge
            const rc = this.$parent.getDataRowCol(r, c).colspan
            cCol += rc + (c - cCol)
          }
        }
        if (cCol - 1 > maxCol) maxCol = cCol - 1
      }
      return [minCol, maxCol]
    },
    calcMinＭaxRow (sRow, eRow, sCol, eCol) {
      let minRow = sRow
      let maxRow = eRow
      for (let j = sCol; j <= eCol; j++) {
        let cRow = sRow
        let dcell = this.$parent.getDataRowCol(cRow, j)
        if (dcell.merge) {
          cRow += dcell.merge[0] - cRow
        }
        if (cRow < minRow) minRow = cRow

        cRow = maxRow
        dcell = this.$parent.getDataRowCol(cRow, j)
        // console.log('row: ', j, cRow, dcell.rowspan)
        const cRowspan = dcell.rowspan || 1
        if (parseInt(cRowspan) > 1) {
          cRow += parseInt(cRowspan)
        } else {
          if (dcell.merge) {
            const [r, c] = dcell.merge
            const rs = this.$parent.getDataRowCol(r, c).rowspan
            cRow += rs + (r - cRow)
          }
        }
        if (cRow - 1 > maxRow) maxRow = cRow - 1
      }
      return [minRow, maxRow]
    },
    getRowHeight (rowIndex) {
      const { $refs } = this.$parent
      return parseInt($refs[`row_${rowIndex}`][0].offsetHeight)
    },
    getColWidth (colIndex) {
      const { $refs } = this.$parent
      return parseInt($refs[`col_${colIndex}`][0].width)
    },
    getRowsHeight (max, offset) {
      let height = 0
      for (let i = 0; i < max; i++) {
        height += this.getRowHeight(i + offset)
      }
      return height
    },
    getColsWidth (max, offset) {
      let width = 0
      for (let j = 0; j < max; j++) {
        width += this.getColWidth(offset + j)
      }
      return width
    }
  }
}

const getAttrs = (target) => {
  const { offsetTop, offsetLeft, offsetHeight, offsetWidth } = target
  return {
    row: parseInt(target.getAttribute('row-index')),
    col: parseInt(target.getAttribute('col-index')),
    rowspan: parseInt(target.getAttribute('rowspan')),
    colspan: parseInt(target.getAttribute('colspan')),
    left: offsetLeft,
    top: offsetTop,
    width: offsetWidth,
    height: offsetHeight
  }
}
</script>
