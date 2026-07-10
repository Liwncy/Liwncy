<template>
  <lay-container fluid="true" class="admin-page">
    <lay-card class="admin-card admin-page-hero">
      <div>
        <p class="admin-page-eyebrow">API Platform</p>
        <h1>Route 场景</h1>
        <p class="admin-page-desc">这里只维护功能接口的 Route 场景、匹配条件和默认参数。</p>
      </div>
    </lay-card>

    <lay-card class="admin-card">
      <lay-form class="admin-search-form">
        <lay-row>
          <lay-col md="6" sm="12" xs="24">
            <lay-form-item label="Route 搜索" label-width="90">
              <lay-input v-model="keyword" placeholder="API / Route / 名称" size="sm" :allow-clear="true" />
            </lay-form-item>
          </lay-col>
          <lay-col md="6" sm="12" xs="24">
            <lay-form-item label="所属 API" label-width="90">
              <select v-model="selectedFunctionId" class="admin-form-input">
                <option value="">全部 API</option>
                <option v-for="item in config.functions" :key="item.id" :value="item.id">
                  {{ item.name }}({{ item.code }})
                </option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="8" sm="12" xs="24">
            <lay-form-item label-width="20">
              <lay-button type="normal" size="sm" @click="resetSearch">重置</lay-button>
              <lay-button type="primary" size="sm" :loading="loading" @click="loadConfig">查询</lay-button>
              <lay-button size="sm" type="primary" @click="openRouteLayer()">新增 Route</lay-button>
            </lay-form-item>
          </lay-col>
        </lay-row>
      </lay-form>
    </lay-card>

    <lay-card title="Route 场景" class="admin-card">
      <table class="admin-table compact">
        <thead>
          <tr>
            <th>所属 API</th>
            <th>Route</th>
            <th>匹配条件</th>
            <th>默认参数</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredFunctionRoutes" :key="item.id">
            <td>
              <strong>{{ item.function_name }}</strong>
              <p><code>{{ item.function_code }}</code></p>
            </td>
            <td>
              <strong>{{ item.name }}</strong>
              <p><code>{{ item.route_key }}</code></p>
            </td>
            <td><code>{{ formatValue(item.match) }}</code></td>
            <td><code>{{ formatValue(item.defaultParams) }}</code></td>
            <td><span class="admin-status" :class="item.status">{{ item.status }}</span></td>
            <td>
              <div class="admin-table-actions">
                <lay-button size="xs" border="green" @click="openRouteLayer(item)">修改</lay-button>
                <lay-button
                  size="xs"
                  :type="item.status === 'enabled' ? 'warm' : 'primary'"
                  @click="toggleRouteStatus(item)"
                >
                  {{ item.status === 'enabled' ? '停用' : '启用' }}
                </lay-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </lay-card>

    <lay-layer v-model="routeLayerVisible" :title="routeForm.id ? '修改 Route' : '新增 Route'" :area="['720px', '500px']">
      <div class="admin-layer-form">
        <lay-row space="10">
          <lay-col md="12">
            <lay-form-item label="所属 API" label-width="90">
              <select v-model="routeForm.functionId" class="admin-form-input">
                <option value="">请选择</option>
                <option v-for="item in config.functions" :key="item.id" :value="item.id">
                  {{ item.name }}({{ item.code }})
                </option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="Route Key" label-width="90">
              <input v-model="routeForm.routeKey" class="admin-form-input" placeholder="xiaojiejie" />
            </lay-form-item>
          </lay-col>
          <lay-col md="24">
            <lay-form-item label="名称" label-width="90">
              <input v-model="routeForm.name" class="admin-form-input" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="匹配 JSON" label-width="90">
              <textarea v-model="routeForm.matchJson" class="admin-json-editor" rows="5" spellcheck="false" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="默认参数" label-width="90">
              <textarea v-model="routeForm.defaultParamsJson" class="admin-json-editor" rows="5" spellcheck="false" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="排序" label-width="90">
              <input v-model.number="routeForm.sort" class="admin-form-input" type="number" min="0" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="状态" label-width="90">
              <select v-model="routeForm.status" class="admin-form-input">
                <option value="enabled">enabled</option>
                <option value="disabled">disabled</option>
              </select>
            </lay-form-item>
          </lay-col>
        </lay-row>
        <div class="admin-layer-actions">
          <lay-button size="sm" type="primary" :loading="saving" @click="saveRoute">保存</lay-button>
          <lay-button size="sm" @click="routeLayerVisible = false">取消</lay-button>
        </div>
      </div>
    </lay-layer>
  </lay-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { layer } from '@layui/layer-vue'
