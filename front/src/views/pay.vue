<template>
  <div class="pay-page">
    <PageHead
      eyebrow="CHECKOUT"
      title="选择支付方式"
      lead="模拟支付 — 选好后点击下方按钮完成。"
    />

    <div class="pay-grid">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        class="pay-card"
        :class="{ 'is-active': type === opt.value }"
        @click="type = opt.value"
      >
        <div class="pay-card-icon" :style="{ background: opt.tint }">
          <span class="pay-card-glyph">{{ opt.glyph }}</span>
        </div>
        <div class="pay-card-meta">
          <p class="pay-card-label">{{ opt.label }}</p>
          <p class="pay-card-sub">{{ opt.sub }}</p>
        </div>
        <span class="pay-card-radio" :class="{ 'is-checked': type === opt.value }" aria-hidden="true"></span>
      </button>
    </div>

    <div class="pay-action">
      <button class="btn-text" @click="back">返回</button>
      <button class="btn-primary" :disabled="!type || submitting" @click="submitTap">
        {{ submitting ? '处理中…' : '确认支付' }}
      </button>
    </div>
  </div>
</template>

<script>
import PageHead from '@/components/ui/PageHead.vue'

export default {
  components: { PageHead },
  data() {
    return {
      type: '',
      table: '',
      obj: null,
      submitting: false,
      options: [
        { value: '微信支付',   label: '微信支付',   sub: '通过微信扫一扫完成',          glyph: '微', tint: '#e9f3ec' },
        { value: '支付宝支付', label: '支付宝',     sub: '通过支付宝扫一扫完成',         glyph: '支', tint: '#e7eef9' },
        { value: '建设银行',   label: '建设银行',   sub: '跳转至网银或手机银行',         glyph: '建', tint: '#fbe3df' },
        { value: '农业银行',   label: '农业银行',   sub: '跳转至网银或手机银行',         glyph: '农', tint: '#f6d8cc' },
        { value: '中国银行',   label: '中国银行',   sub: '跳转至网银或手机银行',         glyph: '中', tint: '#faf2dd' },
        { value: '交通银行',   label: '交通银行',   sub: '跳转至网银或手机银行',         glyph: '交', tint: '#ede4d2' }
      ]
    }
  },
  mounted() {
    this.table = this.$storage.get('paytable')
    this.obj = this.$storage.getObj('payObject')
  },
  methods: {
    back() { this.$router.go(-1) },
    submitTap() {
      if (!this.type) {
        this.$message.error('请选择支付方式')
        return
      }
      this.$confirm('确认支付？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.obj.ispay = '已支付'
        this.submitting = true
        this.$http({
          url: `${this.table}/update`,
          method: 'post',
          data: this.obj
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.$message.success('支付成功')
            setTimeout(() => this.$router.go(-1), 1200)
          } else {
            this.$message.error(data?.msg || '支付失败')
          }
        }).finally(() => { this.submitting = false })
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.pay-page {
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.pay-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}
.pay-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px 24px;
  background: #fff;
  border: 1px solid var(--rule);
  border-radius: var(--r-2);
  text-align: left;
  cursor: pointer;
  transition: border-color .15s ease, box-shadow .15s ease, transform .12s ease;

  &:hover { border-color: var(--ink-mute); box-shadow: var(--shadow-1); transform: translateY(-1px); }
  &.is-active {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent) inset, var(--shadow-1);
  }
}
.pay-card-icon {
  width: 48px; height: 48px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  flex: 0 0 auto;
}
.pay-card-glyph {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  color: var(--ink);
}
.pay-card-meta { flex: 1; min-width: 0; }
.pay-card-label {
  margin: 0 0 4px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 17px;
  color: var(--ink);
}
.pay-card-sub {
  margin: 0;
  color: var(--ink-soft);
  font-size: 13px;
}
.pay-card-radio {
  width: 18px; height: 18px;
  border-radius: 50%;
  border: 1.5px solid var(--rule);
  position: relative;
  flex: 0 0 auto;
  transition: border-color .15s ease;
  &.is-checked { border-color: var(--accent); }
  &.is-checked::after {
    content: '';
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: var(--accent);
  }
}
.pay-action {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--rule);
}
.btn-text {
  padding: 10px 22px;
  border: 0;
  background: transparent;
  color: var(--ink-soft);
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  cursor: pointer;
  &:hover { color: var(--ink); }
}
.btn-primary {
  padding: 10px 24px;
  background: var(--accent);
  color: #fff;
  border: 0;
  border-radius: var(--r-1);
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color .15s ease, transform .12s ease;
  &:hover { background: var(--accent-2); }
  &:active { transform: translateY(1px); }
  &:disabled { opacity: .55; cursor: not-allowed; }
}

@media (max-width: 760px) {
  .pay-grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
