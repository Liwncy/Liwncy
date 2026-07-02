<script setup lang="ts">
import MenuSidebar from '@/components/MenuSidebar.vue'
import SitePageHeader from '@/components/SitePageHeader.vue'
import SitePageLayout from '@/components/SitePageLayout.vue'
import { useAiTools } from './useAiTools'

const {
  menus,
  currentPath,
  currentMenu,
  isMenuVisible,
  menuVisible,
  loading,
  userInput,
  executionResult,
  copyLoading,
  currentCopyIndex,
  isFormattedResult,
  resultList,
  needsInput,
  handleMenuClick,
  executeTool,
  clearInput,
  copyResult,
  copyResultItem,
} = useAiTools()
</script>

<template>
  <SitePageLayout :menu-visible="menuVisible">
    <template #sidebar>
      <MenuSidebar
        v-model:visible="isMenuVisible"
        :menus="menus"
        :current-path="currentPath"
        @child-click="handleMenuClick"
      />
    </template>

    <lay-container :fluid="true" class="site-page site-page--wide ai-tools-page">
        <SitePageHeader
          :title="currentMenu.title || '智能工具'"
          :subtitle="currentMenu.payload?.description || '选择左侧工具，输入内容后执行，结果会沉淀在右侧纸笺中'"
        >
          <template #extra>
            <div class="tool-badge">
              <span>当前工具</span>
              <strong>{{ currentMenu.title || '未选择' }}</strong>
            </div>
          </template>
        </SitePageHeader>

        <div class="ai-workbench">
          <section class="tool-panel">
            <div class="panel-heading">
              <span class="panel-kicker">INPUT</span>
              <h2>案前一问</h2>
              <p>
                {{
                  currentMenu.payload?.details ||
                  currentMenu.payload?.description ||
                  '选择工具后，输入内容并执行。'
                }}
              </p>
            </div>

            <div v-if="needsInput()" class="input-scroll">
              <lay-textarea
                v-model="userInput"
                placeholder="把要处理的内容放在这里..."
                :rows="10"
                class="user-input"
              />
            </div>

            <div v-else class="no-input-card">
              <i class="layui-icon layui-icon-release" />
              <h3>无需输入</h3>
              <p>这个工具会直接执行，点击下方按钮即可。</p>
            </div>

            <div class="input-actions">
              <lay-button type="primary" :loading="loading" @click="executeTool">开始执行</lay-button>
              <lay-button @click="clearInput">{{ needsInput() ? '清空输入' : '清空结果' }}</lay-button>
            </div>
          </section>

          <section class="result-panel" :class="{ 'result-panel-empty': !executionResult }">
            <div class="result-panel-header">
              <div>
                <span class="panel-kicker">OUTPUT</span>
                <h2>纸笺回响</h2>
              </div>
              <lay-button
                v-if="executionResult && !isFormattedResult"
                size="sm"
                type="primary"
                :loading="copyLoading"
                @click="copyResult"
              >
                复制内容
              </lay-button>
            </div>

            <div v-if="loading" class="result-empty result-loading">
              <div class="site-page-spinner" />
              <p>正在铺纸研墨，请稍候...</p>
            </div>

            <template v-else-if="executionResult">
              <div v-if="isFormattedResult" class="result-list">
                <article v-for="(item, index) in resultList" :key="index" class="result-item">
                  <div class="result-index">{{ String(index + 1).padStart(2, '0') }}</div>
                  <div class="result-main">
                    <h3>{{ item.content }}</h3>
                    <p>{{ item.description }}</p>
                  </div>
                  <lay-button
                    size="sm"
                    type="primary"
                    :loading="copyLoading && currentCopyIndex === index"
                    @click="copyResultItem(item.content, index)"
                  >
                    复制
                  </lay-button>
                </article>
              </div>
              <div v-else class="result-content">
                <pre>{{ executionResult }}</pre>
              </div>
            </template>

            <div v-else class="result-empty">
              <div class="empty-orb">AI</div>
              <h3>结果会出现在这里</h3>
              <p>左侧执行后，这里会以更易阅读的方式展示文本或列表结果。</p>
            </div>
          </section>
        </div>
    </lay-container>
  </SitePageLayout>
</template>

<style scoped>
.tool-badge {
  min-width: 150px;
  padding: 13px 16px;
  border: 1px solid rgba(44, 51, 48, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.58);
  text-align: center;
}

.tool-badge span {
  display: block;
  margin-bottom: 5px;
  color: var(--site-muted);
  font-size: 12px;
}

.tool-badge strong {
  color: var(--site-accent);
  font-family: var(--site-font-title);
  font-size: 17px;
  letter-spacing: 0.05em;
}

.ai-workbench {
  display: grid;
  grid-template-columns: minmax(320px, 0.9fr) minmax(420px, 1.2fr);
  gap: 22px;
}

