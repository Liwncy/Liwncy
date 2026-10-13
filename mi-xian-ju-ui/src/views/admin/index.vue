<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  createCategory,
  createLink,
  deleteCategory,
  deleteLink,
  fetchBookmarks,
  renameCategory,
  updateLink,
  type BookmarkCategory,
} from '../../api/bookmark'
import '../../styles/admin-bookmark.css'

const categories = ref<BookmarkCategory[]>([])
const selectedId = ref('')
const status = ref('加载中')
const error = ref('')
const categoryName = ref('')
const renamingId = ref('')
const renameValue = ref('')
const editingId = ref('')
const linkTitle = ref('')
const linkUrl = ref('')
const linkDescription = ref('')
const linkAvatar = ref('')

const selected = computed(() => categories.value.find((category) => category.id === selectedId.value))

onMounted(async () => {
  await reload()
})

async function reload() {
  try {
    categories.value = await fetchBookmarks()
    if (!categories.value.some((category) => category.id === selectedId.value)) {
      selectedId.value = categories.value[0]?.id ?? ''
    }
    status.value = ''
    error.value = ''
  } catch (caught) {
    status.value = ''
    error.value = caught instanceof Error ? caught.message : '书签加载失败'
  }
}

async function run(action: () => Promise<BookmarkCategory[]>) {
  error.value = ''
  try {
    categories.value = await action()
    if (!categories.value.some((category) => category.id === selectedId.value)) {
      selectedId.value = categories.value[0]?.id ?? ''
    }
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '保存失败'
  }
}

async function addCategory() {
  const name = categoryName.value
  await run(() => createCategory(name))
  if (!error.value) categoryName.value = ''
}

function startRename(id: string, name: string) {
  renamingId.value = id
  renameValue.value = name
}

async function saveRename(id: string) {
  await run(() => renameCategory(id, renameValue.value))
  if (!error.value) renamingId.value = ''
}

async function removeCategory(id: string, name: string) {
  if (!window.confirm(`删除分类「${name}」和里面的链接？`)) return
  await run(() => deleteCategory(id))
}

function resetLinkForm() {
  editingId.value = ''
  linkTitle.value = ''
  linkUrl.value = ''
  linkDescription.value = ''
  linkAvatar.value = ''
}

function startEdit(link: BookmarkCategory['links'][number]) {
  editingId.value = link.id
  linkTitle.value = link.title
  linkUrl.value = link.url
  linkDescription.value = link.description
  linkAvatar.value = link.avatar
}

async function saveLink() {
  if (!selected.value) {
    error.value = '先选一个分类'
    return
  }
  const input = {
    categoryId: selected.value.id,
    title: linkTitle.value,
    url: linkUrl.value,
    description: linkDescription.value,
    avatar: linkAvatar.value,
  }
  const id = editingId.value
  await run(() => (id ? updateLink(id, input) : createLink(input)))
  if (!error.value) resetLinkForm()
}

async function removeLink(id: string, title: string) {
  if (!window.confirm(`删除「${title}」？`)) return
  await run(() => deleteLink(id))
}
</script>

<template>
  <section class="admin-bookmark">
    <h1>书签</h1>
    <p class="admin-lead">这里改的内容，会显示在访客的书签页。</p>
    <p v-if="status" role="status">{{ status }}</p>
    <p v-if="error" class="admin-alert" role="alert">{{ error }}</p>

    <div class="admin-columns">
      <section class="admin-panel">
        <h2>分类</h2>
        <ul>
          <li v-for="category in categories" :key="category.id" class="admin-category">
            <template v-if="renamingId === category.id">
              <input v-model="renameValue" class="admin-rename" type="text" />
              <button type="button" @click="saveRename(category.id)">保存</button>
            </template>
            <template v-else>
              <button type="button" :aria-current="selectedId === category.id" @click="selectedId = category.id">
                {{ category.name }}
              </button>
              <button type="button" @click="startRename(category.id, category.name)">改名</button>
              <button class="admin-danger" type="button" @click="removeCategory(category.id, category.name)">
                删除
              </button>
            </template>
          </li>
        </ul>
        <form class="admin-form" @submit.prevent="addCategory">
          <label>
            新分类
            <input v-model="categoryName" type="text" />
          </label>
          <button type="submit">添加分类</button>
        </form>
      </section>

      <section class="admin-panel">
        <h2>{{ selected?.name ?? '先选一个分类' }}</h2>
        <ul v-if="selected">
          <li v-for="link in selected.links" :key="link.id" class="admin-link">
            <img v-if="link.avatar" class="admin-icon" :src="link.avatar" alt="" referrerpolicy="no-referrer" />
            <span v-else class="admin-icon admin-icon-empty">{{ link.title.trim().slice(0, 1) }}</span>
            <span>{{ link.title }}</span>
            <button type="button" @click="startEdit(link)">编辑</button>
            <button class="admin-danger" type="button" @click="removeLink(link.id, link.title)">删除</button>
          </li>
        </ul>
        <form v-if="selected" class="admin-form" @submit.prevent="saveLink">
          <label>
            标题
            <input v-model="linkTitle" type="text" required />
          </label>
          <label>
            链接
            <input v-model="linkUrl" type="url" required placeholder="https://" />
          </label>
          <label>
            描述
            <textarea v-model="linkDescription" rows="3"></textarea>
          </label>
          <label>
            图标
            <input v-model="linkAvatar" type="url" placeholder="https:// 图片地址，可以留空" />
          </label>
          <button type="submit">{{ editingId ? '保存链接' : '添加链接' }}</button>
          <button v-if="editingId" type="button" @click="resetLinkForm">取消编辑</button>
        </form>
      </section>
    </div>
  </section>
</template>