import {
  createAdminFunctionRoute,
  updateAdminFunctionRoute,
  type AdminFunctionRouteConfig,
} from '@/api/admin'
import { formatValue, useAdminConfig } from './useAdminConfig'
import '@/assets/styles/admin-platform.css'

const { loading, config, applyConfig, loadConfig } = useAdminConfig()
const keyword = ref('')
const selectedFunctionId = ref('')
const saving = ref(false)
const routeLayerVisible = ref(false)

const routeForm = reactive({
  id: '',
  functionId: '',
  routeKey: '',
  name: '',
  matchJson: '{}',
  defaultParamsJson: '{}',
  sort: 100,
  status: 'enabled',
})

const includesKeyword = (values: unknown[]) => {
  const normalizedKeyword = keyword.value.trim().toLowerCase()
  if (!normalizedKeyword) return true
  return values.some((value) => String(value ?? '').toLowerCase().includes(normalizedKeyword))
}

const filteredFunctionRoutes = computed(() =>
  config.functionRoutes.filter((item) => {
    const matchesFunction = !selectedFunctionId.value || item.function_id === selectedFunctionId.value
    return (
      matchesFunction &&
      includesKeyword([item.function_code, item.function_name, item.route_key, item.name, formatValue(item.match)])
    )
  }),
)

function jsonText(value: unknown, empty = '{}') {
  if (value === undefined || value === null) return empty
  return JSON.stringify(value, null, 2)
}

function parseJsonObject(raw: string, label: string) {
  try {
    const value = JSON.parse(raw || '{}') as unknown
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      layer.msg(`${label}必须是 JSON 对象`, { icon: 2 })
      return null
    }
    return value as Record<string, unknown>
  } catch {
    layer.msg(`${label}格式不正确`, { icon: 2 })
    return null
  }
}

function resetSearch() {
  keyword.value = ''
  selectedFunctionId.value = ''
}

function openRouteLayer(item?: AdminFunctionRouteConfig) {
  routeForm.id = item?.id ?? ''
  routeForm.functionId = item?.function_id ?? config.functions[0]?.id ?? ''
  routeForm.routeKey = item?.route_key ?? ''
  routeForm.name = item?.name ?? ''
  routeForm.matchJson = jsonText(item?.match ?? {}, '{}')
  routeForm.defaultParamsJson = jsonText(item?.defaultParams ?? {}, '{}')
  routeForm.sort = item?.sort ?? 100
  routeForm.status = item?.status ?? 'enabled'
  routeLayerVisible.value = true
}

async function saveRoute() {
  const match = parseJsonObject(routeForm.matchJson, '匹配 JSON')
  const defaultParams = parseJsonObject(routeForm.defaultParamsJson, '默认参数')
  if (!match || !defaultParams) return

  saving.value = true
  try {
    const payload = {
      functionId: routeForm.functionId,
      routeKey: routeForm.routeKey,
      name: routeForm.name,
      match,
      defaultParams,
      sort: routeForm.sort,
      status: routeForm.status,
    }
    const res = routeForm.id
      ? await updateAdminFunctionRoute(routeForm.id, payload)
      : await createAdminFunctionRoute(payload)
    if (res.data) applyConfig(res.data)
    routeLayerVisible.value = false
    layer.msg('Route 已保存', { icon: 1 })
  } catch {
    // 请求层已提示错误。
  } finally {
    saving.value = false
  }
}

async function toggleRouteStatus(item: AdminFunctionRouteConfig) {
  const res = await updateAdminFunctionRoute(item.id, {
    status: item.status === 'enabled' ? 'disabled' : 'enabled',
  }).catch(() => null)
  if (res?.data) applyConfig(res.data)
}

onMounted(loadConfig)
</script>
