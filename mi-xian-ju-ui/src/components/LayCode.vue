<script setup lang="ts">
import { layer } from '@layui/layer-vue'
import { onMounted, ref, watch } from 'vue'

const meta = ref<HTMLElement>()
const show = ref(false)
const codeAreaHeight = ref(0)

function toggle() {
  show.value = !show.value
}

async function copy() {
  const foundCode = meta.value?.getElementsByClassName('language-html')[0]
  const text = foundCode?.textContent || ''

  if (!text) {
    layer.msg('没有可复制的代码', { icon: 2, time: 1000 })
    return
  }

  try {
    await navigator.clipboard.writeText(text)
    layer.msg('复制成功', { icon: 1, time: 1000 })
  } catch {
    layer.msg('复制失败', { icon: 2, time: 1000 })
  }
}

onMounted(() => {
  const foundDescs = meta.value?.getElementsByClassName('description') ?? []
  const foundCodes = meta.value?.getElementsByClassName('language-html') ?? []
  const codeHeight = foundCodes[0]?.clientHeight ?? 0
  const descHeight = foundDescs[0]?.clientHeight ?? 0
  codeAreaHeight.value = codeHeight + descHeight + (descHeight ? 30 : 20)
})

watch(show, (value) => {
  if (!meta.value) return
  meta.value.style.height = value ? `${codeAreaHeight.value}px` : '0'
})
</script>

<template>
  <div class="lay-code">
    <div class="source">
      <slot />
      <div v-if="$slots.description" class="description">
        <slot name="description" />
      </div>
    </div>
    <div ref="meta" class="meta">
      <div class="language-html">
        <slot name="code" />
      </div>
    </div>
    <div class="control">
      <i class="layui-icon layui-icon-file btn" title="复制代码" @click="copy" />
      <i class="layui-icon layui-icon-fonts-code btn" title="查看代码" @click="toggle" />
    </div>
  </div>
</template>

<style>
.lay-code {
  margin: 1rem 0;
  border: 1px solid var(--docs-border-color, #d8dde3);
  border-radius: 3px;
  transition: all 0.2s;
}

.lay-code .source {
  padding: 24px 24px 15px;
}

.lay-code .meta {
  height: 0;
  padding: 0 10px;
  overflow: hidden;
  transition: height 0.2s;
}

.lay-code .source .description {
  box-sizing: border-box;
  margin: 20px 0 0;
  padding: 20px;
  border: 1px solid var(--docs-border-color, #d8dde3);
  font-size: 14px;
  line-height: 22px;
  word-break: break-word;
}

.lay-code .source .description p {
  margin: 0 !important;
  line-height: 26px !important;
}

.lay-code .source .description code {
  margin: 0 1px;
  padding: 0.2em 0.4em;
  border: 1px solid var(--docs-border-color, #d8dde3);
  border-radius: 3px;
  background: #f2f4f5;
  font-size: 0.9em;
}

.lay-code .control {
  box-sizing: border-box;
  width: 100%;
  height: 44px;
  margin-top: 10px;
  border-top: 1px solid var(--docs-border-color, #d8dde3);
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  background-color: white;
  text-align: center;
  cursor: pointer;
  user-select: none;
}

.lay-code .control > i {
  display: inline-block;
  padding-right: 10px;
  padding-left: 10px;
  font-size: 16px;
  line-height: 44px;
  transition: all 0.3s;
}

.btn:hover::before {
  color: #5fb878;
}
</style>
