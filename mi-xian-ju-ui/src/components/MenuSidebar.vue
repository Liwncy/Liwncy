<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import type { SideMenuChild, SideMenuGroup } from '@/types/side-menu'

const visible = defineModel<boolean>('visible', { default: true })

defineProps<{
  menus: SideMenuGroup[]
  currentPath: string | number
}>()

const emit = defineEmits<{
  childClick: [child: SideMenuChild]
}>()

function toggleMenu() {
  visible.value = !visible.value
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    toggleMenu()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

let clickTimer: ReturnType<typeof setTimeout> | undefined

function handleChildClick(child: SideMenuChild) {
  if (clickTimer) clearTimeout(clickTimer)
  clickTimer = setTimeout(() => emit('childClick', child), 150)
}

defineExpose({
  toggleMenu: () => { visible.value = !visible.value },
  showMenu: () => { visible.value = true },
  hideMenu: () => { visible.value = false },
})
</script>

<template>
  <div
    class="floating-toggle-btn"
    :class="{ 'floating-btn-hidden': !visible }"
    @click="toggleMenu"
  >
    <div class="toggle-icon" :class="visible ? 'icon-hide' : 'icon-show'" />
    <span class="toggle-tooltip">{{ visible ? '隐藏菜单' : '显示菜单' }}</span>
  </div>

  <lay-side class="layui-menu-ref-1" :class="{ 'menu-collapsed': !visible }">
    <lay-scroll style="flex: 1; overflow-y: auto">
      <ul class="layui-menu layui-menu-lg layui-menu-docs">
        <div v-if="!menus.length" class="empty-menu">
          <div class="empty-icon">📋</div>
          <p>暂无菜单数据</p>
        </div>

        <li
          v-for="menu in menus"
          :key="menu.title"
          class="menu-group"
        >
          <div class="group-title">{{ menu.title }}</div>
          <div class="group-divider" />
          <ul>
            <li
              v-for="child in menu.children"
              :key="String(child.id)"
              class="menu-item"
              :class="{ 'menu-item-active': currentPath === child.id }"
              @click="handleChildClick(child)"
            >
              <div class="menu-item-content">
                <span class="menu-item-title">{{ child.title }}</span>
              </div>
              <div v-if="currentPath === child.id" class="menu-item-indicator" />
            </li>
          </ul>
        </li>
      </ul>
    </lay-scroll>
    <div class="sidebar-footer">
      <small>© {{ new Date().getFullYear() }}</small>
    </div>
  </lay-side>
</template>

<style scoped>
.floating-toggle-btn {
  position: fixed;
  top: 200px;
  left: 250px;
  z-index: 1001;
  width: 40px;
  height: 40px;
  background: #fff;
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
}

.floating-btn-hidden {
  left: 10px !important;
}

.toggle-icon {
  width: 16px;
  height: 16px;
  position: relative;
}

.toggle-icon::before,
.toggle-icon::after {
  content: '';
  position: absolute;
  background: #495057;
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

.toggle-tooltip {
  position: absolute;
  left: 110%;
  top: 50%;
  transform: translateY(-50%) translateX(-10px);
  white-space: nowrap;
  background: #343a40;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.menu-sidebar,
.layui-menu-ref-1 {
  width: 240px !important;
  height: 100vh;
  background: #fff;
  border-right: 1px solid #e9ecef;
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.menu-collapsed {
  transform: translateX(-100%);
}

.sidebar-footer {
  padding: 10px 16px;
  border-top: 1px solid #f1f3f4;
  background: #f8f9fa;
  text-align: center;
  color: #6c757d;
  font-size: 10px;
}

.menu-group {
  margin-bottom: 12px;
}

.group-title {
  padding: 0 16px 6px;
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  margin-top: 12px;
}

.group-divider {
  height: 1px;
  margin: 0 16px;
  background: #f1f3f4;
}

.menu-item {
  position: relative;
  cursor: pointer;
  margin: 2px 10px;
  border-radius: 6px;
}

.menu-item:hover {
  background: #f8f9fa;
}

.menu-item-content {
  padding: 8px 14px;
}

.menu-item-title {
  font-size: 14px;
  font-weight: 500;
  color: #212529;
}

.menu-item-active {
  background: #e3f2fd;
}

.menu-item-active .menu-item-title {
  color: #1976d2;
  font-weight: 600;
}

.menu-item-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #1976d2;
}

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

@media screen and (max-width: 768px) {
  .floating-toggle-btn {
    display: flex;
    top: 72px;
    left: 10px;
  }

  .layui-menu-ref-1 {
    position: fixed;
    left: 0;
    top: 56px;
    bottom: 0;
    z-index: 1000;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }
}
</style>
