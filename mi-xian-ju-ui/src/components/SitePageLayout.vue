<script setup lang="ts">
withDefaults(
  defineProps<{
    /** 侧栏宽度，如 240px / 0px */
    menuVisible: string
    bodyId?: string
    /** 是否显示回到顶部（与 lay-body 同级挂载） */
    backtop?: boolean
  }>(),
  {
    bodyId: 'content',
    backtop: true,
  },
)
</script>

<template>
  <lay-layout class="example" :style="{ '--sidebar-width': menuVisible }">
    <slot name="sidebar" />
    <lay-body :id="bodyId">
      <slot />
    </lay-body>
    <!-- 须与 lay-body 同级，监听 lay-body 的滚动 -->
    <lay-backtop
      v-if="backtop"
      :target="`#${bodyId}`"
      :showHeight="100"
      :bottom="30"
      position="absolute"
    />
  </lay-layout>
</template>
