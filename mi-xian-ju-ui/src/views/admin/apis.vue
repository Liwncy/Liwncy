<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  createEndpoint,
  createMenu,
  createPlatform,
  fetchEndpoints,
  fetchMenus,
  fetchPlatforms,
  readAdminToken,
  removeEndpoint,
  removeMenu,
  removePlatform,
  saveAdminToken,
  tryEndpoint,
  updateEndpoint,
  updateMenu,
  updatePlatform,
  type Endpoint,
  type MenuItem,
  type Platform,
} from '../../api/catalog'
import '../../styles/admin-bookmark.css'

type Tab = 'platforms' | 'endpoints' | 'menus'

const tab = ref<Tab>('platforms')
const token = ref(readAdminToken())
const unlocked = ref(Boolean(token.value))
const error = ref('')
const platforms = ref<Platform[]>([])
const endpoints = ref<Endpoint[]>([])
const menus = ref<MenuItem[]>([])

const platformId = ref('')
const platformName = ref('')
const platformBase = ref('')
const platformStatus = ref<'enabled' | 'disabled'>('enabled')
const platformNote = ref('')
const platformAuth = ref('{}')

const endpointId = ref('')
const endpointPlatform = ref('')
const endpointName = ref('')
const endpointMethod = ref('GET')
const endpointPath = ref('/')
const endpointStatus = ref<'enabled' | 'disabled'>('enabled')
const endpointNote = ref('')
const endpointRequest = ref('{}')
const endpointMapping = ref('')
const tryParams = ref('{}')
const tryResult = ref('')

const menuId = ref('')
const menuEndpoint = ref('')
const menuKind = ref('page')
const menuRef = ref('words')
const menuGroup = ref('')
const menuSort = ref(100)
const menuNote = ref('')

const platformNameOf = computed(() => {
  const names = new Map(platforms.value.map((item) => [item.id, item.name]))
  return (id: string) => names.get(id) ?? id
})
const endpointNameOf = computed(() => {
  const names = new Map(endpoints.value.map((item) => [item.id, item.name]))
  return (id: string) => names.get(id) ?? id
})

onMounted(() => {
  if (unlocked.value) void reload()
})

async function unlock() {
  saveAdminToken(token.value)
  unlocked.value = true
  await reload()
}

async function reload() {
  error.value = ''
  try {
    ;[platforms.value, endpoints.value, menus.value] = await Promise.all([
      fetchPlatforms(),
      fetchEndpoints(),
      fetchMenus(),
    ])
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '没读出来'
  }
}

function parseObject(text: string, label: string) {
  const parsed = JSON.parse(text || '{}') as unknown
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error(`${label}要是对象`)
  return parsed
}

async function savePlatform() {
  error.value = ''
  try {
    const body = {
      name: platformName.value,
      base_url: platformBase.value,
      status: platformStatus.value,
      note: platformNote.value,
      auth_json: parseObject(platformAuth.value, '钥匙'),
    }
    if (platformId.value) await updatePlatform(platformId.value, body)
    else await createPlatform(body)
    resetPlatform()
    await reload()
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '没保存'
  }
}

function editPlatform(item: Platform) {
  platformId.value = item.id
  platformName.value = item.name
  platformBase.value = item.base_url
  platformStatus.value = item.status
  platformNote.value = item.note
  platformAuth.value = JSON.stringify(item.auth_json ?? {}, null, 2)
}

function resetPlatform() {
  platformId.value = ''
  platformName.value = ''
  platformBase.value = ''
  platformStatus.value = 'enabled'
  platformNote.value = ''
  platformAuth.value = '{}'
}

async function deletePlatform(item: Platform) {
  if (!window.confirm(`删掉平台「${item.name}」？`)) return
  error.value = ''
  try {
    await removePlatform(item.id)
    if (platformId.value === item.id) resetPlatform()
    await reload()
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '没删掉'
  }
}

