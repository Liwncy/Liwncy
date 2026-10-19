<script setup lang="ts">
import { computed } from 'vue'
import type { TrendItem } from '../../api/trends'

const props = defineProps<{
  item: TrendItem & { boardName: string }
  showBoard: boolean
}>()

const hot = computed(
  () => props.item.hotLabel || (props.item.hotValue ? String(props.item.hotValue) : ''),
)
const detail = computed(() =>
  props.item.detail && props.item.detail !== props.item.title ? props.item.detail : '',
)
</script>

<template>
  <span class="trend-rank" :data-top="item.rank <= 3">{{ item.rank }}</span>
  <span class="trend-copy">
    <span class="trend-title">{{ item.title }}</span>
    <span v-if="showBoard || detail" class="trend-meta">
      <template v-if="showBoard">{{ item.boardName }}</template>
      <template v-if="showBoard && detail"> · </template>
      <template v-if="detail">{{ detail }}</template>
    </span>
  </span>
  <span v-if="hot" class="trend-hot">{{ hot }}</span>
</template>
