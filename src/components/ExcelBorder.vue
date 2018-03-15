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
      :style="{left: `${left - 2}px`, top: `${top - 2}px`, width: `${width}px`, height: `${height}px`}"
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
    copyHandler (evt) {
      this.copyActives = this.getActivies()
      mouseMoveUp((evt) => {}, (evt) => {})
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
        this.clearActives()
        const attrs = getAttrs(evt.target)
        Object.assign(this, {startTarget: evt.target, endTarget: evt.target, ...attrs})
        const { $refs } = this.$parent
        $refs[`row_${this.row}`][0].className = 'active'
        $refs[`col_h${this.col}`][0].className = 'active'
        this.colActives.push(this.col)
        this.rowActives.push(this.row)

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
      this.clearActives()
      const { $parent } = this
      const { $refs } = $parent
      const soRow = startAttrs.row
      const soCol = startAttrs.col
      const eoRow = endAttrs.row
      const eoCol = endAttrs.col
      let height = 0
      let width = 0
      let top = startAttrs.top
      let left = startAttrs.left

      const rowHeight = (s, e) => {
        for (let i = s.row; i <= e.row; i++) {
          // console.log('row>>', s)
          // this.rowActives[i] = true
          $refs[`row_${i}`][0].className = 'active'
          this.rowActives.push(i)
          for (let j = 0; j < s.rowspan; j++) {
            height += parseInt($refs[`row_${i + j}`][0].offsetHeight)
          }
        }
      }

      const colWidth = (s, e) => {
        for (let i = s.col; i <= e.col; i++) {
          // col width
          // this.colActives[i] = true
          $refs[`col_h${i}`][0].className = 'active'
          this.colActives.push(i)
          for (let j = 0; j < s.colspan; j++) {
            width += parseInt($refs[`col_${i + j}`][0].width)
          }
        }
      }

      if (eoRow >= soRow) {
        rowHeight(startAttrs, endAttrs)
      } else {
        rowHeight(endAttrs, startAttrs)
        top = endAttrs.top
      }
      if (eoCol >= soCol) {
        colWidth(startAttrs, endAttrs)
      } else {
        colWidth(endAttrs, startAttrs)
        left = endAttrs.left
      }

      // console.log(top, left, height, width)
      Object.assign(this, {top, left, height, width})
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