async function saveEndpoint() {
  error.value = ''
  try {
    const mappingText = endpointMapping.value.trim()
    const body = {
      platform_id: endpointPlatform.value,
      name: endpointName.value,
      method: endpointMethod.value,
      path: endpointPath.value,
      status: endpointStatus.value,
      note: endpointNote.value,
      request_json: parseObject(endpointRequest.value, '请求'),
      mapping_json: mappingText ? parseObject(mappingText, '返回映射') : null,
    }
    if (endpointId.value) await updateEndpoint(endpointId.value, body)
    else await createEndpoint(body)
    resetEndpoint()
    await reload()
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '没保存'
  }
}

function editEndpoint(item: Endpoint) {
  endpointId.value = item.id
  endpointPlatform.value = item.platform_id
  endpointName.value = item.name
  endpointMethod.value = item.method
  endpointPath.value = item.path
  endpointStatus.value = item.status
  endpointNote.value = item.note
  endpointRequest.value = JSON.stringify(item.request_json ?? {}, null, 2)
  endpointMapping.value = item.mapping_json ? JSON.stringify(item.mapping_json, null, 2) : ''
  tryResult.value = ''
}

function resetEndpoint() {
  endpointId.value = ''
  endpointName.value = ''
  endpointMethod.value = 'GET'
  endpointPath.value = '/'
  endpointStatus.value = 'enabled'
  endpointNote.value = ''
  endpointRequest.value = '{}'
  endpointMapping.value = ''
  tryResult.value = ''
}

async function deleteEndpoint(item: Endpoint) {
  if (!window.confirm(`删掉接口「${item.name}」？挂着的菜单也会一起没。`)) return
  error.value = ''
  try {
    await removeEndpoint(item.id)
    if (endpointId.value === item.id) resetEndpoint()
    await reload()
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '没删掉'
  }
}

async function runTry() {
  if (!endpointId.value) {
    error.value = '先选一条接口'
    return
  }
  error.value = ''
  tryResult.value = ''
  try {
    const params = parseObject(tryParams.value, '试参') as Record<string, string>
    tryResult.value = await tryEndpoint(endpointId.value, params)
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '没试通'
  }
}

async function saveMenu() {
  error.value = ''
  try {
    const body = {
      endpoint_id: menuEndpoint.value,
      kind: menuKind.value,
      ref: menuRef.value,
      group_title: menuGroup.value,
      sort: Number(menuSort.value),
      note: menuNote.value,
    }
    if (menuId.value) await updateMenu(menuId.value, body)
    else await createMenu(body)
    resetMenu()
    await reload()
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '没保存'
  }
}

function editMenu(item: MenuItem) {
  menuId.value = item.id
  menuEndpoint.value = item.endpoint_id
  menuKind.value = item.kind
  menuRef.value = item.ref
  menuGroup.value = item.group_title
  menuSort.value = item.sort
  menuNote.value = item.note
}

function resetMenu() {
  menuId.value = ''
  menuKind.value = 'page'
  menuRef.value = 'words'
  menuGroup.value = ''
  menuSort.value = 100
  menuNote.value = ''
}

async function deleteMenu(item: MenuItem) {
  if (!window.confirm('从菜单拿掉这条？接口还在。')) return
  error.value = ''
  try {
    await removeMenu(item.id)
    if (menuId.value === item.id) resetMenu()
    await reload()
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '没拿掉'
  }
}
</script>

