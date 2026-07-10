<template>
  <lay-container fluid="true" class="admin-page">
    <lay-card class="admin-card admin-page-hero">
      <div>
        <p class="admin-page-eyebrow">API Platform</p>
        <h1>菜单配置</h1>
        <p class="admin-page-desc">
          这里管理前台菜单结构，D1 优先、KV 兜底，支持直接从旧配置导入后再做细化调整。
        </p>
      </div>
    </lay-card>

    <lay-card class="admin-card">
      <lay-form class="admin-search-form">
        <lay-row>
          <lay-col md="6" sm="12" xs="24">
            <lay-form-item label="模块" label-width="70">
              <select v-model="moduleFilter" class="admin-form-input">
                <option value="">全部</option>
                <option v-for="module in modules" :key="module" :value="module">{{ module }}</option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="6" sm="12" xs="24">
            <lay-form-item label="关键字" label-width="70">
              <lay-input v-model="keyword" placeholder="标题 / ID / API 分类" size="sm" :allow-clear="true" />
            </lay-form-item>
          </lay-col>
          <lay-col md="8" sm="12" xs="24">
            <lay-form-item label-width="20">
              <lay-button type="normal" size="sm" @click="resetSearch">重置</lay-button>
              <lay-button type="primary" size="sm" :loading="loading" @click="loadConfig">查询</lay-button>
              <lay-button size="sm" type="primary" @click="openMenuLayer()">新增菜单</lay-button>
              <lay-button size="sm" type="warm" @click="openImportLayer">从 KV 导入</lay-button>
            </lay-form-item>
          </lay-col>
        </lay-row>
      </lay-form>
    </lay-card>

    <lay-card title="菜单配置" class="admin-card">
      <table class="admin-table compact">
        <thead>
          <tr>
            <th>模块</th>
            <th>ID</th>
            <th>标题</th>
            <th>分类</th>
            <th>排序</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredMenus" :key="item.id">
            <td><code>{{ item.module }}</code></td>
            <td><code>{{ item.id }}</code></td>
            <td>{{ item.title }}</td>
            <td><code>{{ getCategory(item) }}</code></td>
            <td>{{ item.sort }}</td>
            <td><span class="admin-status" :class="item.status">{{ item.status }}</span></td>
            <td>
              <div class="admin-table-actions">
                <lay-button size="xs" border="green" @click="openMenuLayer(item)">修改</lay-button>
                <lay-button
                  size="xs"
                  :type="item.status === 'enabled' ? 'warm' : 'primary'"
                  @click="toggleMenuStatus(item)"
                >
                  {{ item.status === 'enabled' ? '停用' : '启用' }}
                </lay-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <lay-empty v-if="!filteredMenus.length" description="暂无菜单配置，前台会继续回退 KV 菜单" />
    </lay-card>

    <lay-layer v-model="menuLayerVisible" :title="menuForm.editingId ? '修改菜单' : '新增菜单'" :area="['780px', '640px']">
      <div class="admin-layer-form">
        <lay-form>
          <lay-row space="10">
            <lay-col md="12">
              <lay-form-item label="菜单 ID" label-width="90">
                <input v-model="menuForm.id" class="admin-form-input" :disabled="Boolean(menuForm.editingId)" placeholder="liteimage-heisi" />
              </lay-form-item>
            </lay-col>
            <lay-col md="12">
              <lay-form-item label="父级 ID" label-width="90">
                <input v-model="menuForm.parentId" class="admin-form-input" placeholder="可为空" />
              </lay-form-item>
            </lay-col>
            <lay-col md="12">
              <lay-form-item label="范围" label-width="90">
                <select v-model="menuForm.scope" class="admin-form-input">
                  <option value="side">side</option>
                  <option value="top">top</option>
                </select>
              </lay-form-item>
            </lay-col>
            <lay-col md="12">
              <lay-form-item label="模块" label-width="90">
                <input v-model="menuForm.module" class="admin-form-input" placeholder="liteImage" />
              </lay-form-item>
            </lay-col>
            <lay-col md="12">
              <lay-form-item label="标题" label-width="90">
                <input v-model="menuForm.title" class="admin-form-input" />
              </lay-form-item>
            </lay-col>
            <lay-col md="12">
              <lay-form-item label="图标" label-width="90">
                <input v-model="menuForm.icon" class="admin-form-input" placeholder="layui-icon-picture" />
              </lay-form-item>
            </lay-col>
            <lay-col md="12">
              <lay-form-item label="排序" label-width="90">
                <input v-model.number="menuForm.sort" class="admin-form-input" type="number" min="0" />
              </lay-form-item>
            </lay-col>
            <lay-col md="12">
              <lay-form-item label="状态" label-width="90">
                <select v-model="menuForm.status" class="admin-form-input">
                  <option value="enabled">enabled</option>
                  <option value="disabled">disabled</option>
                </select>
              </lay-form-item>
            </lay-col>
            <lay-col md="24">
              <lay-form-item label="Payload" label-width="90">
                <textarea
                  v-model="menuForm.payloadText"
                  class="admin-form-input admin-code-textarea"
                  rows="10"
                  placeholder='{"data":{"category":"heisi"}}'
                />
              </lay-form-item>
            </lay-col>
          </lay-row>
        </lay-form>
        <div class="admin-layer-actions">
          <lay-button size="sm" type="primary" :loading="saving" @click="saveMenu">保存</lay-button>
          <lay-button size="sm" @click="menuLayerVisible = false">取消</lay-button>
        </div>
      </div>
    </lay-layer>

    <lay-layer v-model="importLayerVisible" title="从 KV 导入菜单" :area="['620px', '360px']">
      <div class="admin-layer-form">
        <lay-form>
          <lay-row space="10">
            <lay-col md="12">
              <lay-form-item label="范围" label-width="90">
                <select v-model="importForm.scope" class="admin-form-input">
                  <option value="side">side</option>
                  <option value="top">top</option>
                </select>
              </lay-form-item>
            </lay-col>
            <lay-col md="12">
              <lay-form-item label="模块" label-width="90">
                <input v-model="importForm.module" class="admin-form-input" placeholder="liteImage" />
              </lay-form-item>
            </lay-col>
            <lay-col md="24">
              <lay-form-item label="导入方式" label-width="90">
                <select v-model="importForm.replace" class="admin-form-input">
                  <option :value="true">覆盖当前范围和模块</option>
                  <option :value="false">仅新增或更新同 ID 菜单</option>
                </select>
              </lay-form-item>
            </lay-col>
            <lay-col md="24">
              <p class="admin-page-tip">
                side 会读取 <code>webs/{{ importForm.module }}/sideMenu/index</code>；
                top 会读取 <code>webs/layout/topMenu/index</code>。
              </p>
            </lay-col>
          </lay-row>
        </lay-form>
        <div class="admin-layer-actions">
          <lay-button size="sm" type="primary" :loading="importing" @click="importMenus">开始导入</lay-button>
          <lay-button size="sm" @click="importLayerVisible = false">取消</lay-button>
        </div>
      </div>
    </lay-layer>
  </lay-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { layer } from '@layui/layer-vue'
