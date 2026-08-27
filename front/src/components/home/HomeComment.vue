<template>
  <div class="home-comment">
    <header>
      <p class="eyebrow">FEEDBACK</p>
      <h3>最近留言</h3>
    </header>
    <ul class="list">
      <li v-for="(item, i) in list" :key="i" class="item">
        <div class="avatar">{{ avatarText(item.name) }}</div>
        <div class="body">
          <div class="meta">
            <span class="name">{{ item.name }}</span>
            <span class="time">{{ item.createTime }}</span>
          </div>
          <p class="content">{{ item.content }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  data() {
    return {
      list: [
        { name: 'MaskLin', content: '这个项目把 SSM 课程设计讲得很明白，文章末尾有源码。', createTime: '5月02日 00:00' },
        { name: '小满',   content: 'UI 终于有杂志感了 — 完全不是 AI 默认风。',                 createTime: '5月04日 00:00' },
        { name: 'anonymous', content: '想知道前端是怎么改造的，作者能给个 PR 吗？',          createTime: '5月05日 14:21' }
      ]
    }
  },
  methods: {
    avatarText(name) { return (name || '?').slice(0, 1).toUpperCase() }
  }
}
</script>
<style lang="scss" scoped>
.home-comment {
  background: #fff;
  border: 1px solid var(--rule);
  border-radius: var(--r-2);
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
.list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; }
.item {
  display: flex;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid var(--rule);
  &:last-child { border-bottom: 0; }
}
.avatar {
  flex: 0 0 36px;
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: var(--paper-2);
  color: var(--ink-soft);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14px;
}
.body { flex: 1; min-width: 0; }
.meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
  .name { font-weight: 600; color: var(--ink); font-size: 14px; }
  .time { color: var(--ink-mute); font-size: 12px; }
}
.content { margin: 0; color: var(--ink-soft); font-size: 14px; line-height: 1.6; }
</style>
