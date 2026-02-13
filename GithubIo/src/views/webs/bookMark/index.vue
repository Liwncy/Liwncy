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
        <!-- 数据源选择和搜索 -->
        <div class="toolbar">
          <div class="toolbar-left">
            <lay-select 
                v-model="dataSource" 
                @change="dataSourceChange" 
                placeholder="切换源" 
                class="data-source-select">
              <lay-select-option value="0" label="我的书签"></lay-select-option>
              <lay-select-option value="1" label="喜欢书签"></lay-select-option>
              <lay-select-option value="2" label="随机生成"></lay-select-option>
            </lay-select>
          </div>
          <div class="toolbar-right">
            <lay-input
                v-model="filterBookText"
                prefix-icon="layui-icon-search"
                placeholder="搜索书签..."
                :allow-clear="true"
                class="search-input"
            ></lay-input>
          </div>
        </div>

        <!-- 书签统计信息 -->
        <div class="stats-bar" v-if="allBooksData.length > 0">
          <div class="stat-item">
            <span class="stat-label">当前分类：</span>
            <span class="stat-value">{{ currentCategoryName }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">书签数量：</span>
            <span class="stat-value">{{ bookShowData.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总书签：</span>
            <span class="stat-value">{{ allBooksData.length }}</span>
          </div>
        </div>

        <!-- 书签列表 -->
        <div class="bookmarks-container">
          <!-- 空状态 -->
          <div v-if="bookShowData.length === 0 && !loading" class="empty-state">
            <div class="empty-icon">📚</div>
            <h3>暂无书签</h3>
            <p>该分类下暂无书签内容</p>
          </div>

          <!-- 加载中 -->
          <div v-else-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>加载中...</p>
          </div>

          <!-- 书签网格 -->
          <div v-else class="bookmarks-grid">
            <div
                v-for="book in bookShowData"
                :key="book.id"
                class="bookmark-card"
                @click="openLink(book.links)"
            >
              <div class="bookmark-icon">
                <img :src="book.avatar" :alt="book.title" @error="handleImageError" />
              </div>
              <div class="bookmark-content">
                <h3 class="bookmark-title" :title="book.title">{{ book.title }}</h3>
                <p class="bookmark-description" :title="book.description">{{ book.description }}</p>
              </div>
              <div class="bookmark-link">
                <i class="layui-icon layui-icon-right"></i>
              </div>
            </div>
          </div>
        </div>
      </lay-container>
    </lay-body>
    <lay-backtop target="#content" :showHeight="100" :bottom="30" position="absolute"></lay-backtop>
  </lay-layout>
</template>

<script setup>
import {computed, nextTick, onMounted, ref, watch} from "vue";
import {getBookMarks} from "@/api/webs/bookMark/index";
import {getAllNodeFieldArr} from "@/utils/treeUtil";

const menus = ref([]);
const currentPath = ref("all");
const currentCategoryName = ref("全部");
const currentMenu = ref({});
const filterBookText = ref("");
const dataSource = ref("0");
const bookData = ref([]);
const bookShowData = ref([]);
const allBooksData = ref([]); // 保存所有书签数据
const loading = ref(false);

const isMenuVisible = ref(true);
const menuVisible = computed(() => (isMenuVisible.value ? "240px" : "0px"));

// 监听搜索输入
watch(filterBookText, (val) => {
  if (val.trim() === "") {
    bookShowData.value = bookData.value;
  } else {
    bookShowData.value = bookData.value.filter(b => 
      b.title.toLowerCase().includes(val.toLowerCase()) || 
      b.description.toLowerCase().includes(val.toLowerCase())
    );
  }
});

/**
 * 数据源切换
 */
const dataSourceChange = async function (val) {
  console.log("dataSourceChange", val);
  loading.value = true;
  try {
    const res = await getBookMarks({"dataSource": dataSource.value});
    
    // 处理不同的数据结构
    if (res.data && Array.isArray(res.data)) {
      menus.value = [];
      
      // 生成基于标题首字符的默认图标
      const generateDefaultAvatar = (title) => {
        // 获取标题首字符，默认为"书"
        let firstChar = "书";
        try {
          if (title && typeof title === 'string' && title.length > 0) {
            firstChar = title.charAt(0);
          }
        } catch (error) {
          console.error('获取标题首字符失败:', error);
        }
        
        // 编码SVG中的文本，添加错误处理
        let encodedChar = "书";
        try {
          encodedChar = encodeURIComponent(firstChar);
        } catch (error) {
          console.error('编码字符失败:', error);
        }
        
        // 生成SVG图标
        return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"%3E%3Crect width="48" height="48" rx="8" fill="%23f8f9fa" stroke="%23e9ecef" stroke-width="1"/%3E%3Cg fill="%2316a085"%3E%3Cpath d="M12 16h24v20H12z"/%3E%3Cpath d="M16 8v8h16V8z"/%3E%3C/g%3E%3Ctext x="50%25" y="55%25" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="white"%3E${encodedChar}%3C/text%3E%3C/svg%3E`;
      };
      
      // 处理书签数据，添加默认图标
      const processBooks = (books) => {
        if (!Array.isArray(books)) return [];
        return books.map(book => ({
          ...book,
          avatar: book.avatar || generateDefaultAvatar(book.title)
        }));
      };
      
      // 检查数据结构
      const firstItem = res.data[0];
      if (firstItem && firstItem.books && Array.isArray(firstItem.books)) {
        // 两级结构：直接是可点击的菜单项，需要在外边套一层
        menus.value.push({
          id: `main_${Date.now()}`,
          title: "书签分类",
          children: res.data.map(item => ({
            id: item.id || `child_${Date.now()}_${Math.random()}`,
            title: item.name || item.title || item.id,
            books: processBooks(item.books)
          }))
        });
      } else if (firstItem && firstItem.children && Array.isArray(firstItem.children)) {
        // 三级结构：有主目录和子菜单，按返回的结构来
        res.data.forEach(item => {
          menus.value.push({
            id: item.id || `menu_${Date.now()}_${Math.random()}`,
            title: item.name || item.title,
            children: item.children.map(child => ({
              id: child.id || `child_${Date.now()}_${Math.random()}`,
              title: child.name || child.title,
              books: processBooks(child.books)
            }))
          });
        });
      } else {
        // 其他情况：尝试作为两级结构处理
        menus.value.push({
          id: `main_${Date.now()}`,
          title: "书签分类",
          children: res.data.map(item => ({
            id: item.id || `child_${Date.now()}_${Math.random()}`,
            title: item.name || item.title || item.id,
            books: processBooks(item.books || [])
          }))
        });
      }
      
      // 计算所有书签数据
      allBooksData.value = [];
      menus.value.forEach(menu => {
        if (menu.books) {
          allBooksData.value = [...allBooksData.value, ...menu.books];
        } else if (menu.children) {
          menu.children.forEach(child => {
            if (child.books) {
              allBooksData.value = [...allBooksData.value, ...child.books];
            }
          });
        }
      });
      
      // 创建"书签总览"菜单组，包含"全部"菜单项
      const allMenuGroup = {
        title: "书签总览",
        children: [{
          id: "all",
          title: "全部",
          books: allBooksData.value
        }]
      };
      
      // 将"总览"菜单组添加到最前面
      menus.value.unshift(allMenuGroup);
      
      // 默认选中"全部"选项
      currentPath.value = "all";
      currentCategoryName.value = "全部";
      bookData.value = allBooksData.value;
      bookShowData.value = allBooksData.value;
    }
  } catch (error) {
    console.error('获取书签数据失败:', error);
  } finally {
    loading.value = false;
  }
};

/**
 * 菜单子项点击
 */
const handleClick = async function (menu) {
  currentMenu.value = menu;
  currentPath.value = menu.id;
  currentCategoryName.value = menu.title;
  
  if (menu.id === "all") {
    // 使用预计算的所有书签数据
    bookData.value = allBooksData.value;
  } else if (menu.books) {
    bookData.value = menu.books;
  } else if (menu.children && menu.children.length > 0) {
    // 处理有children的情况
    bookData.value = getAllNodeFieldArr([menu], [], "books").flat();
  } else {
    // 默认情况
    bookData.value = [];
  }
  
  bookShowData.value = bookData.value;
};

/**
 * 打开链接
 */
const openLink = function (link) {
  if (link && link !== '#') {
    window.open(link, '_blank');
  }
};

/**
 * 图片加载失败处理
 */
const handleImageError = function (event) {
  // 使用更简单可靠的默认图标
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"%3E%3Crect width="48" height="48" rx="8" fill="%23f8f9fa" stroke="%23e9ecef" stroke-width="1"/%3E%3Cg fill="%2316a085"%3E%3Cpath d="M12 16h24v20H12z"/%3E%3Cpath d="M16 8v8h16V8z"/%3E%3C/g%3E%3Ctext x="50%25" y="55%25" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="white"%3E书%3C/text%3E%3C/svg%3E';
};

/**
 * 初始化页面
 */
const initPage = async function () {
  await dataSourceChange();
};

onMounted(() => {
  initPage();
});
</script>

<style scoped>
.layui-layout-website > .layui-layout > .layui-body {
  left: v-bind(menuVisible);
  width: calc(100% - v-bind(menuVisible));
}

/* 主容器 */
.main-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8eaed;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.data-source-select {
  width: 180px;
}

.search-input {
  width: 300px;
}

/* 统计栏 */
.stats-bar {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border-radius: 12px;
  border: 1px solid #e8eaed;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
}

.stat-value {
  font-size: 16px;
  color: #2c3e50;
  font-weight: 600;
}

/* 书签容器 */
.bookmarks-container {
  min-height: 400px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f2f5;
}

.empty-icon {
  font-size: 64px;
  opacity: 0.4;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.empty-state p {
  font-size: 14px;
  color: #95a5a6;
  margin: 0;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-state p {
  margin: 20px 0 0 0;
  font-size: 15px;
  color: #606266;
  font-weight: 500;
}

/* 书签网格 */
.bookmarks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

/* 书签卡片 */
.bookmark-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8eaed;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.bookmark-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(135deg, #16a085 0%, #2ecc71 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.bookmark-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
  border-color: #16a085;
}

.bookmark-card:hover::before {
  opacity: 1;
}

/* 书签图标 */
.bookmark-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  margin-right: 16px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bookmark-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.bookmark-card:hover .bookmark-icon img {
  transform: scale(1.1);
}

/* 书签内容 */
.bookmark-content {
  flex: 1;
  min-width: 0;
}

.bookmark-title {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.bookmark-card:hover .bookmark-title {
  color: #16a085;
}

.bookmark-description {
  font-size: 13px;
  color: #7f8c8d;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

/* 书签链接指示器 */
.bookmark-link {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f8f9fa;
  color: #95a5a6;
  transition: all 0.3s ease;
}

.bookmark-card:hover .bookmark-link {
  background: #16a085;
  color: #ffffff;
  transform: translateX(4px);
}

/* 响应式设计 */
@media screen and (max-width: 1200px) {
  .bookmarks-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media screen and (max-width: 768px) {
  .main-container {
    padding: 16px;
  }

  .toolbar {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
  }

  .data-source-select,
  .search-input {
    width: 100%;
  }

  .stats-bar {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }

  .bookmarks-grid {
    grid-template-columns: 1fr;
  }

  .bookmark-card {
    padding: 12px;
  }

  .bookmark-icon {
    width: 40px;
    height: 40px;
    margin-right: 12px;
  }

  .bookmark-title {
    font-size: 14px;
  }

  .bookmark-description {
    font-size: 12px;
  }
}

/* 确保悬浮按钮在小窗口时可见 */
@media screen and (max-width: 768px) {
  :deep(.floating-toggle-btn) {
    display: flex !important;
  }
}
</style>