<template>
  <!-- 添加悬浮按钮 -->
  <div class="floating-toggle-btn"
       :class="{ 'floating-btn-hidden': !visible }"
       @click="toggleMenu">
    <div class="toggle-icon" :class="visible ? 'icon-hide' : 'icon-show'"></div>
    <span class="toggle-tooltip">{{ visible ? '隐藏菜单' : '显示菜单' }}</span>
  </div>

  <lay-side class="layui-menu-ref-1" :class="{ 'menu-collapsed': !visible }">
    <lay-scroll style="flex: 1; overflow-y: auto;">
      <ul class="layui-menu layui-menu-lg layui-menu-docs">
        <!-- 空状态处理 -->
        <div v-if="!menus.length" class="empty-menu">
          <div class="empty-icon">📋</div>
          <p>暂无菜单数据</p>
        </div>

        <li v-for="menu in menus"
            :key="menu.key || menu.title"
            class="menu-group"
            :lay-options="{type: 'group', isAllowSpread: true}">
          <div class="group-title">{{ menu.title }}</div>
          <div class="group-divider"></div>
          <ul>
            <li v-for="child in menu.children"
                :key="child.key || child.id"
                :class="[
                  'menu-item',
                  currentPath === child.id ? 'menu-item-active' : ''
                ]"
                @click="handleChildClick(child)">
              <div class="menu-item-content">
                <div class="menu-item-main">
                  <span class="menu-item-title">{{ child.title }}</span>
                  <span v-if="child.subTitle" class="menu-item-subtitle">{{ child.subTitle }}</span>
                </div>
              </div>
              <div v-if="currentPath === child.id" class="menu-item-indicator"></div>
            </li>
          </ul>
        </li>
      </ul>
    </lay-scroll>
    <div class="sidebar-footer">
      <div class="footer-info">
        <small>© {{ new Date().getFullYear() }}</small>
      </div>
    </div>
  </lay-side>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

// 🔥 使用 defineModel() 替代原来的 ref 和 props
const visible = defineModel('visible', {
  type: Boolean,
  default: true
});

// 其他 props（移除 visible 和 menuWidth）
defineProps({
  menus: {
    type: Array,
    required: true,
    default: () => [],
    validator: (value) => {
      if (!Array.isArray(value)) return false;
      return value.every(menu => {
        return menu &&
            typeof menu.title === 'string' &&
            Array.isArray(menu.children) &&
            menu.children.every(child => child && child.id && child.title);
      });
    }
  },
  currentPath: {
    type: [String, Number],
    default: ''
  }
});

const emit = defineEmits({
  childClick: (childData) => {
    return childData && childData.id && childData.title;
  }
});

// 切换菜单显示/隐藏 - 直接修改 visible
const toggleMenu = () => {
  visible.value = !visible.value;
};

// 键盘快捷键支持（ESC键切换菜单）
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    toggleMenu();
  }
};

// 添加全局键盘事件监听
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

let clickTimer = null;
const handleChildClick = (child) => {
  if (clickTimer) clearTimeout(clickTimer);

  clickTimer = setTimeout(() => {
    emit('childClick', child);
  }, 150);
};

// 暴露方法给父组件
defineExpose({
  toggleMenu: () => visible.value = !visible.value,
  showMenu: () => visible.value = true,
  hideMenu: () => visible.value = false
});
</script>

