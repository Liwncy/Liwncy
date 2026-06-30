<script setup lang="ts">
import MenuSidebar from '@/components/MenuSidebar.vue'
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

    <lay-container :fluid="true" class="ai-tools-container">
        <lay-card :body-style="{ padding: '20px' }" class="content-card">
          <template #title>
            <div class="card-title">
              <h2>{{ currentMenu.title || 'AI 工具' }}</h2>
              <p v-if="currentMenu.payload?.description" class="card-description">
                {{ currentMenu.payload.description }}
              </p>
            </div>
          </template>

          <div v-if="currentMenu.payload?.details" class="tool-description">
            <div class="divider"><span class="divider-text">功能描述</span></div>
            <p>{{ currentMenu.payload.details }}</p>
          </div>

          <div v-if="needsInput()" class="user-input-section">
            <div class="divider"><span class="divider-text">用户输入</span></div>
            <lay-textarea
              v-model="userInput"
              placeholder="请输入您的内容..."
              :rows="6"
              class="user-input"
            />
            <div class="input-actions">
              <lay-button type="primary" :loading="loading" @click="executeTool">执行</lay-button>
              <lay-button @click="clearInput">清空</lay-button>
            </div>
          </div>

          <div v-else class="user-input-section">
            <div class="divider"><span class="divider-text">操作</span></div>
            <div class="input-actions">
              <lay-button type="primary" :loading="loading" @click="executeTool">执行</lay-button>
              <lay-button @click="clearInput">清空结果</lay-button>
            </div>
          </div>

          <div v-if="executionResult" class="execution-result">
            <div class="divider"><span class="divider-text">执行结果</span></div>
            <lay-card :body-style="{ padding: '15px' }" class="result-card">
              <div v-if="isFormattedResult" class="result-list">
                <div class="result-header">
                  <div class="result-header-col result-header-index">序号</div>
                  <div class="result-header-col result-header-content">内容</div>
                  <div class="result-header-col result-header-description">描述</div>
                  <div class="result-header-col result-header-action">操作</div>
                </div>
                <div v-for="(item, index) in resultList" :key="index" class="result-item">
                  <div class="result-col result-col-index">{{ index + 1 }}</div>
                  <div class="result-col result-col-content">{{ item.content }}</div>
                  <div class="result-col result-col-description">{{ item.description }}</div>
                  <div class="result-col result-col-action">
                    <lay-button
                      size="sm"
                      type="primary"
                      :loading="copyLoading && currentCopyIndex === index"
                      @click="copyResultItem(item.content, index)"
                    >
                      复制
                    </lay-button>
                  </div>
                </div>
              </div>
              <div v-else class="result-content">
                <div class="result-content-text">{{ executionResult }}</div>
                <div class="result-content-actions">
                  <lay-button size="sm" type="primary" :loading="copyLoading" @click="copyResult">
                    复制内容
                  </lay-button>
                </div>
              </div>
            </lay-card>
          </div>
        </lay-card>
      </lay-container>
  </SitePageLayout>
</template>

<style scoped>
.ai-tools-container {
  padding: 16px;
}

.content-card {
  min-height: 100%;
}

.card-title h2 {
  margin: 0 0 8px;
  font-size: 20px;
}

.card-description {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.divider {
  height: 1px;
  background: #e6e6e6;
  position: relative;
  margin: 20px 0;
}

.divider-text {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background: #fff;
  padding-right: 10px;
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

.user-input {
  margin-bottom: 10px;
}

.input-actions {
  display: flex;
  gap: 10px;
}

.result-list {
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  overflow: hidden;
}

.result-header {
  display: flex;
  background: #f2f2f2;
  border-bottom: 1px solid #e6e6e6;
  font-weight: 600;
}

.result-header-col,
.result-col {
  padding: 12px 15px;
}

.result-header-index,
.result-col-index {
  width: 80px;
}

.result-header-content,
.result-col-content {
  flex: 1;
  min-width: 150px;
}

.result-header-description,
.result-col-description {
  flex: 2;
  min-width: 200px;
}

.result-header-action,
.result-col-action {
  width: 100px;
  text-align: center;
}

.result-item {
  display: flex;
  border-bottom: 1px solid #e6e6e6;
}

.result-item:last-child {
  border-bottom: none;
}

.result-col-content {
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  border-radius: 4px;
}

.result-content-text {
  padding: 15px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
  margin-bottom: 12px;
}

.result-content-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
