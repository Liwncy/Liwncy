<script setup lang="ts">
withDefaults(
  defineProps<{
    /** 侧栏宽度，如 240px / 0px */
    menuVisible: string
    bodyId?: string
  }>(),
  {
    bodyId: 'content',
  },
)
</script>

<template>
  <lay-layout class="example" :style="{ '--sidebar-width': menuVisible }">
    <slot name="sidebar" />
    <lay-body :id="bodyId">
      <slot />
    </lay-body>
  </lay-layout>
</template>
