<template>
  <lay-layout>
    <!-- 左侧菜单栏 -->
    <MenuSidebar
        :menus="menus"
        :currentPath="currentPath"
        @childClick="handleClick"
        v-model:visible="isMenuVisible"
    />
    <!-- 右侧内容区域 -->
    <lay-body id="content">
      <lay-container :fluid="true" class="main-container">
        <!-- 顶部信息栏 -->
        <div class="content-header">
          <h1 class="content-title">{{ currentMenu.title || '欢迎使用 LiteWord' }}</h1>
          <p class="content-description">{{ currentMenu.description || '选择左侧菜单查看不同的文案内容' }}</p>
        </div>

        <!-- 主要内容区域 -->
        <div class="content-body">
          <transition name="fade" mode="out-in">
            <div v-if="currentMenu.data" class="文案-content">
              <lay-card class="文案-card">
                <template #header>
                  <div class="card-header">
                    <span class="card-title">{{ currentMenu.data.name }}</span>
                    <span class="card-badge">{{ currentMenu.subTitle }}</span>
                  </div>
                </template>

                <div class="card-body">
                  <div class="api-info">
                    <div class="info-item">
                      <label>API 路径:</label>
                      <code class="api-path">{{ currentMenu.data.api }}</code>
                    </div>

                    <div class="content-preview">
                      <h3>文案预览</h3>
                      <div class="preview-content">
                        <p v-for="(item, index) in contentPreview" :key="index" class="preview-item">
                          {{ item }}
                        </p>
                      </div>
                    </div>

                    <div class="content-actions">
                      <lay-button type="primary" size="lg" @click="copyContent" :loading="loading">
                        <i class="layui-icon layui-icon-copy"></i>
                        复制文案
                      </lay-button>
                      <lay-button type="normal" size="lg" @click="refreshContent" :loading="loading">
                        <i class="layui-icon layui-icon-refresh"></i>
                        刷新文案
                      </lay-button>
                    </div>
                  </div>
                </div>
              </lay-card>
            </div>

            <div v-else class="empty-content">
              <div class="empty-icon">📝</div>
              <h3>请选择一个文案分类</h3>
              <p>从左侧菜单中选择一个分类，查看对应的文案内容</p>
            </div>
          </transition>
        </div>

        <!-- 底部信息 -->
        <div class="content-footer">
          <p>© {{ new Date().getFullYear() }} LiteWord - 文案管理系统</p>
        </div>
      </lay-container>
    </lay-body>
  </lay-layout>
</template>

<script setup>
import {computed, nextTick, onMounted, ref} from "vue";
import {getSideMenus} from "@/api/webs/test";
import MenuSidebar from "@/components/MenuSidebar.vue";
import {requestGetYujnApi} from "@/api/common/external/yujn";

const menus = ref([]);
const currentPath = ref("");
const currentMenu = ref({});
const isMenuVisible = ref(true);
const menuVisible = computed(() => (isMenuVisible.value ? "240px" : "0px"));
const contentPreview = ref([
  "这是一段示例文案，实际内容将根据选择的分类动态生成。",
  "文案内容会根据不同的分类和API返回不同的结果。",
  "您可以点击刷新按钮获取新的文案内容。"
]);

const loading = ref(false);

/**
 * 菜单子项点击
 */
const handleClick = async function (menu) {
  currentMenu.value = menu;
  currentPath.value = menu.id;
  generateContentPreview();
};

/**
 * 生成文案预览
 */