<template>
  <section class="admin-bookmark">
    <h1>接口</h1>
    <p class="admin-lead">收录平台和接口，再决定挂到哪一页。<RouterLink to="/admin">去改书签</RouterLink></p>
    <p v-if="error" class="admin-alert" role="alert">{{ error }}</p>

    <form v-if="!unlocked" class="admin-form" @submit.prevent="unlock">
      <label>
        管理凭证
        <input v-model="token" type="password" autocomplete="current-password" required />
      </label>
      <button type="submit">进入</button>
    </form>

    <template v-else>
      <div class="admin-tabs" role="tablist">
        <button type="button" :aria-selected="tab === 'platforms'" @click="tab = 'platforms'">平台</button>
        <button type="button" :aria-selected="tab === 'endpoints'" @click="tab = 'endpoints'">接口</button>
        <button type="button" :aria-selected="tab === 'menus'" @click="tab = 'menus'">菜单</button>
      </div>

      <div v-if="tab === 'platforms'" class="admin-columns">
        <section class="admin-panel">
          <h2>已有</h2>
          <ul>
            <li v-for="item in platforms" :key="item.id" class="admin-link">
              <button type="button" @click="editPlatform(item)">{{ item.name }}</button>
              <button class="admin-danger" type="button" @click="deletePlatform(item)">删除</button>
            </li>
          </ul>
        </section>
        <form class="admin-form" @submit.prevent="savePlatform">
          <label>名称<input v-model="platformName" required /></label>
          <label>根地址<input v-model="platformBase" required placeholder="https://" /></label>
          <label>
            状态
            <select v-model="platformStatus">
              <option value="enabled">在用</option>
              <option value="disabled">停用</option>
            </select>
          </label>
          <label>备注<input v-model="platformNote" /></label>
          <label>钥匙 JSON<textarea v-model="platformAuth" rows="6" spellcheck="false"></textarea></label>
          <button type="submit">{{ platformId ? '保存平台' : '添加平台' }}</button>
          <button v-if="platformId" type="button" @click="resetPlatform">取消</button>
        </form>
      </div>

      <div v-else-if="tab === 'endpoints'" class="admin-columns">
        <section class="admin-panel">
          <h2>已有</h2>
          <ul>
            <li v-for="item in endpoints" :key="item.id" class="admin-link">
              <button type="button" @click="editEndpoint(item)">{{ item.name }}</button>
              <span>{{ platformNameOf(item.platform_id) }}</span>
              <button class="admin-danger" type="button" @click="deleteEndpoint(item)">删除</button>
            </li>
          </ul>
        </section>
        <form class="admin-form" @submit.prevent="saveEndpoint">
          <label>
            平台
            <select v-model="endpointPlatform" required>
              <option value="" disabled>选一个</option>
              <option v-for="item in platforms" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </label>
          <label>名称<input v-model="endpointName" required /></label>
          <label>对方方法<input v-model="endpointMethod" required /></label>
          <label>路径<input v-model="endpointPath" required /></label>
          <label>
            状态
            <select v-model="endpointStatus">
              <option value="enabled">在用</option>
              <option value="disabled">停用</option>
            </select>
          </label>
          <label>备注<input v-model="endpointNote" /></label>
          <label>请求 JSON<textarea v-model="endpointRequest" rows="8" spellcheck="false"></textarea></label>
          <label>返回映射<textarea v-model="endpointMapping" rows="5" spellcheck="false" placeholder="留空就是原样返回"></textarea></label>
          <button type="submit">{{ endpointId ? '保存接口' : '添加接口' }}</button>
          <button v-if="endpointId" type="button" @click="resetEndpoint">取消</button>
          <label v-if="endpointId">试参 JSON<textarea v-model="tryParams" rows="3" spellcheck="false"></textarea></label>
          <button v-if="endpointId" type="button" @click="runTry">试一下</button>
          <pre v-if="tryResult" class="admin-try">{{ tryResult }}</pre>
        </form>
      </div>

      <div v-else class="admin-columns">
        <section class="admin-panel">
          <h2>已挂上</h2>
          <ul>
            <li v-for="item in menus" :key="item.id" class="admin-link">
              <button type="button" @click="editMenu(item)">{{ endpointNameOf(item.endpoint_id) }}</button>
              <span>{{ item.kind }} / {{ item.ref }}</span>
              <button class="admin-danger" type="button" @click="deleteMenu(item)">拿掉</button>
            </li>
          </ul>
        </section>
        <form class="admin-form" @submit.prevent="saveMenu">
          <label>
            接口
            <select v-model="menuEndpoint" required>
              <option value="" disabled>选一个</option>
              <option v-for="item in endpoints" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </label>
          <label>给谁用<input v-model="menuKind" required placeholder="page 或 rule" /></label>
          <label>用在哪<input v-model="menuRef" required placeholder="words / videos / images" /></label>
          <label>分组<input v-model="menuGroup" /></label>
          <label>排序<input v-model.number="menuSort" type="number" required /></label>
          <label>备注<input v-model="menuNote" /></label>
          <button type="submit">{{ menuId ? '保存菜单' : '挂上去' }}</button>
          <button v-if="menuId" type="button" @click="resetMenu">取消</button>
        </form>
      </div>
    </template>
  </section>
</template>
