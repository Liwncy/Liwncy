<template>
  <div style="padding: 20px">
    <div v-html="htmlContent" class="markdown-body"></div>
    <div ref="container" id="appc"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref,watch } from 'vue';
import { md, initClipboard } from '@/utils/markdownSetup';
import "highlight.js/styles/atom-one-dark.css";

export default defineComponent({
  name: 'MarkdownRenderer',
  props: {
    content: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const htmlContent = ref('');

    // 添加对 markdownContent 的监听
    watch(
        () => props.content,
        (newContent) => {
          htmlContent.value = md.render(newContent||"");
        },
        { immediate: true }
    );

    onMounted(() => {
      htmlContent.value = md.render(props.content||"");
      initClipboard(); // 初始化Clipboard.js
    });

    return {
      htmlContent
    };
  }
});
</script>

<style scoped>
/* 添加一些基本样式以防止XSS攻击 */
</style>
