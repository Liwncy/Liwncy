<script setup lang="ts">
import { computed, ref } from 'vue'
import BrandIcon from '../../components/BrandIcon.vue'

const props = defineProps<{
  href: string
  title: string
  host: string
  description: string
  avatar?: string
}>()

const brand = computed(() => {
  const name = props.host.replace(/^www\./, '')
  if (name === 'github.com' || name.endsWith('.github.com')) return 'github' as const
  if (name === 'gitee.com' || name.endsWith('.gitee.com')) return 'gitee' as const
  return null
})

const showAvatar = ref(Boolean(props.avatar))
const mark = computed(() => [...props.title.trim()][0] ?? '')
const line = computed(() => {
  const description = props.description.trim()
  if (description && description !== props.title.trim()) return description
  return props.host
})
</script>

<template>
  <a class="bookmark-card" :href="href" target="_blank" rel="noopener noreferrer">
    <span class="bookmark-seal" aria-hidden="true">
      <img v-if="avatar && showAvatar" :src="avatar" alt="" referrerpolicy="no-referrer" @error="showAvatar = false" />
      <BrandIcon v-else-if="brand" :name="brand" />
      <template v-else>{{ mark }}</template>
    </span>
    <span class="bookmark-copy">
      <strong>{{ title }}</strong>
      <span>{{ line }}</span>
    </span>
    <span class="bookmark-go" aria-hidden="true"></span>
  </a>
</template>
