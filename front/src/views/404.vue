<template>
  <main class="not-found">
    <div class="nf-inner">
      <p class="eyebrow">
        <span class="dot" aria-hidden="true"></span>
        PAGE NOT FOUND
      </p>

      <svg class="nf-spoon" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <ellipse cx="40" cy="34" rx="22" ry="14" fill="none" stroke="currentColor" stroke-width="2.4"/>
        <line x1="55" y1="44" x2="100" y2="100" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
      </svg>

      <h1 class="nf-code">404</h1>
      <p class="nf-quote">这一勺好像捞空了。</p>
      <p class="nf-msg">页面去别处逛了 — 也许是去找好吃的了。</p>

      <div class="nf-actions">
        <button class="btn-text" @click="back">返回上页</button>
        <button class="btn-primary" @click="$router.push('/front')">
          回到首页 <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  methods: {
    back() {
      window.history.length > 1 ? this.$router.go(-1) : this.$router.push('/front')
    }
  }
}
</script>

<style lang="scss" scoped>
.not-found {
  min-height: 100vh;
  background: var(--paper);
  display: flex; align-items: center; justify-content: center;
  padding: 56px 24px;
}
.nf-inner {
  max-width: 560px;
  text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 18px;
}
.eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  margin: 0;
  font-family: var(--font-display);
  font-size: 11px; font-weight: 600;
  letter-spacing: .2em; text-transform: uppercase;
  color: var(--accent);
  .dot { width: 6px; height: 6px; border-radius: 999px; background: var(--accent); }
}
.nf-spoon {
  width: 96px; height: 96px;
  color: var(--ink-soft);
  opacity: .65;
  margin: 8px 0 4px;
  transform: rotate(-22deg);
}
.nf-code {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(96px, 18vw, 168px);
  line-height: 1;
  letter-spacing: -.04em;
  font-variation-settings: "opsz" 144;
}
.nf-quote {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-display);
  font-style: italic;
  font-size: 22px;
  font-weight: 500;
}
.nf-msg {
  margin: 0;
  color: var(--ink-soft);
  font-size: 15px;
}
.nf-actions {
  display: flex; flex-wrap: wrap; gap: 16px;
  margin-top: 18px;
  justify-content: center;
}
.btn-text {
  padding: 6px 0;
  background: transparent; border: 0;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 12px; font-weight: 600;
  letter-spacing: .14em; text-transform: uppercase;
  border-bottom: 1px solid var(--ink);
  cursor: pointer;
  &:hover { color: var(--accent); border-bottom-color: var(--accent); }
}
.btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 22px;
  background: var(--ink);
  color: #fbf7f0;
  border: 0; border-radius: var(--r-1);
  font-family: var(--font-display);
  font-size: 12px; font-weight: 600;
  letter-spacing: .14em; text-transform: uppercase;
  cursor: pointer;
  transition: background-color .15s ease, transform .12s ease;
  &:hover { background: #2a2520; }
  &:active { transform: translateY(1px); }
}
</style>
