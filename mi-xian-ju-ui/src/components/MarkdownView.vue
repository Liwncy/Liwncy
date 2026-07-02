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
  color: var(--site-ink, #2c3330);
  font-size: 15px;
  line-height: 1.9;
  letter-spacing: 0.01em;
}

.markdown-view :deep(h1),
.markdown-view :deep(h2),
.markdown-view :deep(h3) {
  position: relative;
  margin: 1.5em 0 0.7em;
  color: var(--site-ink, #2c3330);
  font-family: var(--site-font-title, 'Songti SC', serif);
  line-height: 1.35;
  letter-spacing: 0.04em;
}

.markdown-view :deep(h1) {
  padding-bottom: 12px;
  border-bottom: 1px solid var(--site-border, rgba(44, 51, 48, 0.1));
  font-size: 30px;
}

.markdown-view :deep(h2) {
  font-size: 24px;
}

.markdown-view :deep(h2::before) {
  content: '';
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 9px;
  border-radius: 50%;
  background: var(--site-accent-gradient, linear-gradient(90deg, #1f9d8a, #2f8f68));
  box-shadow: 0 0 0 5px rgba(22, 186, 170, 0.08);
  vertical-align: middle;
}

.markdown-view :deep(h3) {
  font-size: 19px;
}

.markdown-view :deep(p) {
  margin: 0.9em 0;
  color: var(--site-ink, #2c3330);
}

.markdown-view :deep(a) {
  color: var(--site-accent, #1f9d8a);
  text-decoration: none;
  border-bottom: 1px solid rgba(22, 186, 170, 0.24);
}

.markdown-view :deep(a:hover) {
  border-bottom-color: currentColor;
}

.markdown-view :deep(blockquote) {
  margin: 1.1em 0;
  padding: 14px 18px;
  border-left: 4px solid var(--site-accent, #1f9d8a);
  border-radius: 0 14px 14px 0;
  background:
    linear-gradient(90deg, rgba(22, 186, 170, 0.09), rgba(22, 186, 170, 0.03));
  color: var(--site-muted, #6b736f);
}

.markdown-view :deep(blockquote p) {
  margin: 0.4em 0;
  color: inherit;
}

.markdown-view :deep(ul),
.markdown-view :deep(ol) {
  padding-left: 1.4em;
}

.markdown-view :deep(li) {
  margin: 0.35em 0;
}

.markdown-view :deep(hr) {
  height: 1px;
  margin: 28px 0;
  border: 0;
  background: linear-gradient(90deg, transparent, var(--site-border, rgba(44, 51, 48, 0.1)), transparent);
}

.markdown-view :deep(code) {
  padding: 2px 7px;
  border: 1px solid rgba(22, 186, 170, 0.13);
  border-radius: 7px;
  background: rgba(22, 186, 170, 0.08);
  color: #0b8278;
  font-family: 'Cascadia Code', 'Fira Code', 'Courier New', monospace;
  font-size: 0.92em;
}

.markdown-view :deep(pre) {
  position: relative;
  margin: 1.2em 0;
  padding: 18px 20px;
  overflow-x: auto;
  border: 1px solid rgba(44, 51, 48, 0.12);
  border-radius: 16px;
  background:
    radial-gradient(circle at 100% 0, rgba(22, 186, 170, 0.1), transparent 35%),
    #1e2824;
  color: #edf5f1;
  box-shadow: 0 14px 34px rgba(44, 51, 48, 0.12);
}

.markdown-view :deep(pre code) {
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 13px;
  line-height: 1.8;
}

.markdown-view :deep(table) {
  width: 100%;
  margin: 1.2em 0;
  overflow: hidden;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid var(--site-border, rgba(44, 51, 48, 0.1));
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.56);
}

.markdown-view :deep(th),
.markdown-view :deep(td) {
  padding: 11px 14px;
  border-bottom: 1px solid var(--site-border, rgba(44, 51, 48, 0.1));
  text-align: left;
}

.markdown-view :deep(th) {
  color: var(--site-ink, #2c3330);
  background: rgba(22, 186, 170, 0.08);
  font-weight: 700;
}

.markdown-view :deep(tr:last-child td) {
  border-bottom: 0;
}

.markdown-view :deep(img) {
  max-width: 100%;
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(44, 51, 48, 0.12);
}

:global(.site-theme-dark) .markdown-view :deep(code) {
  color: #78e0d4;
  background: rgba(22, 186, 170, 0.12);
  border-color: rgba(22, 186, 170, 0.22);
}

:global(.site-theme-dark) .markdown-view :deep(table) {
  background: rgba(255, 255, 255, 0.04);
}

@media screen and (max-width: 768px) {
  .markdown-view {
    font-size: 14px;
  }

  .markdown-view :deep(h1) {
    font-size: 26px;
  }

  .markdown-view :deep(h2) {
    font-size: 21px;
  }
}
</style>
