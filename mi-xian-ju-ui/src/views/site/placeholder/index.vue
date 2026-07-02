<template>
  <lay-container :fluid="true" class="site-page placeholder-page">
    <section class="placeholder-card">
      <div class="ink-scene" aria-hidden="true">
        <div class="moon" />
        <div class="mountain mountain-back" />
        <div class="mountain mountain-front" />
        <div class="river" />
        <div class="boat" />
      </div>

      <div class="placeholder-content">
        <span class="placeholder-kicker">COMING SOON</span>
        <h1>{{ description }}</h1>
        <p>此间景致尚在铺陈，稍后再来，或先回首页看看别处风光。</p>
        <div class="placeholder-actions">
          <lay-button type="primary" @click="router.push('/')">返回首页</lay-button>
          <lay-button border="green" @click="router.back()">返回上一页</lay-button>
        </div>
      </div>
    </section>
  </lay-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const description = computed(() => {
  return (route.meta.placeholder as string) ?? '页面建设中…'
})
</script>

<style scoped>
.placeholder-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}

.placeholder-card {
  position: relative;
  width: min(820px, 100%);
  min-height: 420px;
  padding: 56px;
  overflow: hidden;
  border: 1px solid var(--site-border, rgba(44, 51, 48, 0.1));
  border-radius: 24px;
  background:
    radial-gradient(circle at 18% 20%, rgba(22, 186, 170, 0.1), transparent 34%),
    linear-gradient(135deg, rgba(255, 252, 245, 0.96), rgba(244, 238, 226, 0.92));
  box-shadow: 0 24px 70px rgba(44, 51, 48, 0.12);
}

.placeholder-card::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(90deg, rgba(44, 51, 48, 0.035) 1px, transparent 1px),
    linear-gradient(rgba(44, 51, 48, 0.03) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: linear-gradient(135deg, rgba(0, 0, 0, 0.6), transparent 72%);
}

.placeholder-content {
  position: relative;
  z-index: 2;
  max-width: 480px;
}

.placeholder-kicker {
  display: inline-flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 5px 12px;
  border: 1px solid rgba(22, 186, 170, 0.2);
  border-radius: 999px;
  color: var(--site-accent, #1f9d8a);
  background: rgba(22, 186, 170, 0.08);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.placeholder-content h1 {
  margin: 0;
  color: var(--site-ink, #2c3330);
  font-family: var(--site-font-title, 'Songti SC', serif);
  font-size: 38px;
  line-height: 1.25;
  letter-spacing: 0.08em;
}

.placeholder-content p {
  margin: 18px 0 0;
  color: var(--site-muted, #6b736f);
  font-size: 15px;
  line-height: 1.9;
  letter-spacing: 0.03em;
}

.placeholder-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
}

.ink-scene {
  position: absolute;
  right: 34px;
  bottom: 30px;
  width: 320px;
  height: 260px;
  opacity: 0.95;
}

.moon {
  position: absolute;
  right: 28px;
  top: 10px;
  width: 74px;
  height: 74px;
  border-radius: 50%;
  background: #fff6e5;
  box-shadow: 0 0 42px rgba(255, 230, 180, 0.52);
}

.mountain {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 62px;
  height: 150px;
  clip-path: polygon(0 100%, 20% 58%, 34% 76%, 54% 26%, 68% 64%, 84% 42%, 100% 100%);
}

.mountain-back {
  background: linear-gradient(180deg, rgba(101, 126, 116, 0.42), rgba(101, 126, 116, 0.08));
  transform: translateY(-28px) scale(0.95);
}

.mountain-front {
  background: linear-gradient(180deg, rgba(38, 51, 45, 0.64), rgba(58, 90, 72, 0.22));
}

.river {
  position: absolute;
  left: 12px;
  right: 0;
  bottom: 38px;
  height: 38px;
  border-radius: 50%;
  border-top: 1px solid rgba(74, 107, 92, 0.36);
  border-bottom: 1px solid rgba(74, 107, 92, 0.18);
}

.boat {
  position: absolute;
  right: 72px;
  bottom: 54px;
  width: 62px;
  height: 16px;
  border-radius: 0 0 50% 50%;
  background: #24312c;
  transform: rotate(-2deg);
}

.boat::before {
  content: '';
  position: absolute;
  left: 28px;
  bottom: 10px;
  width: 1px;
  height: 46px;
  background: rgba(36, 49, 44, 0.7);
}

.boat::after {
  content: '';
  position: absolute;
  left: 29px;
  bottom: 30px;
  width: 32px;
  height: 22px;
  clip-path: polygon(0 0, 100% 50%, 0 100%);
  background: rgba(250, 246, 236, 0.72);
  border: 1px solid rgba(36, 49, 44, 0.22);
}

:global(.site-theme-dark) .placeholder-card {
  background:
    radial-gradient(circle at 18% 20%, rgba(22, 186, 170, 0.12), transparent 34%),
    linear-gradient(135deg, rgba(29, 38, 34, 0.96), rgba(18, 24, 21, 0.94));
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
}

:global(.site-theme-dark) .moon {
  opacity: 0.78;
}

:global(.site-theme-dark) .boat {
  background: #121715;
}

@media screen and (max-width: 768px) {
  .placeholder-page {
    align-items: flex-start;
  }

  .placeholder-card {
    min-height: 520px;
    padding: 34px 24px;
  }

  .placeholder-content h1 {
    font-size: 30px;
  }

  .ink-scene {
    right: 12px;
    bottom: 12px;
    width: 260px;
    height: 220px;
    opacity: 0.58;
  }
}
</style>
