<script setup lang="ts">
import type { SelectTriggerProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { ChevronDown } from "@lucide/vue"
import { reactiveOmit } from "@vueuse/core"
import { SelectIcon, SelectTrigger, useForwardProps } from "reka-ui"
import { cn } from '@/utils'

const props = withDefaults(
  defineProps<SelectTriggerProps & { class?: HTMLAttributes["class"], size?: "sm" | "default" }>(),
  { size: "default" },
)

const delegatedProps = reactiveOmit(props, "class", "size")
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <SelectTrigger
    data-slot="select-trigger"
    :data-size="size"
    v-bind="forwardedProps"
    :class="cn(
      `flex h-10 w-fit min-w-36 items-center justify-between gap-2 rounded-[10px] border border-border bg-card px-3 text-sm whitespace-nowrap text-foreground shadow-none outline-none transition-[border-color,box-shadow] hover:shadow-[0_0_0_4px_rgba(31,157,138,0.08)] focus-visible:border-ring focus-visible:shadow-[0_0_0_4px_rgba(31,157,138,0.16),0_0_18px_rgba(31,157,138,0.18)] disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground *:data-[slot=select-value]:line-clamp-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
      props.class,
    )"
  >
    <slot />
    <SelectIcon as-child>
      <ChevronDown class="size-4 text-muted-foreground" />
    </SelectIcon>
  </SelectTrigger>
</template>
