<template>
    <template v-for="(menu, index) in menus" :key="index">
        <template v-if="menu.children">
            <lay-sub-menu :id="menu.id" :teleportProps="teleportProps">
                <template #icon>
                    <lay-icon :type="menu.icon"></lay-icon>
                </template>
                <template #title>{{ menu.title }}</template>
                <GlobalMenuItem :menus="menu.children"></GlobalMenuItem>
            </lay-sub-menu>
        </template>
        <template v-else>
            <lay-menu-item :id="menu.id">
                <template #icon>
                    <lay-icon :type="menu.icon"></lay-icon>
                </template>
                <template #title>{{ menu.title }}</template>
            </lay-menu-item>
        </template>
    </template>
</template>

<script lang="ts">
import GlobalMenuItem from "./GlobalMenuItem.vue"
import { defineComponent } from "vue";

export default defineComponent({
    name:  "GlobalMenuItem",
    props: {
        teleportProps: {
            type: Object,
        },
        menus: {
            type: Object
        }
    }
})
</script>