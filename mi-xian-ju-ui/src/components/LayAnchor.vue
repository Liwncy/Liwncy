<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  anchors?: Array<string> | string
  currIndex: number
  show: boolean
}>()

const activeIndex = ref(0)
const show = ref(props.show)
const iconType = ref('layui-icon-right')
const scrollRefEl = ref<HTMLElement>()
let enableAnimation = false

const anchorList = computed(() => {
  return typeof props.anchors === 'string' ? props.anchors.split(',').filter(Boolean) : props.anchors
})

const classAside = computed(() => [
  'lay-aside',
  { 'lay-aside-animation': enableAnimation },
  { 'lay-aside-collapse': !show.value },
])

const classAsideBtn = computed(() => {
  if (enableAnimation) {
    return [
      'lay-aside-collapse-btn',
      'lay-aside-animation',
      { 'lay-aside-collapse-btn-collapse': !show.value },
    ]
  }

  enableAnimation = true
  return ['lay-aside-collapse-btn', { 'lay-aside-collapse-btn-collapse': !show.value }]
})

function handlerBtnClick() {
  show.value = !show.value
}

function handlerListItemClick(index: number, id: string) {
  activeIndex.value = index
  document.getElementById(id)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest',
  })
  history.replaceState(null, '', `#${id}`)
}

function handlerScroll() {
  const scrollTop = (scrollRefEl.value?.scrollTop ?? 0) + 90
  anchorList.value?.forEach((item, index) => {
    const elOffsetTop = document.getElementById(item)?.offsetTop
    if (elOffsetTop && scrollTop >= elOffsetTop) {
      activeIndex.value = index
    }
  })
}

function handlerCollapse() {
  iconType.value = show.value ? 'layui-icon-right' : 'layui-icon-left'
  const content = scrollRefEl.value?.querySelector('.docs-content-wrap') as HTMLElement | undefined
  if (content) content.style.marginRight = show.value ? '180px' : '0'
}

watch(show, handlerCollapse)

onMounted(() => {
  scrollRefEl.value = document.querySelector('.layui-body') as HTMLElement | undefined
  scrollRefEl.value?.addEventListener('scroll', handlerScroll)
  handlerCollapse()

  if (window.location.hash) {
    const id = decodeURIComponent(location.hash).replace('#', '')
    setTimeout(() => handlerListItemClick(0, id), 200)
  }
})
</script>

<template>
  <aside :class="classAside">
    <div class="lay-aside-top">
      <lay-button type="primary" size="xs" :class="classAsideBtn" @click="handlerBtnClick">
        <lay-icon :type="iconType" size="40" />
      </lay-button>
    </div>
    <lay-scroll :thumbWidth="0">
      <ul>
        <li
          v-for="(anchor, index) in anchorList"
          :key="anchor"
          class="lay-aside-list"
          :class="{ active: index === activeIndex }"
          @click.prevent="handlerListItemClick(index, anchor)"
        >
          <a :href="`#${anchor}`" class="lay-aside-link" :class="{ active: index === activeIndex }">
            {{ anchor }}
          </a>
        </li>
      </ul>
    </lay-scroll>
  </aside>
</template>

<style scoped>
.lay-aside {
  position: fixed;
  top: 65px;
  right: 17px;
  box-sizing: border-box;
  width: 180px;
  height: calc(100% - 60px);
  padding: 0 25px;
  border-left: 1px solid var(--docs-border-color, #d8dde3);
  transition: none;
}

.lay-aside-collapse {
  right: -180px;
  opacity: 0.7;
}

.lay-aside-top {
  height: 29px;
}

.lay-aside-link {
  display: inline-block;
  min-width: 68px;
  max-width: 140px;
  padding: 1px 4px;
  border-radius: 2px;
  background-color: transparent;
  color: grey;
  font-size: 13px;
  line-height: 2;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.1s cubic-bezier(0, 0, 1, 1);
}

.lay-aside-list {
  position: relative;
  max-width: 140px;
  margin: 5px 0 0 4px;
  padding-left: 2px;
  border-radius: 2px;
  list-style: none;
}

.lay-aside-list:hover,
.lay-aside-list.active {
  background-color: #f6f6f6 !important;
}

.lay-aside-list:hover *,
.lay-aside-list.active * {
  color: var(--global-checked-color);
}

.lay-aside-collapse-btn {
  position: fixed;
  top: calc(50% - 20px);
  right: 197px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 40px;
  border: var(--docs-border-color, #d8dde3) 1px solid;
  border-right: none;
  border-radius: 4px 0 0 4px;
  background-color: #f6f6f6;
  box-shadow: 2px 0 8px 0 rgb(29 35 41 / 5%);
  color: rgba(0, 0, 0, 0.8);
  transition: none;
}

.lay-aside-collapse-btn-collapse {
  right: 0;
}

.lay-aside-animation {
  transition: right 200ms;
}

@media screen and (max-width: 768px) {
  .lay-aside {
    width: 100px !important;
  }

  .lay-aside-collapse-btn {
    right: 98px;
  }

  .lay-aside-collapse-btn-collapse {
    right: 15px;
  }

  .lay-aside-list {
    max-width: 68px;
  }
}
</style>
