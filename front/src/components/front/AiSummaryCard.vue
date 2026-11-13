<template>
  <section class="ai-summary-card" :class="`status-${status}`" aria-label="AI 食客共识">
    <p class="eyebrow"><span class="dot" aria-hidden="true"></span>AI 食客共识</p>

    <!-- 评论太少：AI 不生成 -->
    <p v-if="status === 'insufficient'" class="ai-note">
      评论太少，至少需要 <strong>{{ meta.minComments }}</strong> 条评论后 AI 才能生成共识（当前
      {{ meta.currentCommentCount }} 条）。
    </p>

    <!-- 首次加载 -->
    <div v-else-if="status === 'loading'" class="ai-skeleton" aria-hidden="true">
      <span v-for="n in 3" :key="n" />
    </div>

    <template v-else>
      <!-- 流式生成中：只展示纯文本进度，避免半成品 HTML 注入面 -->
      <pre v-if="status === 'streaming'" class="ai-stream">{{ streamedText }}<span class="caret">▊</span></pre>

      <!-- 生成完成：marked → DOMPurify 后一次性渲染 -->
      <div v-else-if="hasCache" class="ai-summary-body" v-html="renderedHtml" />
      <p v-else class="ai-note">
        还没有共识摘要。
        <span v-if="isLoggedIn">点下面的按钮，让 AI 总结一下大家的评论。</span>
        <span v-else>登录后可以生成。</span>
      </p>

      <p v-if="hasCache && status !== 'streaming'" class="ai-meta">
        基于生成时的 {{ meta.commentCount }} 条评论
        <template v-if="meta.model"> · {{ meta.model }}</template>
        <template v-if="meta.generatedAt"> · {{ meta.generatedAt }}</template>
      </p>

      <p v-if="status === 'stale'" class="ai-banner ai-banner-warn">
        评论数已变化（现在 {{ meta.currentCommentCount }} 条），这份共识可能已过期——重新生成一下？
      </p>
      <p v-if="status === 'limited'" class="ai-banner ai-banner-warn">
        {{ errorMsg || '今日 AI 额度已用完，请明天再来' }}
      </p>
      <p v-if="status === 'error'" class="ai-banner ai-banner-error">
        {{ errorMsg || 'AI 共识暂时不可用' }}
        <button type="button" class="ai-retry" @click="onRetry">重试</button>
      </p>

      <div class="ai-actions">
        <template v-if="isLoggedIn">
          <button
            type="button"
            class="ai-btn-primary"
            :disabled="status === 'streaming' || !meta.commentCountEnough"
            @click="onGenerate"
          >
            {{ status === 'streaming' ? '生成中…' : hasCache ? '重新生成' : '生成共识' }}
          </button>
          <button v-if="status === 'streaming'" type="button" class="ai-btn-link" @click="onCancel">
            取消
          </button>
        </template>
        <button v-else type="button" class="ai-btn-link" @click="onGoLogin">登录后可生成</button>
      </div>
    </template>
  </section>
</template>

<script>
import { computed, toRef } from 'vue'
import { useAiSummary } from '@/composables/useAiSummary'
import { renderMarkdown } from '@/utils/markdown'

export default {
  name: 'AiSummaryCard',
  props: {
    contentId: { type: [String, Number], required: true },
  },
  setup(props) {
    const summary = useAiSummary(toRef(props, 'contentId'))
    const renderedHtml = computed(() =>
      summary.summaryMd.value ? renderMarkdown(summary.summaryMd.value) : '',
    )
    summary.load()
    return { ...summary, renderedHtml }
  },
  methods: {
    onGenerate() {
      this.generate()
    },
    onCancel() {
      this.cancel()
    },
    onRetry() {
      this.retry()
    },
    onGoLogin() {
      this.$router.push({ path: '/login', query: { redirect: this.$route.fullPath } })
    },
  },
  beforeUnmount() {
    this.cancel()
  },
}
</script>

<style lang="scss" scoped>
.ai-summary-card {
  margin: 18px 0 22px;
  padding: 18px 20px 16px;
  background: var(--paper-2, #faf7f2);
  border: 1px solid var(--rule, rgba(24, 26, 27, 0.12));
  border-radius: var(--r-2, 12px);

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 10px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--accent, #b4502d);
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 999px;
      background: var(--accent, #b4502d);
    }
  }
}

.ai-note {
  margin: 0;
  color: var(--ink-mute, #6b6f72);
  font-size: 14px;
  line-height: 1.7;
}

.ai-skeleton {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 6px 0 2px;
  span {
    display: block;
    height: 14px;
    border-radius: 6px;
    background: linear-gradient(90deg, var(--rule, rgba(24, 26, 27, 0.08)) 25%, transparent 50%, var(--rule, rgba(24, 26, 27, 0.08)) 75%);
    background-size: 200% 100%;
    animation: ai-shimmer 1.4s infinite;
    &:nth-child(2) { width: 86%; }
    &:nth-child(3) { width: 64%; }
  }
}

.ai-stream {
  margin: 0;
  padding: 12px 14px;
  background: var(--paper, #fffdf9);
  border: 1px dashed var(--rule, rgba(24, 26, 27, 0.16));
  border-radius: var(--r-1, 8px);
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--ink, #1c1e20);
  .caret {
    display: inline-block;
    animation: ai-blink 1s steps(2, start) infinite;
    color: var(--accent, #b4502d);
  }
}

.ai-summary-body {
  font-size: 14px;
  line-height: 1.8;
  color: var(--ink, #1c1e20);
  :deep(p) { margin: 0 0 10px; }
  :deep(strong) { color: var(--ink, #1c1e20); }
  :deep(ul),
  :deep(ol) { margin: 6px 0 10px; padding-left: 20px; }
  :deep(li) { margin: 2px 0; }
  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4) { font-size: 15px; margin: 0 0 8px; }
}

.ai-meta {
  margin: 10px 0 0;
  color: var(--ink-mute, #6b6f72);
  font-size: 12px;
}

.ai-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin: 12px 0 0;
  padding: 8px 12px;
  border-radius: var(--r-1, 8px);
  font-size: 13px;
  line-height: 1.6;
}
.ai-banner-warn {
  color: #8a5a00;
  background: rgba(255, 196, 0, 0.14);
  border: 1px solid rgba(255, 196, 0, 0.35);
}
.ai-banner-error {
  color: #9b2c2c;
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.25);
}

.ai-retry {
  border: 1px solid currentColor;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font-size: 12px;
  padding: 2px 12px;
  cursor: pointer;
}

.ai-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 12px;
  .ai-btn-primary {
    border: none;
    border-radius: 999px;
    padding: 8px 20px;
    background: var(--accent, #b4502d);
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: opacity 0.15s ease;
    &:hover:not(:disabled) { opacity: 0.88; }
    &:disabled { opacity: 0.45; cursor: not-allowed; }
  }
  .ai-btn-link {
    border: none;
    background: transparent;
    color: var(--accent, #b4502d);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    padding: 4px 2px;
    &:hover { text-decoration: underline; }
  }
}

@keyframes ai-shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}
@keyframes ai-blink {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>
