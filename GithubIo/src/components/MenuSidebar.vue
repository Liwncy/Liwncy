<template>
  <!-- 添加悬浮按钮 -->
  <div class="floating-toggle-btn"
       :class="{ 'floating-btn-hidden': !visible }"
       @click="toggleMenu">
    <i class="toggle-icon" :class="visible ? 'icon-hide' : 'icon-show'"></i>
    <span class="toggle-tooltip">{{ visible ? '隐藏菜单' : '显示菜单' }}</span>
  </div>

  <lay-side class="layui-menu-ref-1" :class="{ 'menu-collapsed': !visible }">
    <lay-scroll style="overflow-y: scroll">
      <ul class="layui-menu layui-menu-lg layui-menu-docs">
        <!-- 空状态处理 -->
        <div v-if="!menus.length" class="empty-menu">
          暂无菜单数据
        </div>

        <li v-for="menu in menus"
            :key="menu.key || menu.title"
            class="layui-menu-item-group"
            :lay-options="{type: 'group', isAllowSpread: true}"
        >
          <div class="layui-menu-body-title layui-font-16">{{ menu.title }}</div>
          <hr/>
          <ul>
            <li v-for="child in menu.children"
                :key="child.key || child.id"
                :class="[
                  'menu-item',
                  currentPath === child.id ? 'layui-menu-item-checked2' : ''
                ]"
                @click="handleChildClick(child)"
            >
              <div class="layui-menu-body-title">
                <a href="javascript:void(0)" role="button" tabindex="0">
                  <span>{{ child.title }}</span>
                  <span v-if="child.subTitle" class="layui-font-12 layui-font-gray">
                    {{ child.subTitle }}
                  </span>
                </a>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </lay-scroll>
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
/* 样式保持不变 */
.floating-toggle-btn {
  position: fixed;
  top: 200px;
  left: 210px;
  z-index: 1001;
  width: 40px;
  height: 40px;
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 50%;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.floating-toggle-btn:hover {
  background: #f5f5f5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

.floating-toggle-btn:hover .toggle-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.floating-btn-hidden {
  left: 20px !important;
}

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
  background: #333;
  transition: all 0.3s ease;
}

.icon-show::before {
  top: 4px;
  left: 0;
  width: 16px;
  height: 2px;
  box-shadow: 0 5px 0 #333, 0 10px 0 #333;
}

.icon-hide::before {
  top: 7px;
  left: 3px;
  width: 10px;
  height: 2px;
  background: #333;
  transform: rotate(45deg);
}

.icon-hide::after {
  top: 7px;
  right: 3px;
  width: 10px;
  height: 2px;
  background: #333;
  transform: rotate(-45deg);
}

.toggle-tooltip {
  position: absolute;
  left: 110%;
  top: 50%;
  transform: translateY(-50%) translateX(-10px);
  white-space: nowrap;
  background: #333;
  color: #fff;
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
  border-right-color: #333;
}

.layui-menu-ref-1 {
  transition: width 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.menu-collapsed {
  transform: translateX(-100%);
}

@media screen and (max-width: 768px) {
  .floating-toggle-btn {
    top: 60px;
    left: 195px;
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
}

.layui-menu-toggle {
  display: none;
}

.empty-menu {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}

.menu-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background-color: #f8f9fa;
}
</style>