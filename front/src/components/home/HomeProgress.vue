<template>
  <div class="home-progress">
    <header>
      <p class="eyebrow">PROGRESS</p>
      <h3>当月指标</h3>
    </header>
    <div v-for="item in items" :key="item.label" class="row">
      <div class="row-head">
        <span class="label">{{ item.label }}</span>
        <span class="value">{{ item.percent }}%</span>
      </div>
      <div class="bar">
        <div class="bar-fill" :style="{ width: item.percent + '%', background: item.color }"></div>
      </div>
      <p class="row-tip">{{ item.tip }}</p>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      items: [
        { label: '月访问量', percent: 62, color: '#d6502c', tip: '同比上月 +18%' },
        { label: '月用户量', percent: 44, color: '#4a443f', tip: '同比上月 +9%' },
        { label: '月分享数', percent: 78, color: '#b07a18', tip: '距目标还差 22%' }
      ]
    }
  }
}
</script>
<style lang="scss" scoped>
.home-progress {
  background: #fff;
  border: 1px solid var(--rule);
  border-radius: var(--r-2);
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
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
}
.row { display: flex; flex-direction: column; gap: 6px; }
.row-head { display: flex; justify-content: space-between; align-items: baseline; }
.label { font-size: 14px; color: var(--ink-soft); font-weight: 500; }
.value { font-family: var(--font-display); font-size: 20px; font-weight: 600; color: var(--ink); }
.bar {
  height: 8px;
  border-radius: 999px;
  background: var(--paper-2);
  overflow: hidden;
}
.bar-fill { height: 100%; border-radius: 999px; transition: width .5s ease; }
.row-tip { margin: 0; font-size: 12px; color: var(--ink-mute); }
</style>
