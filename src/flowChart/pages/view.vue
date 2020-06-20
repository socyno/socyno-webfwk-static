<template>
  <div>
    <div class="bottom">
      <el-button type="primary" style="width: 250px;height: 80px" size="medium" @click="doUnChangedStateIsShow">
        {{ buttonVal }}
      </el-button>
    </div>
    <div style="width: 100%; display: flex; justify-content: space-between;">
      <div id="myFlowChart" class="myFlowChart" :style=" {height: scrollerHeight}" />
    </div>
  </div>
</template>
<script>
import go from 'gojs'
import FormApi from '@/apis/formApi'
// eslint-disable-next-line no-unused-vars
const MAKE = go.GraphObject.make
export default {
  data() {
    return {
      myDiagram: null,
      isShow: typeof (this.$route.query.isShow) === 'undefined' ? 'No' : this.$route.query.isShow,
      keepUnChangeState: typeof (this.$route.query.isShow) === 'undefined' ? 'No' : this.$route.query.isShow,
      buttonVal: (this.$route.query.isShow === 'Yes') ? '隐藏非状态流转的操作' : '显示非状态流转的操作',
      formName: this.$route.params.form_name,
      formId: this.$route.params.form_id
    }
  },
  computed: {
    scrollerHeight: function() {
      return (window.innerHeight - 46 - 50) + 'px'
    }
  },

  mounted() {
    this.innitFlowChart()
  },
  methods: {

    reloadPage(params) {
      history.replaceState(
        {},
        null,
        '#' + this.$route.path +
        '?' +
        Object.keys(params)
          .map(key => {
            return (
              encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
            )
          })
          .join('&')
      )
      window.location.reload()
    },

    doUnChangedStateIsShow() {
      if (this.isShow === 'Yes') {
        this.keepUnChangeState = 'No'
      } else {
        this.keepUnChangeState = 'Yes'
      }
      const params = {
        form_name: this.formName,
        form_id: this.form_id,
        isShow: this.keepUnChangeState
      }
      this.reloadPage(params)
    },

    innitFlowChart() {
      const yellowGrad = MAKE(go.Brush, 'Linear', { 0: 'rgb(254, 201, 0)', 1: 'rgb(254, 162, 0)' })
      const blueGrad = MAKE(go.Brush, 'Linear', { 0: '#b0e0e6', 1: '#87CEEB' })
      const greenGrad = MAKE(go.Brush, 'Linear', { 0: '#4ACA6D', 1: '#4ACA6D' })
      const bigFont = 'bold 13pt Helvetica, Arial, sans-serif'

      this.myDiagram =
        MAKE(go.Diagram, 'myFlowChart',
          {
            // have mouse wheel events zoom in and out instead of scroll up and down
            'toolManager.mouseWheelBehavior': go.ToolManager.WheelZoom,
            initialAutoScale: go.Diagram.Uniform,
            'isReadOnly': true, // 只读
            'grid.visible': true, // 显示网格
            'linkingTool.direction': go.LinkingTool.ForwardsOnly,
            layout: MAKE(go.LayeredDigraphLayout, { isInitial: true, isOngoing: true, layerSpacing: 50 })
          })

      this.myDiagram.nodeTemplate =
        MAKE(go.Node, 'Auto', this.nodeStyle(),
          MAKE(go.Shape, 'Rectangle',
            {
              fill: yellowGrad, stroke: 'black',
              portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
              toEndSegmentLength: 50, fromEndSegmentLength: 40
            }),
          MAKE(go.TextBlock, 'Event',
            {
              margin: 6,
              font: bigFont,
              editable: true
            },
            new go.Binding('text', 'text').makeTwoWay()))

      this.myDiagram.linkTemplate =
        MAKE(go.Link,
          new go.Binding('points').makeTwoWay(),
          { curve: go.Link.Bezier, toShortLength: 15 },
          new go.Binding('curviness', 'curviness'),
          MAKE(go.Shape,
            { stroke: '#2F4F4F', strokeWidth: 2.5 }),
          MAKE(go.Shape,
            { toArrow: 'kite', fill: '#2F4F4F', stroke: null, scale: 2 }),
          MAKE(go.TextBlock,
            {
              stroke: 'blue',
              font: '16px sans-serif'
            },
            new go.Binding('text', 'linkText')),
          {
            toolTip: MAKE(go.Adornment, 'Auto',
              MAKE(go.Shape, { fill: '#FFFFCC' }),
              MAKE(go.TextBlock, { margin: 4 }, new go.Binding('text', 'text'))
            )
          }
        )

      this.myDiagram.nodeTemplateMap.add('STATE',
        MAKE(go.Node, 'Auto', this.nodeStyle(),
          new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
          MAKE(go.Shape, 'RoundedRectangle',
            { fill: blueGrad, portId: '', toLinkable: true, toEndSegmentLength: 50 }),
          MAKE(go.TextBlock, 'Success!', this.stateStyle(),
            new go.Binding('text', 'text').makeTwoWay())
        ))

      this.myDiagram.nodeTemplateMap.add('STATE_CURRENT',
        MAKE(go.Node, 'Auto', this.nodeStyle(),
          new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
          MAKE(go.Shape, 'RoundedRectangle',
            { fill: greenGrad, portId: '', toLinkable: true, toEndSegmentLength: 50 }),
          MAKE(go.TextBlock, 'Success!', this.stateStyle(),
            new go.Binding('text', 'text').makeTwoWay())
        ))

      this.myDiagram.nodeTemplateMap.add('UNCHANGED',
        MAKE(go.Node, 'Auto', this.nodeStyle(),
          new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
          MAKE(go.Shape, 'RoundedRectangle',
            { fill: blueGrad, portId: '', toLinkable: true, toEndSegmentLength: 50 }),
          MAKE(go.TextBlock, 'Success!', this.stateStyle(),
            new go.Binding('text', 'text').makeTwoWay())
        ))

      this.myDiagram.nodeTemplateMap.add('YESNO',
        MAKE(go.Node, 'Table', this.nodeStyle(),
          MAKE(go.Panel, 'Spot',
            MAKE(go.Shape, 'Circle',
              { desiredSize: new go.Size(40, 40), fill: '#afbdcd' }),
            MAKE(go.TextBlock, 'Start', this.textStyle(),
              new go.Binding('text'))
          )))

      this.myDiagram.nodeTemplateMap.add('CHOICE',
        MAKE(go.Node, 'Table', this.nodeStyle(),
          MAKE(go.Panel, 'Auto',
            MAKE(go.Shape, 'Diamond',
              { fill: '#afbdcd' },
              new go.Binding('figure', 'figure')),
            MAKE(go.TextBlock, this.textStyle(),
              new go.Binding('text').makeTwoWay())
          )
        ))

      const myModel = MAKE(go.GraphLinksModel)
      const api = new FormApi(this.formName)
      api.loadFlowChart(this.formId, this.keepUnChangeState).then(res => {
        myModel.nodeDataArray = res.data.nodeData
        myModel.linkDataArray = res.data.linkData
      }).catch(res => {
        this.$notify.error('加载数据异常')
      })

      this.myDiagram.model = myModel
    },

    textStyle() {
      const bigFont = 'bold 11pt Helvetica, Arial, sans-serif'
      return {
        margin: 6,
        wrap: go.TextBlock.WrapFit,
        textAlign: 'center',
        editable: true,
        font: bigFont
      }
    },

    stateStyle() {
      const bigFont = 'bold 11pt Helvetica, Arial, sans-serif'
      return {
        margin: 25,
        wrap: go.TextBlock.WrapFit,
        textAlign: 'center',
        editable: true,
        font: bigFont
      }
    },

    nodeStyle() {
      return [
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        {
          locationSpot: go.Spot.Center
        }
      ]
    }

  }
}
</script>
<style>
  .bottom {
    z-index:999;
    position:absolute;
    top: 12px;
    left: 12px;
  }
  .myFlowChart {
    flex-grow: 1;
    border: solid 1px black;
  }
</style>
