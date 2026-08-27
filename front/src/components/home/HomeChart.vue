<template>
  <div class="home-chart">
    <header>
      <p class="eyebrow">TREND</p>
      <h3>最近 12 个月活跃度</h3>
    </header>
    <div ref="chart" class="chart"></div>
  </div>
</template>
<script>
export default {
  data() { return { chart: null, resizeHandler: null } },
  mounted() { this.render() },
  beforeUnmount() {
    window.removeEventListener('resize', this.resizeHandler)
    if (this.chart) { this.chart.dispose(); this.chart = null }
  },
  methods: {
    async render() {
      const echarts = await import('echarts')
      const dom = this.$refs.chart
      if (!dom) return
      this.chart = echarts.init(dom, null, { renderer: 'canvas' })
      this.chart.setOption({
        color: ['#d6502c', '#4a443f', '#b07a18'],
        tooltip: { trigger: 'axis', backgroundColor: '#161413', borderWidth: 0, textStyle: { color: '#fbf7f0' } },
        grid: { left: 8, right: 18, top: 18, bottom: 8, containLabel: true },
        legend: {
          right: 0, top: 0,
          icon: 'roundRect', itemWidth: 10, itemHeight: 10,
          textStyle: { color: '#4a443f', fontFamily: 'var(--font-body)' }
        },
        xAxis: {
          type: 'category', boundaryGap: false,
          data: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
          axisLine: { lineStyle: { color: '#e6dfd2' } },
          axisLabel: { color: '#8a847b', fontFamily: 'var(--font-body)' },
          axisTick: { show: false }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: '#ede4d2' } },
          axisLabel: { color: '#8a847b' }
        },
        series: [
          { name: '访问量', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6,
            lineStyle: { width: 2.5 }, areaStyle: { opacity: .12 },
            data: [120,132,101,134,90,230,210,120,132,101,134,90] },
          { name: '用户量', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6,
            lineStyle: { width: 2.5 }, areaStyle: { opacity: .08 },
            data: [220,182,191,234,290,330,310,182,191,234,290,330] },
          { name: '收入',   type: 'line', smooth: true, symbol: 'circle', symbolSize: 6,
            lineStyle: { width: 2.5 }, areaStyle: { opacity: .08 },
            data: [150,232,201,154,190,330,410,232,201,154,190,330] }
        ]
      })
      this.resizeHandler = () => this.chart && this.chart.resize()
      window.addEventListener('resize', this.resizeHandler)
    }
  }
}
</script>
<style lang="scss" scoped>
.home-chart {
  background: #fff;
  border: 1px solid var(--rule);
  border-radius: var(--r-2);
  padding: 22px 24px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 360px;
  header { display: flex; flex-direction: column; gap: 4px; }
  .eyebrow {
    margin: 0;
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  h3 {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 18px;
    color: var(--ink);
  }
  .chart { flex: 1; min-height: 0; }
}
</style>
