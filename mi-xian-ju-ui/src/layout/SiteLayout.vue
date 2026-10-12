<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import avatarUrl from '../assets/touxiang.jpg'
import BrandIcon from '../components/BrandIcon.vue'
import { useAppStore } from '../store/app'
import '../styles/layout.css'

const { theme, toggleTheme } = useAppStore()
</script>

<template>
  <div class="site" :class="{ 'site-theme-dark': theme === 'dark' }">
    <header class="site-header">
      <RouterLink class="site-logo" to="/">
        <img :src="avatarUrl" alt="" />
        <span>芈 仙 居</span>
      </RouterLink>
      <nav class="site-nav">
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/bookmark">书签</RouterLink>
        <RouterLink to="/admin">后台</RouterLink>
      </nav>
      <div class="site-header-side">
        <a class="site-header-link" href="https://gitee.com/liwncy" target="_blank" rel="noopener noreferrer" aria-label="Gitee">
          <BrandIcon name="gitee" />
        </a>
        <a class="site-header-link" href="https://github.com/liwncy" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          <BrandIcon name="github" />
        </a>
        <button class="site-theme-button" type="button" @click="toggleTheme">
          {{ theme === 'dark' ? '浅色模式' : '深色模式' }}
        </button>
      </div>
    </header>
    <div class="site-main">
      <RouterView />
    </div>
  </div>
</template>
