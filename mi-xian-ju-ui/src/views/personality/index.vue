<script setup lang="ts">
import { ref } from 'vue'
import '../../styles/personality.css'

const frameKey = ref(0)
const frameUrl = 'https://www.apesk.com/mbti/dati28N.asp'

function reloadFrame() {
  frameKey.value += 1
}

function openFrame() {
  window.open(frameUrl, '_blank', 'noopener')
}
</script>

<template>
  <section class="personality-page">
    <header class="personality-summary">
      <div>
        <h1>MBTI 性格测试</h1>
        <p>测一测你的性格类型，看看你更像哪种人格</p>
      </div>
      <div class="personality-actions">
        <button type="button" class="personality-primary" @click="reloadFrame">刷新</button>
        <button type="button" @click="openFrame">新窗口打开</button>
      </div>
    </header>
    <div class="personality-frame">
      <iframe :key="frameKey" :src="frameUrl" title="MBTI 性格测试" />
    </div>
    <p class="personality-note">测试内容来自第三方站点，结果仅供参考</p>
  </section>
</template>
