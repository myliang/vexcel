<template>
  <div class="ve-borders">
    <div class="ve-border" :style="{background: color, left: `${left - 1}px`, top: `${top - 1}px`, width: `${width + 1}px`, height: '2px'}"></div>
    <div class="ve-border" :style="{background: color, left: `${left + width - 1}px`, top: `${top - 1}px`, height: `${height}px`, width: '2px'}"></div>
    <div class="ve-border" :style="{background: color, left: `${left - 1}px`, top: `${top + height - 1}px`, width: `${width}px`, height: '2px'}"></div>
    <div class="ve-border" :style="{background: color, left: `${left - 1}px`, top: `${top - 1}px`, height: `${height}px`, width: '2px'}"></div>
    <div class="ve-area-background"
      :style="{background: 'rgba(75, 137, 255, 0.03)', left: `${left}px`, top: `${top}px`, width: `${width - 2}px`, height: `${height - 2}px`}"></div>
    <div class="corner" :style="{background: color, left: `${left + width - 5}px`, top: `${top + height - 5}px`}"></div>
  </div>
</template>
<script>
export default {
  name: 'excel-border',
  props: {
    color: { type: String, default: 'rgb(75, 137, 255)' }
  },
  data () {
    return {
      visable: false,
      startAttrs: {},
      endAttrs: {},
      left: 0,
      top: -1000,
      width: 0,
      height: 0,
      colActives: [],
      rowActives: []
    }
  },
  mounted () {
    window.addEventListener('mousedown', this.mousedownHandler)
    window.addEventListener('mouseup', this.mouseupHandler)
  },
  destroyed () {
    window.removeEventListener('mousedown', this.mousedownHandler)
    window.removeEventListener('mouseup', this.mouseupHandler)
  },
  methods: {
    mousedownHandler (evt) {
      // console.log(evt.target.getAttribute('type'))
      // console.log(evt.type, evt.detail, evt.buttons)
      if (evt.detail === 1 && evt.buttons === 1 && evt.target.getAttribute('type') === 'cell') {
        // console.log(evt.shiftKey)
        if (evt.buttons === 1) {
          if (evt.shiftKey) {
            this.endAttrs = getAttrs(evt.target)
            // console.log(this.startAttrs, this.endAttrs)
            this.selectAreaOffset()
            this.change()
            return
          }

          this.clearActives()
          const startAttrs = getAttrs(evt.target)
          Object.assign(this, {startAttrs, endAttrs: startAttrs, ...startAttrs})
          window.addEventListener('mousemove', this.mousemoveHandler)
          const { $refs } = this.$parent
          $refs[`row_${this.row}`][0].className = 'active'
          $refs[`col_h${this.col}`][0].className = 'active'
          this.colActives.push(this.col)
          this.rowActives.push(this.row)

          this.change()
        }
      }
    },
    mousemoveHandler (evt) {
      if (evt.target === this.target) return
      if (evt.buttons === 1 && evt.target.getAttribute('type') === 'cell') {
        this.endAttrs = getAttrs(evt.target)
        this.selectAreaOffset()
        this.change()
      }
    },
    mouseupHandler (evt) {
      window.removeEventListener('mousemove', this.mousemoveHandler)
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
    cellForEach (callback) {
      this.rowActives.forEach(i => {
        this.colActives.forEach(j => {
          callback(i, j)
        })
      })
    },
    selectAreaOffset () {
      const { startAttrs, endAttrs } = this
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
        for (let i = s; i <= e; i++) {
          // console.log($refs)
          // this.rowActives[i] = true
          $refs[`row_${i}`][0].className = 'active'
          this.rowActives.push(i)
          height += parseInt($refs[`row_${i}`][0].offsetHeight)
        }
      }

      const colWidth = (s, e) => {
        for (let i = s; i <= e; i++) {
          // col width
          // this.colActives[i] = true
          $refs[`col_h${i}`][0].className = 'active'
          this.colActives.push(i)
          width += parseInt($refs[`col_${i}`][0].width)
        }
      }

      if (eoRow >= soRow) {
        rowHeight(soRow, eoRow)
      } else {
        rowHeight(eoRow, soRow)
        top = endAttrs.top
      }
      if (eoCol >= soCol) {
        colWidth(soCol, eoCol)
      } else {
        colWidth(eoCol, soCol)
        left = endAttrs.left
      }

      // background
      // this.rowActives.forEach(i => {
      //   this.colActives.forEach(j => {
      //     $refs[`cell_${i}_${j}`][0].className = 'active'
      //   })
      // })

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
    left: offsetLeft,
    top: offsetTop,
    width: offsetWidth,
    height: offsetHeight
  }
}
</script>
