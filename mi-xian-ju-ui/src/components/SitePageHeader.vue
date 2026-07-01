<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <header class="site-page-header">
    <div class="site-page-header-main">
      <h1><slot name="title">{{ title }}</slot></h1>
      <p v-if="subtitle || $slots.subtitle" class="site-page-subtitle">
        <slot name="subtitle">{{ subtitle }}</slot>
      </p>
    </div>
    <div v-if="$slots.extra" class="site-page-header-extra">
      <slot name="extra" />
    </div>
  </header>
</template>