<style scoped>
/* 悬浮按钮样式 */
.floating-toggle-btn {
  position: fixed;
  top: 200px;
  left: 250px;
  z-index: 1001;
  width: 40px;
  height: 40px;
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 50%;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.floating-toggle-btn:hover {
  background: #f8f9fa;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: scale(1.05);
}

.floating-toggle-btn:hover .toggle-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.floating-btn-hidden {
  left: 10px !important;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 切换图标样式 */
.toggle-icon {
  width: 16px;
  height: 16px;
  position: relative;
  transition: transform 0.3s ease;
}

.toggle-icon::before,
.toggle-icon::after {
  content: '';
  position: absolute;
  background: #495057;
  transition: all 0.3s ease;
  border-radius: 1px;
}

.icon-show::before {
  top: 4px;
  left: 0;
  width: 16px;
  height: 2px;
  box-shadow: 0 5px 0 #495057, 0 10px 0 #495057;
}

.icon-hide::before {
  top: 7px;
  left: 3px;
  width: 10px;
  height: 2px;
  transform: rotate(45deg);
}

.icon-hide::after {
  top: 7px;
  right: 3px;
  width: 10px;
  height: 2px;
  transform: rotate(-45deg);
}

/* 提示框样式 */
.toggle-tooltip {
  position: absolute;
  left: 110%;
  top: 50%;
  transform: translateY(-50%) translateX(-10px);
  white-space: nowrap;
  background: #343a40;
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
}

.toggle-tooltip::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 4px solid transparent;
  border-right-color: #343a40;
}

/* 侧边栏基础样式 */
.layui-menu-ref-1 {
  width: 240px !important;
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid #e9ecef;
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.menu-collapsed {
  transform: translateX(-100%);
}



/* 侧边栏底部 */
.sidebar-footer {
  padding: 10px 16px;
  border-top: 1px solid #f1f3f4;
  background: #f8f9fa;
  text-align: center;
}

.footer-info {
  font-size: 10px;
  color: #6c757d;
}

/* 菜单组样式 */
.menu-group {
  margin-bottom: 12px;
}

.group-title {
  padding: 0 16px 6px;
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 12px;
}

.group-divider {
  height: 1px;
  margin: 0 16px;
  background: #f1f3f4;
}

/* 菜单项样式 */
.menu-item {
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 2px 10px;
  border-radius: 6px;
  overflow: hidden;
}

.menu-item:hover {
  background: #f8f9fa;
}

.menu-item-content {
  padding: 8px 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  min-width: 0;
}

.menu-item-main {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
}

.menu-item-title {
  font-size: 14px;
  font-weight: 500;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-item-subtitle {
  font-size: 11px;
  color: #6c757d;
  margin-left: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 激活状态样式 */
.menu-item-active {
  background: #e3f2fd;
}

.menu-item-active .menu-item-title {
  color: #1976d2;
  font-weight: 600;
}

.menu-item-active .menu-item-subtitle {
  color: #1976d2;
  opacity: 0.8;
}

/* 激活指示器 */
.menu-item-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #1976d2;
}

/* 空状态样式 */
.empty-menu {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-menu p {
  margin: 0;
  font-size: 13px;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .floating-toggle-btn {
    top: 60px;
    left: 225px;
    width: 36px;
    height: 36px;
    display: flex;
  }

  .floating-btn-hidden {
    left: 10px !important;
  }

  .menu-collapsed {
    transform: translateX(-100%);
  }

  .layui-menu-ref-1 {
    width: 220px;
  }

  .group-title {
    padding: 0 16px 8px;
  }

  .group-divider {
    margin: 0 16px;
  }

  .menu-item {
    margin: 2px 8px;
  }

  .menu-item-content {
    padding: 8px 12px;
  }

  .menu-item-title {
    font-size: 13px;
  }

  .sidebar-header {
    padding: 12px 16px;
  }

  .sidebar-header h3 {
    font-size: 14px;
  }
}

/* 滚动条样式 */
.layui-scroll::-webkit-scrollbar {
  width: 3px;
}

.layui-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.layui-scroll::-webkit-scrollbar-thumb {
  background: #e1e5e9;
  border-radius: 3px;
}

.layui-scroll::-webkit-scrollbar-thumb:hover {
  background: #cbd3da;
}

/* 滚动条自动隐藏 */
.layui-scroll {
  scrollbar-width: thin;
  scrollbar-color: #e1e5e9 transparent;
}

.layui-scroll::-webkit-scrollbar-thumb {
  transition: background 0.2s ease;
}

/* 隐藏滚动条但保留滚动功能 */
.layui-scroll {
  -ms-overflow-style: none;
}

.layui-scroll::-webkit-scrollbar {
  width: 3px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.layui-scroll:hover::-webkit-scrollbar {
  opacity: 1;
}
</style>