.tool-panel,
.result-panel {
  position: relative;
  overflow: hidden;
  min-height: 560px;
  border: 1px solid var(--site-border);
  border-radius: 24px;
  background:
    radial-gradient(circle at 12% 10%, rgba(22, 186, 170, 0.1), transparent 34%),
    linear-gradient(135deg, rgba(255, 252, 245, 0.96), rgba(255, 255, 255, 0.88));
  box-shadow: 0 18px 48px rgba(44, 51, 48, 0.09);
}

.tool-panel {
  padding: 26px;
}

.tool-panel::after,
.result-panel::after {
  content: '';
  position: absolute;
  right: -70px;
  bottom: -70px;
  width: 190px;
  height: 190px;
  border-radius: 50%;
  border: 32px solid rgba(22, 186, 170, 0.05);
  pointer-events: none;
}

.panel-heading,
.result-panel-header {
  position: relative;
  z-index: 1;
}

.panel-kicker {
  display: inline-block;
  margin-bottom: 8px;
  color: var(--site-accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.panel-heading h2,
.result-panel-header h2 {
  margin: 0;
  color: var(--site-ink);
  font-family: var(--site-font-title);
  font-size: 24px;
  letter-spacing: 0.06em;
}

.panel-heading p {
  margin: 12px 0 0;
  color: var(--site-muted);
  font-size: 14px;
  line-height: 1.8;
}

.input-scroll {
  position: relative;
  z-index: 1;
  margin-top: 24px;
}

.user-input {
  width: 100%;
}

.input-actions {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.no-input-card {
  position: relative;
  z-index: 1;
  margin-top: 24px;
  padding: 42px 24px;
  border: 1px dashed rgba(22, 186, 170, 0.25);
  border-radius: 18px;
  background: rgba(22, 186, 170, 0.06);
  text-align: center;
}

.no-input-card i {
  color: var(--site-accent);
  font-size: 34px;
}

.no-input-card h3 {
  margin: 12px 0 6px;
  color: var(--site-ink);
  font-family: var(--site-font-title);
}

.no-input-card p {
  margin: 0;
  color: var(--site-muted);
}

.result-panel {
  display: flex;
  flex-direction: column;
  padding: 0;
}

.result-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 24px 26px 18px;
  border-bottom: 1px solid var(--site-border);
  background: rgba(255, 255, 255, 0.42);
}

.result-list {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 12px;
  padding: 22px;
  overflow: auto;
}

.result-item {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  padding: 16px;
  border: 1px solid rgba(44, 51, 48, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.62);
}

.result-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  color: #fff;
  background: var(--site-accent-gradient);
  font-weight: 700;
}

.result-main h3 {
  margin: 0 0 7px;
  color: var(--site-ink);
  font-size: 16px;
}

.result-main p {
  margin: 0;
  color: var(--site-muted);
  font-size: 13px;
  line-height: 1.65;
}

.result-content {
  position: relative;
  z-index: 1;
  padding: 22px;
}

.result-content pre {
  min-height: 360px;
  margin: 0;
  padding: 22px;
  overflow: auto;
  border: 1px solid rgba(44, 51, 48, 0.08);
  border-radius: 18px;
  background:
    linear-gradient(rgba(44, 51, 48, 0.035) 1px, transparent 1px),
    rgba(255, 255, 255, 0.62);
  background-size: 100% 32px;
  color: var(--site-ink);
  font-family: 'Cascadia Code', 'Fira Code', 'Courier New', monospace;
  line-height: 2;
  white-space: pre-wrap;
}

.result-empty {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--site-muted);
  text-align: center;
}

.empty-orb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 78px;
  height: 78px;
  margin-bottom: 18px;
  border-radius: 26px;
  color: #fff;
  background: var(--site-accent-gradient);
  box-shadow: 0 18px 44px rgba(22, 186, 170, 0.22);
  font-weight: 800;
  letter-spacing: 0.08em;
}

.result-empty h3 {
  margin: 0 0 8px;
  color: var(--site-ink);
  font-family: var(--site-font-title);
  font-size: 22px;
}

.result-empty p {
  max-width: 360px;
  margin: 0;
  line-height: 1.8;
}

.result-loading .site-page-spinner {
  margin-bottom: 14px;
}

:global(.site-theme-dark) .tool-badge,
:global(.site-theme-dark) .tool-panel,
:global(.site-theme-dark) .result-panel,
:global(.site-theme-dark) .result-item,
:global(.site-theme-dark) .result-content pre {
  background:
    linear-gradient(135deg, #17211d, #101714);
}

:global(.site-theme-dark) .result-panel-header {
  background: rgba(255, 255, 255, 0.04);
}

@media screen and (max-width: 1080px) {
  .ai-workbench {
    grid-template-columns: 1fr;
  }

  .tool-panel,
  .result-panel {
    min-height: auto;
  }
}

@media screen and (max-width: 768px) {
  .result-panel-header,
  .result-item {
    grid-template-columns: 1fr;
  }

  .result-panel-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .result-item {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
