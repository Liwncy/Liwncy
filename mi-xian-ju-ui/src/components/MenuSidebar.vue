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
    <div class="sidebar-brand">
      <span class="brand-seal">芈</span>
      <div>
        <strong>仙居卷轴</strong>
        <small>择一处清闲</small>
      </div>
    </div>

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
      <small>山水有归处 · {{ new Date().getFullYear() }}</small>
    </div>
  </lay-side>
</template>

<style scoped>
.floating-toggle-btn {
  position: fixed;
  top: 200px;
  left: 250px;
  z-index: 1001;
  width: 42px;
  height: 42px;
  background:
    linear-gradient(135deg, rgba(255, 252, 245, 0.96), rgba(239, 246, 242, 0.94));
  border: 1px solid rgba(44, 51, 48, 0.12);
  border-radius: 50%;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(44, 51, 48, 0.12);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.floating-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(44, 51, 48, 0.16);
  border-color: rgba(22, 186, 170, 0.28);
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
  background: var(--site-ink, #2c3330);
  border-radius: 1px;
}

.icon-show::before {
  top: 4px;
  left: 0;
  width: 16px;
  height: 2px;
  box-shadow: 0 5px 0 var(--site-ink, #2c3330), 0 10px 0 var(--site-ink, #2c3330);
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
  background: rgba(32, 41, 37, 0.9);
  color: #fff;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 12px;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: all 0.2s ease;
}

.floating-toggle-btn:hover .toggle-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(-50%);
}

.menu-sidebar,
.layui-menu-ref-1 {
  width: 240px !important;
  height: 100vh;
  background:
    radial-gradient(circle at 25% 8%, rgba(22, 186, 170, 0.08), transparent 34%),
    linear-gradient(180deg, rgba(255, 252, 245, 0.96), rgba(245, 240, 230, 0.94));
  border-right: 1px solid rgba(44, 51, 48, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 10px 0 28px rgba(44, 51, 48, 0.06);
  backdrop-filter: blur(12px);
}

.layui-menu-ref-1::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(90deg, rgba(44, 51, 48, 0.035) 1px, transparent 1px),
    linear-gradient(rgba(44, 51, 48, 0.03) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.55), transparent 80%);
}

.sidebar-brand {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 18px 16px 8px;
  padding: 14px 12px;
  border: 1px solid rgba(44, 51, 48, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.48);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

.brand-seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #1f9d8a, #2f8f68);
  color: #fff;
  font-family: var(--site-font-title, 'Songti SC', serif);
  font-size: 22px;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(22, 186, 170, 0.24);
}

.sidebar-brand strong {
  display: block;
  color: var(--site-ink, #2c3330);
  font-family: var(--site-font-title, 'Songti SC', serif);
  font-size: 15px;
  letter-spacing: 0.08em;
}

.sidebar-brand small {
  display: block;
  margin-top: 3px;
  color: var(--site-muted, #6b736f);
  font-size: 12px;
  letter-spacing: 0.04em;
}

.menu-collapsed {
  transform: translateX(-100%);
}

.sidebar-footer {
  position: relative;
  z-index: 1;
  padding: 12px 16px 14px;
  border-top: 1px solid rgba(44, 51, 48, 0.08);
  background: rgba(255, 255, 255, 0.36);
  text-align: center;
  color: var(--site-muted, #6b736f);
  font-size: 10px;
  letter-spacing: 0.08em;
}

.menu-group {
  position: relative;
  z-index: 1;
  margin-bottom: 14px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 18px 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--site-muted, #6b736f);
  letter-spacing: 0.12em;
  text-transform: none;
  margin-top: 12px;
}

.group-title::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--site-accent-gradient);
  box-shadow: 0 0 0 4px rgba(22, 186, 170, 0.08);
}

.group-divider {
  height: 1px;
  margin: 0 18px 6px;
  background: linear-gradient(90deg, rgba(22, 186, 170, 0.18), transparent);
}

.menu-item {
  position: relative;
  cursor: pointer;
  margin: 3px 12px;
  border-radius: 12px;
  overflow: hidden;
  transition: background 0.2s ease, transform 0.2s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.52);
  transform: translateX(2px);
}

.menu-item-content {
  position: relative;
  z-index: 1;
  padding: 9px 14px;
}

.menu-item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--site-ink, #2c3330);
  letter-spacing: 0.02em;
}

.menu-item-active {
  background:
    linear-gradient(90deg, rgba(22, 186, 170, 0.16), rgba(22, 183, 119, 0.08)),
    rgba(255, 255, 255, 0.56);
  box-shadow: inset 0 0 0 1px rgba(22, 186, 170, 0.12);
}

.menu-item-active::after {
  content: '';
  position: absolute;
  right: 12px;
  top: 50%;
  width: 24px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(22, 186, 170, 0.38));
  transform: translateY(-50%);
}

.menu-item-active .menu-item-title {
  color: var(--site-accent);
  font-weight: 600;
}

.menu-item-indicator {
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 999px;
  background: var(--site-accent-gradient);
}

.empty-menu {
  position: relative;
  z-index: 1;
  text-align: center;
  margin: 28px 16px;
  padding: 34px 18px;
  color: var(--site-muted, #6b736f);
  border: 1px dashed rgba(44, 51, 48, 0.14);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.36);
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.5;
}

:global(.site-theme-dark) .floating-toggle-btn {
  background: linear-gradient(135deg, rgba(31, 39, 35, 0.94), rgba(22, 31, 27, 0.92));
  border-color: rgba(255, 255, 255, 0.08);
}

:global(.site-theme-dark) .toggle-icon::before,
:global(.site-theme-dark) .toggle-icon::after {
  background: #e5ebe8;
}

:global(.site-theme-dark) .icon-show::before {
  box-shadow: 0 5px 0 #e5ebe8, 0 10px 0 #e5ebe8;
}

:global(.site-theme-dark) .layui-menu-ref-1 {
  background:
    radial-gradient(circle at 20% 8%, rgba(22, 186, 170, 0.12), transparent 34%),
    linear-gradient(180deg, rgba(25, 34, 30, 0.96), rgba(19, 24, 22, 0.96));
  border-right-color: rgba(255, 255, 255, 0.08);
  box-shadow: 10px 0 32px rgba(0, 0, 0, 0.24);
}

:global(.site-theme-dark) .sidebar-brand,
:global(.site-theme-dark) .empty-menu {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

:global(.site-theme-dark) .menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

:global(.site-theme-dark) .menu-item-active {
  background:
    linear-gradient(90deg, rgba(22, 186, 170, 0.2), rgba(22, 183, 119, 0.08)),
    rgba(255, 255, 255, 0.05);
}

:global(.site-theme-dark) .sidebar-footer {
  background: rgba(255, 255, 255, 0.03);
  border-top-color: rgba(255, 255, 255, 0.08);
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
    height: calc(100vh - 56px);
    box-shadow: 16px 0 36px rgba(44, 51, 48, 0.16);
  }

  .sidebar-brand {
    margin-top: 14px;
  }
}
</style>
