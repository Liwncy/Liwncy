<template>
  <lay-layout class="example">
    <!-- 左侧菜单栏 -->
    <MenuSidebar
        :menus="menus"
        :currentPath="currentPath"
        @childClick="handleClick"
        v-model:visible="isMenuVisible"
    />

    <lay-body id="content">
      <lay-container :fluid="true" class="main-container">
        <!-- 内容区域 -->
        <lay-row :space="10" class="content-row">
          <!-- 右侧内容 -->
          <lay-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <lay-card :body-style="{ padding: '20px' }" class="content-card">
              <template #title>
                <div class="card-title">
                  <h2>{{ currentMenu.title || 'AI 工具' }}</h2>
                  <p v-if="currentMenu.data?.description" class="card-description">{{ currentMenu.data?.description }}</p>
                </div>
              </template>

              <!-- 功能描述 -->
              <div class="tool-description" v-if="currentMenu.data?.details">
                <div class="divider">
                  <span class="divider-text">功能描述</span>
                </div>
                <p>{{ currentMenu.data?.details }}</p>
              </div>

              <!-- 用户输入 -->
              <div class="user-input-section">
                <div class="divider">
                  <span class="divider-text">用户输入</span>
                </div>
                <lay-textarea
                    v-model="userInput"
                    placeholder="请输入您的内容..."
                    :rows="6"
                    class="user-input"
                ></lay-textarea>
                <div class="input-actions">
                  <lay-button
                      type="primary"
                      @click="executeTool"
                      :loading="loading"
                  >
                    执行
                  </lay-button>
                  <lay-button @click="clearInput">清空</lay-button>
                </div>
              </div>

              <!-- 执行结果 -->
              <div class="execution-result" v-if="executionResult">
                <div class="divider">
                  <span class="divider-text">执行结果</span>
                </div>
                <lay-card :body-style="{ padding: '15px' }" class="result-card">
                  <!-- 规定格式的结果：表格显示 -->
                  <div v-if="isFormattedResult" class="result-list">
                    <!-- 表头 -->
                    <div class="result-header">
                      <div class="result-header-col result-header-index">序号</div>
                      <div class="result-header-col result-header-content">内容</div>
                      <div class="result-header-col result-header-description">描述</div>
                      <div class="result-header-col result-header-action">操作</div>
                    </div>
                    
                    <!-- 数据行 -->
                    <div v-for="(item, index) in resultList" :key="index" class="result-item">
                      <div class="result-col result-col-index">{{ index + 1 }}</div>
                      <div class="result-col result-col-content">{{ item.content }}</div>
                      <div class="result-col result-col-description">{{ item.description }}</div>
                      <div class="result-col result-col-action">
                        <lay-button
                            size="sm"
                            type="primary"
                            @click="copyResultItem(item.content, index)"
                            :loading="copyLoading && currentCopyIndex === index"
                        >
                          <lay-icon type="layui-icon-copy"></lay-icon>
                          复制
                        </lay-button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 非规定格式的结果：纯文本显示 -->
                  <div v-else class="result-content">
                    <div class="result-content-text">{{ executionResult }}</div>
                    <div class="result-content-actions">
                      <lay-button
                          size="sm"
                          type="primary"
                          @click="copyResult"
                          :loading="copyLoading"
                      >
                        <lay-icon type="layui-icon-copy"></lay-icon>
                        复制内容
                      </lay-button>
                    </div>
                  </div>
                </lay-card>
              </div>
            </lay-card>
          </lay-col>
        </lay-row>
      </lay-container>
    </lay-body>
  </lay-layout>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import {layer} from '@layui/layer-vue';
import {getSideMenus} from "@/api/webs/aiTool";
import {requestPostCfWorker} from "@/api/common/external/cfworker"

const menus = ref([]);

const currentPath = ref("text-summarize");
const currentMenu = ref({});

const isMenuVisible = ref(true);
const menuVisible = computed(() => (isMenuVisible.value ? "200px" : "0px"));

// 数据
const loading = ref(false);
const userInput = ref("");
const executionResult = ref("");
const copyLoading = ref(false);
const currentCopyIndex = ref(-1);


// 检查结果是否为规定格式的JSON
const isFormattedResult = computed(() => {
  if (!executionResult.value) {
    return false;
  }
  
  try {
    const jsonResult = JSON.parse(executionResult.value);
    return jsonResult.list && Array.isArray(jsonResult.list);
  } catch (error) {
    return false;
  }
});

// 结果列表计算属性（仅用于规定格式的结果）
const resultList = computed(() => {
  if (!executionResult.value || !isFormattedResult.value) {
    return [];
  }
  let results = [];
  try {
    // 解析JSON格式的结果
    const jsonResult = JSON.parse(executionResult.value);
    
    // 检查是否是用户提供的格式：
    if (jsonResult.list && Array.isArray(jsonResult.list)) {
      jsonResult.list.forEach((item, index) => {
        if (item.content && item.description) {
          results.push(item);
        }
      });
    }
  } catch (error) {
    console.log('解析格式化结果失败');
  }
  return results;
});

/**
 * 菜单子项点击
 */
const handleClick = function (menu) {
  currentMenu.value = menu;
  currentPath.value = menu.id;
  // 切换工具时清空输入和结果
  userInput.value = "";
  executionResult.value = "";
};

/**
 * 执行工具
 */
const executeTool = async function () {
  if (!userInput.value.trim()) {
    return;
  }
  loading.value = true;
  const api = currentMenu.value.data.api;
  requestPostCfWorker(api, {content: userInput.value}).then((res) => {
    executionResult.value = res.data;
    loading.value = false;
  }).catch((err) => {
    loading.value = false;
  })
};

