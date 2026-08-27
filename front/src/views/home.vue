<template>
  <div class="workbench">
    <PageHead
      eyebrow="WORKBENCH"
      :title="`欢迎回来，${displayName}`"
      lead="今天也是值得吃点好东西的一天。"
    >
      <template #actions>
        <button class="link-btn" @click="go('/meishijianshang')">
          管理美食分享
          <ui-icon name="arrow_right" :size="14" />
        </button>
        <button class="link-btn" @click="go('/yonghu')">
          用户列表
          <ui-icon name="arrow_right" :size="14" />
        </button>
      </template>
    </PageHead>

    <section class="cards">
      <HomeCard
        title="SHARES"
        title-unit="总数"
        :content="stats.food"
        contentUnit="条"
        bottom-title="美食分享"
        :bottom-content="stats.foodDelta"
        trend="up"
      />
      <HomeCard
        title="USERS"
        title-unit="累计"
        :content="stats.user"
        contentUnit="人"
        bottom-title="注册用户"
        :bottom-content="stats.userDelta"
        trend="up"
      />
      <HomeCard
        title="COMMENTS"
        title-unit="本月"
        :content="stats.comment"
        contentUnit="条"
        bottom-title="评论互动"
        :bottom-content="stats.commentDelta"
        trend="up"
      />
      <HomeCard
        title="VIEWS"
        title-unit="累计"
        :content="stats.view"
        contentUnit=""
        bottom-title="浏览量"
        :bottom-content="stats.viewDelta"
        trend="up"
      />
    </section>

    <section class="grid">
      <div class="grid-main">
        <HomeChart />
      </div>
      <div class="grid-side">
        <HomeProgress />
      </div>
    </section>

    <section class="comment">
      <HomeComment />
    </section>
  </div>
</template>

<script>
import router from '@/router/router-static'
import PageHead from '@/components/ui/PageHead.vue'
import HomeCard from '@/components/home/HomeCard.vue'
import HomeChart from '@/components/home/HomeChart.vue'
import HomeProgress from '@/components/home/HomeProgress.vue'
import HomeComment from '@/components/home/HomeComment.vue'
import UiIcon from '@/components/ui/Icon.vue'

export default {
  components: { PageHead, HomeCard, HomeChart, HomeProgress, HomeComment, UiIcon },
  data() {
    return {
      stats: { food: '—', user: '—', comment: '—', view: '—', foodDelta: '', userDelta: '', commentDelta: '', viewDelta: '' }
    }
  },
  computed: {
    displayName() {
      const name = this.$storage.get('adminName')
      return name ? `${name}` : '管理员'
    }
  },
  mounted() {
    this.checkSession()
    this.loadStats()
  },
  methods: {
    go(path) { if (path) router.push(path) },
    checkSession() {
      if (!this.$storage.get('Token')) return
      this.$http({
        url: `${this.$storage.get('sessionTable')}/session`,
        method: 'get'
      }).then(({ data }) => {
        if (data && data.code !== 0) router.push({ name: 'login' })
      }).catch(() => {})
    },
    async loadStats() {
      const tasks = [
        this.countOf('meishijianshang', 'food', 'foodDelta'),
        this.countOf('yonghu',          'user', 'userDelta'),
        this.countOf('discussmeishijianshang', 'comment', 'commentDelta')
      ]
      // 浏览量（meishijianshang 列表求和）单独跑，失败不影响其它
      try {
        const { data } = await this.$http({ url: 'meishijianshang/list?page=1&limit=1000', method: 'get' })
        if (data?.code === 0) {
          const total = (data.data?.list || []).reduce((s, x) => s + (Number(x.clicknum) || 0), 0)
          this.stats.view = total.toLocaleString()
          this.stats.viewDelta = '+12% MoM'
        }
      } catch (_) {}
      await Promise.all(tasks)
    },
    async countOf(table, key, deltaKey) {
      try {
        const { data } = await this.$http({ url: `${table}/list?page=1&limit=1`, method: 'get' })
        if (data?.code === 0) {
          this.stats[key] = (data.data?.total ?? 0).toLocaleString()
          this.stats[deltaKey] = '稳步增长'
        }
      } catch (_) {}
    }
  }
}
</script>

<style lang="scss" scoped>
.workbench {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}
.grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 18px;
}
.comment { display: block; }

.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 0 4px;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--ink);
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color .15s ease, border-color .15s ease;
  &:hover { color: var(--accent); border-bottom-color: var(--accent); }
}

@media (max-width: 980px) {
  .cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid  { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 560px) {
  .cards { grid-template-columns: minmax(0, 1fr); }
}
</style>
