<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import avatarUrl from '../../assets/touxiang.jpg'
import BrandIcon from '../../components/BrandIcon.vue'
import FluidCursor from '../../components/FluidCursor.vue'
import homeBgInkUrl from '../../assets/background-ink.svg?url'
import homeBgShapesUrl from '../../assets/background.svg?url'
import { useAppStore } from '../../store/app'
import '../../styles/home.css'

const { theme, toggleTheme } = useAppStore()

const lifeDays = computed(() =>
  Math.round(Math.abs(Date.now() - new Date('1995-09-09').getTime()) / (24 * 60 * 60 * 1000)),
)
</script>

<template>
  <div class="site-container">
    <FluidCursor />
    <div class="site-bg" aria-hidden="true">
      <object class="site-bg-ink" :data="homeBgInkUrl" type="image/svg+xml"></object>
      <object class="site-bg-shapes" :data="homeBgShapesUrl" type="image/svg+xml"></object>
    </div>

    <div class="site-layui-main">
      <div class="site-zfj site-zfj-anim">
        <img :src="avatarUrl" alt="头像" />
      </div>

      <div class="site-desc site-desc-anim">
        <p class="web-font-desc">芈 仙 居</p>
        <cite>大隐何须远，仙居在芥尘。推门浮世外，山水一壶春。</cite>
      </div>

      <div class="site-download">
        <RouterLink class="site-down site-down--primary" to="/bookmark">开始探索</RouterLink>
        <button class="site-down" type="button" @click="toggleTheme">
          {{ theme === 'dark' ? '浅色模式' : '深色模式' }}
        </button>
      </div>

      <div class="site-version">
        <span>作者：<cite class="site-showv">李芈仙</cite></span>
        <span>人生：<em class="site-showdowns">{{ lifeDays }}</em></span>
      </div>

      <div class="site-banner-other">
        <a href="https://github.com/liwncy" target="_blank" rel="nofollow noopener" class="site-fork">
          <BrandIcon name="github" />
          Github
        </a>
        <a href="https://gitee.com/liwncy" target="_blank" rel="nofollow noopener" class="site-fork">
          <BrandIcon name="gitee" />
          Gitee
        </a>
      </div>
    </div>

    <div class="box-list">
      <div class="box">
        <div class="icon">📚</div>
        <h2 class="title">
          <a href="https://liwncy-notes.apifox.cn" target="_blank" rel="nofollow noopener">个人笔记本</a>
        </h2>
        <p class="details">平时工作中的笔记以及灵感。</p>
      </div>
      <div class="box">
        <div class="icon">🎬</div>
        <h2 class="title">
          <a href="https://kvideo-cqp.pages.dev" target="_blank" rel="nofollow noopener">私人观影院</a>
        </h2>
        <p class="details">Cloudflare 部署 KVideo 实现自由观影。</p>
      </div>
      <div class="box">
        <div class="icon">🔜</div>
        <h2 class="title">
          <a href="https://github.com/liwncy" target="_blank" rel="nofollow noopener">敬请期待。。</a>
        </h2>
        <p class="details">不知道干啥先放着吧。</p>
      </div>
    </div>
  </div>
</template>
