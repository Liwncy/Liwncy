<template>
  <!-- 原有布局结构，替换为组件属性和事件 -->
  <lay-side class="layui-menu-ref-2">
    <lay-scroll style="overflow-y: scroll">
      <ul class="layui-menu layui-menu-lg layui-menu-docs">
        <!-- 外层菜单循环：使用组件传入的menus属性 -->
        <!-- 优化key值，避免仅用menu作为key的潜在问题 -->
        <li v-for="menu in menus"
            :key="menu.key || menu.title"
            class="layui-menu-item-group"
            lay-options="{type: 'group', isAllowSpread: true}"
        >
          <div class="layui-menu-body-title">{{ menu.title }}</div>
          <hr/>
          <ul>
            <!-- 内层子菜单循环：使用当前菜单的children -->
            <!-- 优化key值，提升稳定性 -->
            <!-- 内部点击逻辑，派发事件给父组件 -->
            <li v-for="children in menu.children"
                :key="children.key || children.id"
                :class="[currentPath === children.id ? 'layui-menu-item-checked2': '']"
                @click="handleChildClick(children)"
            >
              <div class="layui-menu-body-title">
                <a href="javascript:void(0)">
                  <span>{{ children.title }}</span>
                  <span class="layui-font-12 layui-font-gray">
                    {{ children.subTitle }}
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
import {defineProps, defineEmits} from 'vue';

// 1. 定义组件属性（Props）：对外暴露可配置的参数
const props = defineProps({
  // 菜单数据源（必传，数组类型，限制结构提升可用性）
  menus: {
    type: Array,
    required: true,
    default: () => [],
    // 可选：添加类型校验，确保传入数据结构合规
    validator: (value) => {
      return value.every(menu => {
        return !!menu.title && Array.isArray(menu.children) && menu.children.every(child => !!child.id && !!child.title);
      });
    }
  },
  // 当前选中的路径（对应子菜单的id，非必传，字符串/数字类型）
  currentPath: {
    type: [String, Number],
    required: false,
    default: ''
  }
});

// 2. 定义组件事件（Emits）：向外派发子菜单点击事件
const emit = defineEmits({
  // 子菜单点击事件：派发点击的子菜单数据给父组件
  childClick: (childData) => {
    // 可选：事件参数校验，确保派发的数据有效
    return !!childData && !!childData.id;
  }
});

// 3. 内部点击处理函数：触发事件派发
const handleChildClick = (children) => {
  // 派发childClick事件，并传递子菜单数据
  emit('childClick', children);
};
</script>

<style scoped>
/* 保留原有样式，若需要全局样式可移除scoped或使用:deep() */
/* 若layui相关样式已全局引入，此处无需额外编写 */
.layui-menu-ref-2 {
  /* 可根据需要补充组件专属样式，默认继承原有样式 */
}
</style>