/**
 * 清空输入
 */
const clearInput = function () {
  userInput.value = "";
  executionResult.value = "";
};

/**
 * 复制结果
 */
const copyResult = async function () {
  if (!executionResult.value) {
    return;
  }

  copyLoading.value = true;

  try {
    // 使用 Clipboard API 复制文本
    await navigator.clipboard.writeText(executionResult.value);

    // 显示复制成功提示
    layer.msg('复制成功！', {icon: 1, time: 2000});
  } catch (err) {
    console.error('复制失败:', err);
    // 兼容旧浏览器的复制方法
    const textArea = document.createElement('textarea');
    textArea.value = executionResult.value;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      layer.msg('复制成功！', {icon: 1, time: 2000});
    } catch (err) {
      console.error('复制失败:', err);
      layer.msg('复制失败，请手动复制', {icon: 2, time: 2000});
    } finally {
      document.body.removeChild(textArea);
    }
  } finally {
    copyLoading.value = false;
  }
};

/**
 * 复制单个结果项
 */
const copyResultItem = async function (content, index = -1) {
  if (!content) {
    return;
  }

  copyLoading.value = true;
  currentCopyIndex.value = index;

  try {
    // 使用 Clipboard API 复制文本
    await navigator.clipboard.writeText(content);

    // 显示复制成功提示
    layer.msg('复制成功！', {icon: 1, time: 2000});
  } catch (err) {
    console.error('复制失败:', err);
    // 兼容旧浏览器的复制方法
    const textArea = document.createElement('textarea');
    textArea.value = content;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      layer.msg('复制成功！', {icon: 1, time: 2000});
    } catch (err) {
      console.error('复制失败:', err);
      layer.msg('复制失败，请手动复制', {icon: 2, time: 2000});
    } finally {
      document.body.removeChild(textArea);
    }
  } finally {
    copyLoading.value = false;
    currentCopyIndex.value = -1;
  }
};

const initPage = async function () {
  const res = await getSideMenus();
  menus.value = res.data;
  await handleClick(menus.value[0].children[0]);
};

onMounted(() => {
  initPage();
});
</script>

<style scoped>
.example {
  height: 100vh;
  overflow: hidden;
}

.main-container {
  height: 100%;
  padding: 20px;
}

.content-row {
  height: 100%;
}

.content-card {
  height: 100%;
  overflow-y: auto;
}

.card-title {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  z-index: 1;
  background-color: #fff;
}

.card-title h2 {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 600;
}

.card-description {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.tool-description {
  margin-top: 30px;
  margin-bottom: 20px;
  position: relative;
  z-index: 0;
}

.user-input-section {
  margin-bottom: 20px;
}

.user-input {
  margin-bottom: 10px;
}

.input-actions {
  display: flex;
  gap: 10px;
}

.execution-result {
  margin-top: 20px;
}

.result-card {
  margin-top: 10px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.result-list {
  margin-top: 10px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #e6e6e6;
}

/* 表头样式 */
.result-header {
  display: flex;
  background-color: #f2f2f2;
  border-bottom: 1px solid #e6e6e6;
  font-weight: 600;
}

.result-header-col {
  padding: 12px 15px;
  text-align: left;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
}

.result-header-index {
  width: 80px;
}

.result-header-description {
  flex: 2;
  min-width: 300px;
}

.result-header-content {
  flex: 1;
  min-width: 150px;
}

.result-header-action {
  width: 100px;
  text-align: center;
}

/* 数据行样式 */
.result-item {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e6e6e6;
  transition: all 0.3s ease;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background-color: #f9f9f9;
}

.result-col {
  padding: 12px 15px;
  display: flex;
  align-items: center;
}

.result-col-index {
  width: 80px;
  font-size: 14px;
  color: #666;
}

.result-col-description {
  flex: 2;
  min-width: 300px;
  font-size: 14px;
  color: #333;
}

.result-col-content {
  flex: 1;
  min-width: 150px;
  font-size: 14px;
  color: #666;
  font-family: 'Courier New', Courier, monospace;
  background-color: #f8f9fa;
  padding: 6px 10px;
  border-radius: 4px;
}

.result-col-action {
  width: 100px;
  display: flex;
  justify-content: center;
}

/* 纯文本结果样式 */
.result-content {
  margin-top: 10px;
}

.result-content-text {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  white-space: pre-wrap;
  font-family: 'Courier New', Courier, monospace;
  margin-bottom: 15px;
  border: 1px solid #e9ecef;
}

.result-content-actions {
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .result-header,
  .result-item {
    flex-wrap: wrap;
  }

  .result-header-col,
  .result-col {
    width: 100%;
    margin-bottom: 8px;
  }

  .result-header-col:last-child,
  .result-col:last-child {
    margin-bottom: 0;
  }

  .result-header-action,
  .result-col-action {
    width: 100%;
    justify-content: flex-start;
  }

  .result-header-description,
  .result-col-description,
  .result-header-content,
  .result-col-content {
    min-width: unset;
  }
}

@media screen and (max-width: 768px) {
  .result-header-col,
  .result-col {
    padding: 10px;
  }

  .result-col-description,
  .result-col-content {
    font-size: 13px;
  }
}

.divider {
  height: 1px;
  background-color: #e6e6e6;
  position: relative;
  margin: 20px 0;
}

.divider-text {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background-color: #fff;
  padding-right: 10px;
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .main-container {
    padding: 10px;
  }

  .card-title h2 {
    font-size: 18px;
  }

  .divider {
    margin: 15px 0;
  }

  .divider-text {
    font-size: 13px;
  }
}
</style>