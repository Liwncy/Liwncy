<template>
  <lay-card>
    <lay-empty :description="description">
      <template #extra>
        <lay-button type="primary" @click="router.push('/')">返回首页</lay-button>
      </template>
    </lay-empty>
  </lay-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const description = computed(() => {
  return (route.meta.placeholder as string) ?? '页面建设中…'
})
</script>