import { createAdminMenu, importAdminMenus, updateAdminMenu, type AdminMenuConfig } from '@/api/admin'
import { useAdminConfig } from '@/views/admin/api-platform/useAdminConfig'
import '@/assets/styles/admin-platform.css'

const { loading, config, applyConfig, loadConfig } = useAdminConfig()
const keyword = ref('')
const moduleFilter = ref('')
const menuLayerVisible = ref(false)
const importLayerVisible = ref(false)
const saving = ref(false)
const importing = ref(false)
const menuForm = reactive({
  editingId: '',
  id: '',
  parentId: '',
  scope: 'side',
  module: 'liteImage',
  title: '',
  icon: '',
  sort: 100,
  status: 'enabled',
  payloadText: '{\n  "data": {\n    "category": ""\n  }\n}',
})
const importForm = reactive({
  scope: 'side',
  module: 'liteImage',
  replace: true,
})

const modules = computed(() => Array.from(new Set(config.menus.map((item) => item.module))).sort())
const filteredMenus = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return config.menus.filter((item) => {
    const category = getCategory(item).toLowerCase()
    const matchedKeyword = !kw || [item.id, item.title, item.module, category].some((value) => value.toLowerCase().includes(kw))
    const matchedModule = !moduleFilter.value || item.module === moduleFilter.value
    return matchedKeyword && matchedModule
  })
})

