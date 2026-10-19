<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'

const model = defineModel<string>({ default: '' })

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class']
    placeholder?: string
    label?: string
  }>(),
  { placeholder: '搜索书签、描述...', label: '搜索书签' },
)
</script>

<template>
  <label id="halo-search" :class="props.class">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16.5 20 20.5" />
    </svg>
    <input
      v-model="model"
      :placeholder="props.placeholder"
      type="search"
      class="search-field"
      :aria-label="props.label"
    />
  </label>
</template>

<style scoped>
#halo-search {
  display: flex;
  align-items: center;
  gap: 8px;
  width: min(240px, 100%);
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--site-border);
  border-radius: 10px;
  background: var(--site-surface);
  box-shadow: 0 0 0 0 rgba(31, 157, 138, 0);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

#halo-search:hover {
  box-shadow: 0 0 0 4px rgba(31, 157, 138, 0.08);
}

#halo-search:focus-within {
  border-color: var(--site-accent);
  box-shadow:
    0 0 0 4px rgba(31, 157, 138, 0.16),
    0 0 18px rgba(31, 157, 138, 0.18);
}

#halo-search svg {
  flex: 0 0 16px;
  width: 16px;
  height: 16px;
  fill: none;
  stroke: var(--site-muted);
  stroke-width: 1.8;
  stroke-linecap: round;
}

#halo-search:focus-within svg {
  stroke: var(--site-accent);
}

.search-field {
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--site-ink);
  font: inherit;
  font-size: 14px;
  caret-color: var(--site-accent);
}

.search-field:focus {
  outline: none;
}

.search-field::placeholder {
  color: var(--site-muted);
}

.search-field:autofill {
  box-shadow: 0 0 0 1000px var(--site-surface) inset;
  -webkit-text-fill-color: var(--site-ink);
  caret-color: var(--site-accent);
}

@media (max-width: 720px) {
  #halo-search {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  #halo-search {
    transition: none;
  }
}
</style>
