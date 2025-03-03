::: anchor
:::

::: title 基本介绍
:::

::: describe 使用锚点，可以将内容固定在容器内，并且不随容器的滚动而滚动，常用于侧边菜单导航等。
:::

::: demo 使用 `position` 属性, 改变定位属性，默认为 `top`,可选值 `bottom`
<template>
  <div style="width:100%;height:100px">
    <lay-affix :target="target" :offset="0" position="bottom" v-if="target">
      <lay-button type="normal">固定在最底部</lay-button>
    </lay-affix>
  </div>
</template>

<script setup>
  import { nextTick,ref } from 'vue'
  const target=ref()
  nextTick(()=>{
    target.value=document.querySelector(".layui-body");
  })
</script>
:::

::: title Affix 属性
:::

::: table

| 属性      | 描述                     | 可选值                                     |
| ------   | ---------------------    | ---------------------------------------   |
| position | 定位属性 : string         | `top` `bottom`                            |
| offset   | 偏移量 : number,默认为0    | -                                         |
| target   | 指定参考容器 : HTMLElement | 默认`document.body`,请务必确保能够正确获取到dom|

:::

::: title Affix 事件
:::

::: table

| 属性      | 描述                    | 回调参数                                     |
| ------   | ---------------------   | ---------------------------------------   |
| scroll   | 初始化完成与滚动时触发的回调，回调会返回一个object<br><br>`{targetScroll:string,affixed:boolean,offset:number}` |<br/>`targetScroll` 容器滚动距离<br/><br/>`affixed` 是否处于fixed状态<br/><br/>`offset` 与原本位置的距离 <br>&nbsp; |

:::

::: previousNext affix

:::
