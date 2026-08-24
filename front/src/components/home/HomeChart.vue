<template>
  <div id="home-chart" style="width:100%;height:400px;"></div>
</template>
<script>
export default {
  data() {
    return { chart: null, resizeHandler: null }
  },
  mounted() {
    this.homeChart();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.resizeHandler)
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    async homeChart() {
      const [echartsModule] = await Promise.all([
        import('echarts'),
        import('echarts/theme/macarons.js')
      ])
      const dom = document.getElementById('home-chart')
      if (!dom) return
      this.chart = echartsModule.init(dom)
      // 指定图表的配置项和数据
      var option = {
        tooltip: {
          trigger: "axis"
        },
        legend: {
          data: ["访问量", "用户量", "收入"]
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: [
            "1月",
            "2月",
            "3月",
            "4月",
            "5月",
            "6月",
            "7月",
            "8月",
            "9月",
            "10月",
            "11月",
            "12月"
          ]
        },
        yAxis: {
          type: "value"
        },
        series: [
          {
            name: "访问量",
            type: "line",
            stack: "总量",
            data: [
              120,
              132,
              101,
              134,
              90,
              230,
              210,
              120,
              132,
              101,
              134,
              90,
              230
            ]
          },
          {
            name: "用户量",
            type: "line",
            stack: "总量",
            data: [
              220,
              182,
              191,
              234,
              290,
              330,
              310,
              182,
              191,
              234,
              290,
              330,
              310
            ]
          },
          {
            name: "收入",
            type: "line",
            stack: "总量",
            data: [
              150,
              232,
              201,
              154,
              190,
              330,
              410,
              232,
              201,
              154,
              190,
              330,
              410
            ]
          }
        ]
      };
      // // 使用刚指定的配置项和数据显示图表。
      this.chart.setOption(option)
      this.resizeHandler = () => this.chart && this.chart.resize()
      window.addEventListener('resize', this.resizeHandler)
    }
  }
};
</script>
<style lang="scss" scoped>
#home-chart {
  background: #ffffff;
  padding: 20px 0;
}
</style>
