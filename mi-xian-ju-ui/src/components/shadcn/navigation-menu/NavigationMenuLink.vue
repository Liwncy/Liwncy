<script setup lang="ts">
import type { NavigationMenuLinkEmits, NavigationMenuLinkProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  NavigationMenuLink,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from '@/utils'

const props = defineProps<NavigationMenuLinkProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<NavigationMenuLinkEmits>()

const delegatedProps = reactiveOmit(props, "class")
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <NavigationMenuLink
    data-slot="navigation-menu-link"
    v-bind="forwarded"
    :class="cn(`flex rounded-md px-3.5 py-2 text-sm text-foreground outline-none hover:bg-[color-mix(in_srgb,var(--site-accent)_14%,var(--site-surface))] hover:text-foreground focus:bg-[color-mix(in_srgb,var(--site-accent)_14%,var(--site-surface))] focus:text-foreground data-active:bg-[color-mix(in_srgb,var(--site-accent)_14%,var(--site-surface))] data-active:text-primary`, props.class)"
  >
    <slot />
  </NavigationMenuLink>
</template>
