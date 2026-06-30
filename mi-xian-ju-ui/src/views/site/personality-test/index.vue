<script setup lang="ts">
import { ref } from 'vue'

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
  <lay-layout class="example" style="--sidebar-width: 0px">
    <lay-body id="content">
      <lay-container :fluid="true" class="main-container">
        <div class="page-header">
          <h1>MBTI 性格测试</h1>
          <p class="subtitle">测一测你的性格类型，看看你更像哪种人格。</p>
        </div>

        <lay-card class="test-card" :body-style="{ padding: '0' }">
          <template #title>
            <div class="card-title">
              <span>在线测试</span>
              <div class="card-actions">
                <lay-button size="sm" type="primary" @click="reloadFrame">刷新</lay-button>
                <lay-button size="sm" @click="openInNewTab">新窗口打开</lay-button>
              </div>
            </div>
          </template>

          <div class="frame-wrap">
            <iframe
              :key="frameKey"
              class="personality-test-frame"
              :src="frameUrl"
              title="MBTI 性格测试"
              scrolling="no"
            />
          </div>
        </lay-card>
      </lay-container>
    </lay-body>
    <lay-backtop target="#content" :show-height="100" :bottom="30" position="absolute" />
  </lay-layout>
</template>

<style scoped>
.main-container {
  padding: 16px;
}

.page-header {
  margin-bottom: 12px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2329;
}

.subtitle {
  margin: 6px 0 0;
  font-size: 14px;
  color: #6b7280;
}

.test-card {
  border-radius: 12px;
  overflow: hidden;
}

.card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.frame-wrap {
  height: 555px;
  min-height: 555px;
  background: #fff;
  overflow: hidden;
}

.personality-test-frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  overflow: hidden;
}

@media (max-width: 768px) {
  .main-container {
    padding: 10px;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .frame-wrap {
    height: 520px;
    min-height: 520px;
  }
}
</style>
