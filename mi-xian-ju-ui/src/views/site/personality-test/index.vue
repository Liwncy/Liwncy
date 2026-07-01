<script setup lang="ts">
import { ref } from 'vue'
import SitePageHeader from '@/components/SitePageHeader.vue'
import SitePageLayout from '@/components/SitePageLayout.vue'

const frameKey = ref(0)
const frameUrl = 'https://www.apesk.com/mbti/dati28N.asp'

function reloadFrame() {
  frameKey.value += 1
}

function openInNewTab() {
  window.open(frameUrl, '_blank')
}
</script>

<template>
  <SitePageLayout menu-visible="0px" :backtop="true">
    <div class="site-page personality-test-page">
      <SitePageHeader
        title="MBTI 性格测试"
        subtitle="测一测你的性格类型，看看你更像哪种人格"
      />

      <div class="site-page-card personality-test-card">
        <div class="site-page-card-header personality-test-card-header">
          <h3>在线测试</h3>
          <div class="personality-test-actions">
            <lay-button size="sm" type="primary" @click="reloadFrame">刷新</lay-button>
            <lay-button size="sm" @click="openInNewTab">新窗口打开</lay-button>
          </div>
        </div>
        <div class="personality-test-frame-wrap">
          <iframe
            :key="frameKey"
            class="personality-test-frame"
            :src="frameUrl"
            title="MBTI 性格测试"
            scrolling="no"
          />
        </div>
      </div>

      <footer class="site-page-footer">
        <p>测试内容来自第三方站点，结果仅供参考</p>
      </footer>
    </div>
  </SitePageLayout>
</template>

<style scoped>
.personality-test-page {
  max-width: 960px;
}

.personality-test-card-header {
  justify-content: space-between;
}

.personality-test-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.personality-test-frame-wrap {
  height: 560px;
  min-height: 560px;
  background: #fff;
  overflow: hidden;
}

.site-theme-dark .personality-test-frame-wrap {
  background: #0f1412;
}

.personality-test-frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

@media (max-width: 768px) {
  .personality-test-frame-wrap {
    height: 520px;
    min-height: 520px;
  }
}
</style>
