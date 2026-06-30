<script setup lang="ts">
import '@/assets/styles/home.css'
import { computed } from 'vue'
import { useAppStore } from '@/store/app'
import avatarUrl from '@/assets/touxiang.jpg'

const appStore = useAppStore()

const lifeDays = computed(() =>
  Math.round(Math.abs(Date.now() - new Date('1995-09-09').getTime()) / (24 * 60 * 60 * 1000)),
)

function changeTheme() {
  appStore.toggleTheme()
}
</script>

<template>
  <div class="site-container">
    <div class="site-layui-main">
      <div class="site-zfj site-zfj-anim">
        <img :src="avatarUrl" alt="头像" />
      </div>

      <div class="layui-anim site-desc site-desc-anim">
        <p class="web-font-desc">芈 仙 居</p>
        <cite>大隐何须远，仙居在芥尘。推门浮世外，山水一壶春。</cite>
      </div>

      <div class="site-download">
        <router-link class="layui-inline site-down site-down--primary" to="/bookmark">
          Get Started
        </router-link>
        <a class="layui-inline site-down" href="javascript:void(0);" @click="changeTheme">
          {{ appStore.theme === 'dark' ? 'Turn Off' : 'Turn On' }}
        </a>
      </div>

      <div class="site-version">
        <span>作者：<cite class="site-showv">李芈仙</cite></span>
        <span>人生：<em class="site-showdowns">{{ lifeDays }}</em></span>
      </div>

      <div class="site-banner-other">
        <a href="https://github.com/liwncy" target="_blank" rel="nofollow noopener" class="site-fork">
          <lay-icon type="layui-icon-github" size="18px" color="#213547" />
          Github
        </a>
        <a href="https://gitee.com/liwncy" target="_blank" rel="nofollow noopener" class="site-fork">
          <lay-icon type="layui-icon-gitee" size="18px" color="#C71D23" />
          Gitee
        </a>
      </div>
    </div>

    <div class="box-list">
      <lay-row :space="30">
        <lay-col :md="8" :sm="12" :xs="24">
          <div class="box">
            <div class="icon">📚</div>
            <h2 class="title">
              <a href="https://liwncy-notes.apifox.cn" target="_blank" rel="nofollow noopener">
                个人笔记本
              </a>
            </h2>
            <p class="details">平时工作中的笔记以及灵感。</p>
          </div>
        </lay-col>
        <lay-col :md="8" :sm="12" :xs="24">
          <div class="box">
            <div class="icon">🎬</div>
            <h2 class="title">
              <a href="https://kvideo-cqp.pages.dev" target="_blank" rel="nofollow noopener">
                私人观影院
              </a>
            </h2>
            <p class="details">Cloudflare 部署 KVideo 实现自由观影。</p>
          </div>
        </lay-col>
        <lay-col :md="8" :sm="12" :xs="24">
          <div class="box">
            <div class="icon">🔜</div>
            <h2 class="title">
              <a href="https://github.com/liwncy" target="_blank" rel="nofollow noopener">
                敬请期待。。
              </a>
            </h2>
            <p class="details">不知道干啥先放着吧。</p>
          </div>
        </lay-col>
      </lay-row>
    </div>
  </div>
</template>
