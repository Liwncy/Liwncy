<script setup lang="ts">
import { useMarkdown } from '@/utils/markdown'
import { toRef } from 'vue'

const props = defineProps<{
  content?: string
}>()

const html = useMarkdown(toRef(props, 'content'))
</script>

<template>
  <article class="markdown-view" v-html="html" />
</template>

<style scoped>
.markdown-view {
  line-height: 1.75;
  color: #2c3e50;
}

.markdown-view :deep(h1),
.markdown-view :deep(h2),
.markdown-view :deep(h3) {
  margin-top: 1.2em;
  margin-bottom: 0.6em;
}

.markdown-view :deep(p) {
  margin: 0.8em 0;
}

.markdown-view :deep(code) {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
}

.markdown-view :deep(pre) {
  background: #1e1e1e;
  color: #eee;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}
</style>