const generateContentPreview = () => {
  if (!currentMenu.value.data?.api) {
    console.error('API地址不存在');
    loading.value = false;
    return;
  }

  loading.value = true;
  console.log("获取文案，API:", currentMenu.value.data.api);

  requestGetYujnApi(currentMenu.value.data.api, {}).then(res => {
    loading.value = false;
    console.log("API响应:", res);
    // contentPreview.value = [res.msg || res.echo || res.pyq || res.data || res];
    const content = res.msg || res.echo || res.pyq || res.data || res;
    if (content) {
      console.log("文案内容:", content);
      // 处理API返回的数据，确保是数组格式
      if (Array.isArray(content)) {
        contentPreview.value = res.data;
      } else if (typeof content === 'string') {
        // 如果是字符串，按换行分割成数组
        contentPreview.value = content.split('\n').filter(item => item.trim());
      } else {
        // 如果是其他格式，转换为字符串数组
        contentPreview.value = [JSON.stringify(content)];
      }
    } else {
      console.error('API返回数据为空');
      // 设置默认预览内容
      contentPreview.value = [
        "文案内容获取失败，请重试。",
        "API返回数据为空，请检查接口是否正常。",
        "您可以点击刷新按钮重新获取文案内容。"
      ];
    }
  }).catch(error => {
    console.error('获取文案失败:', error);
    loading.value = false;
    // 设置错误提示内容
    contentPreview.value = [
      "文案内容获取失败，请检查网络连接。",
      "错误信息: " + (error.message || '未知错误'),
      "您可以点击刷新按钮重新尝试。"
    ];
  });
};

/**
 * 复制文案
 */
const copyContent = () => {
  const contentText = contentPreview.value.join('\n');
  navigator.clipboard.writeText(contentText).then(() => {
    layer.msg('文案复制成功', {icon: 1});
  }).catch(err => {
    layer.msg('复制失败，请手动复制', {icon: 2});
  });
};

/**
 * 刷新文案
 */
const refreshContent = () => {
  generateContentPreview();
  layer.msg('文案已刷新', {icon: 1});
};

// 获取侧边栏
const initPage = async function () {
  const res = await getSideMenus();
  menus.value = res.data;
  if (menus.value.length > 0 && menus.value[0].children.length > 0) {
    await handleClick(menus.value[0].children[0]);
  }
};

onMounted(() => {
  initPage();
});
</script>

<style scoped>
.layui-layout-website > .layui-layout > .layui-body {
  left: v-bind(menuVisible);
  width: calc(100% - v-bind(menuVisible));
  background: #f8f9fa;
  overflow-y: auto;
}

.main-container {
  padding: 30px;
  min-height: 100vh;
}

/* 顶部信息栏 */
.content-header {
  margin-bottom: 30px;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.content-title {
  font-size: 24px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 10px 0;
}

.content-description {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
}

/* 主要内容区域 */
.content-body {
  min-height: 600px;
}

/* 空状态 */
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-content h3 {
  font-size: 20px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 10px 0;
}

.empty-content p {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
}

/* 文案内容 */
.content-content {
  width: 100%;
}

.content-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
}

.card-badge {
  font-size: 12px;
  padding: 4px 8px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  font-weight: 500;
}

.card-body {
  padding: 24px;
}

/* API 信息 */
.api-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item label {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
}

.api-path {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  color: #212529;
  word-break: break-all;
}

/* 文案预览 */
.content-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-preview h3 {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.preview-content {
  padding: 20px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  min-height: 150px;
}

.preview-item {
  font-size: 14px;
  line-height: 1.6;
  color: #495057;
  margin: 0 0 12px 0;
  padding-left: 16px;
  position: relative;
}

.preview-item:last-child {
  margin-bottom: 0;
}

.preview-item::before {
  content: '"';
  position: absolute;
  left: 0;
  top: 0;
  font-size: 18px;
  color: #1976d2;
  font-weight: bold;
}

/* 文案操作 */
.content-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

/* 底部信息 */
.content-footer {
  margin-top: 40px;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.content-footer p {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .main-container {
    padding: 20px;
  }

  .content-header {
    padding: 16px;
  }

  .content-title {
    font-size: 20px;
  }

  .card-body {
    padding: 20px;
  }

  .文案-actions {
    flex-direction: column;
  }

  .文案-actions lay-button {
    width: 100%;
  }
}
</style>