function getCategory(item: AdminMenuConfig) {
  const data = item.payload.data
  if (data && typeof data === 'object' && !Array.isArray(data) && 'category' in data) {
    return String((data as { category?: unknown }).category ?? '-')
  }
  return '-'
}

function resetSearch() {
  keyword.value = ''
  moduleFilter.value = ''
}

function openMenuLayer(item?: AdminMenuConfig) {
  menuForm.editingId = item?.id ?? ''
  menuForm.id = item?.id ?? ''
  menuForm.parentId = item?.parent_id ?? ''
  menuForm.scope = item?.scope ?? 'side'
  menuForm.module = item?.module ?? 'liteImage'
  menuForm.title = item?.title ?? ''
  menuForm.icon = item?.icon ?? ''
  menuForm.sort = item?.sort ?? 100
  menuForm.status = item?.status ?? 'enabled'
  menuForm.payloadText = JSON.stringify(item?.payload ?? { data: { category: '' } }, null, 2)
  menuLayerVisible.value = true
}

function openImportLayer() {
  importForm.scope = 'side'
  importForm.module = moduleFilter.value || 'liteImage'
  importForm.replace = true
  importLayerVisible.value = true
}

function parsePayload() {
  try {
    const value = JSON.parse(menuForm.payloadText || '{}') as unknown
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      layer.msg('Payload 必须是 JSON 对象', { icon: 2 })
      return null
    }
    return value as Record<string, unknown>
  } catch {
    layer.msg('Payload JSON 格式不正确', { icon: 2 })
    return null
  }
}

async function saveMenu() {
  const payload = parsePayload()
  if (!payload) return

  saving.value = true
  try {
    const data = {
      id: menuForm.id,
      parentId: menuForm.parentId || null,
      scope: menuForm.scope,
      module: menuForm.module,
      title: menuForm.title,
      icon: menuForm.icon || null,
      sort: Number(menuForm.sort),
      status: menuForm.status,
      payload,
    }
    const res = menuForm.editingId
      ? await updateAdminMenu(menuForm.editingId, data)
      : await createAdminMenu(data)
    if (res.data) applyConfig(res.data)
    menuLayerVisible.value = false
    layer.msg('菜单已保存', { icon: 1 })
  } finally {
    saving.value = false
  }
}

async function toggleMenuStatus(item: AdminMenuConfig) {
  const res = await updateAdminMenu(item.id, {
    status: item.status === 'enabled' ? 'disabled' : 'enabled',
  })
  if (res.data) applyConfig(res.data)
  layer.msg('菜单状态已更新', { icon: 1 })
}

async function importMenus() {
  importing.value = true
  try {
    const res = await importAdminMenus({
      scope: importForm.scope,
      module: importForm.scope === 'top' ? 'layout' : importForm.module,
      replace: importForm.replace,
    })
    if (res.data) applyConfig(res.data)
    moduleFilter.value = importForm.scope === 'top' ? 'layout' : importForm.module
    importLayerVisible.value = false
    layer.msg('菜单已从 KV 导入', { icon: 1 })
  } finally {
    importing.value = false
  }
}

onMounted(loadConfig)
</script>
