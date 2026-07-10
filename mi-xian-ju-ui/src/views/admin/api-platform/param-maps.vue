<template>
  <lay-container fluid="true" class="admin-page">
    <lay-card class="admin-card admin-page-hero">
      <div>
        <p class="admin-page-eyebrow">API Platform</p>
        <h1>参数映射</h1>
        <p class="admin-page-desc">这里只维护公开参数到 Adapter 请求参数、Header 或 Body 的映射关系。</p>
      </div>
    </lay-card>

    <lay-card class="admin-card">
      <lay-form class="admin-search-form">
        <lay-row>
          <lay-col md="6" sm="12" xs="24">
            <lay-form-item label="映射搜索" label-width="90">
              <lay-input v-model="keyword" placeholder="功能 / Route / Adapter / 参数" size="sm" :allow-clear="true" />
            </lay-form-item>
          </lay-col>
          <lay-col md="8" sm="12" xs="24">
            <lay-form-item label-width="20">
              <lay-button type="normal" size="sm" @click="keyword = ''">重置</lay-button>
              <lay-button type="primary" size="sm" :loading="loading" @click="loadConfig">查询</lay-button>
              <lay-button size="sm" type="primary" @click="openMapLayer()">新增映射</lay-button>
            </lay-form-item>
          </lay-col>
        </lay-row>
      </lay-form>
    </lay-card>

    <lay-card title="参数映射" class="admin-card">
      <table class="admin-table compact">
        <thead>
          <tr>
            <th>功能</th>
            <th>Route</th>
            <th>Adapter</th>
            <th>公开参数</th>
            <th>目标</th>
            <th>模板</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredAdapterParamMaps" :key="item.id">
            <td><code>{{ item.function_code }}</code></td>
            <td><code>{{ item.route_key || '通用' }}</code></td>
            <td><code>{{ item.adapter_code }}</code></td>
            <td><code>{{ item.public_param }}</code></td>
            <td>{{ item.target }}: <code>{{ item.target_key }}</code></td>
            <td><code>{{ item.template || '-' }}</code></td>
            <td><span class="admin-status" :class="item.status">{{ item.status }}</span></td>
            <td>
              <div class="admin-table-actions">
                <lay-button size="xs" border="green" @click="openMapLayer(item)">修改</lay-button>
                <lay-button
                  size="xs"
                  :type="item.status === 'enabled' ? 'warm' : 'primary'"
                  @click="toggleMapStatus(item)"
                >
                  {{ item.status === 'enabled' ? '停用' : '启用' }}
                </lay-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </lay-card>

    <lay-layer v-model="mapLayerVisible" :title="mapForm.id ? '修改参数映射' : '新增参数映射'" :area="['760px', '560px']">
      <div class="admin-layer-form">
        <lay-row space="10">
          <lay-col md="12">
            <lay-form-item label="功能接口" label-width="90">
              <select v-model="mapForm.functionId" class="admin-form-input">
                <option value="">请选择</option>
                <option v-for="item in config.functions" :key="item.id" :value="item.id">
                  {{ item.name }}({{ item.code }})
                </option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="Route" label-width="90">
              <select v-model="mapForm.routeId" class="admin-form-input">
                <option value="">通用</option>
                <option v-for="item in mapRoutes" :key="item.id" :value="item.id">
                  {{ item.name }}({{ item.route_key }})
                </option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="Adapter" label-width="90">
              <select v-model="mapForm.adapterId" class="admin-form-input">
                <option value="">请选择</option>
                <option v-for="item in config.adapters" :key="item.id" :value="item.id">
                  {{ item.name }}({{ item.code }})
                </option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="公开参数" label-width="90">
              <input v-model="mapForm.publicParam" class="admin-form-input" placeholder="category" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="目标" label-width="90">
              <div class="admin-inline-fields">
                <select v-model="mapForm.target" class="admin-form-input">
                  <option value="param">param</option>
                  <option value="query">query</option>
                  <option value="header">header</option>
                  <option value="body">body</option>
                </select>
                <input v-model="mapForm.targetKey" class="admin-form-input" placeholder="path" />
              </div>
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="状态" label-width="90">
              <select v-model="mapForm.status" class="admin-form-input">
                <option value="enabled">enabled</option>
                <option value="disabled">disabled</option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="模板" label-width="90">
              <input v-model="mapForm.template" class="admin-form-input" placeholder="/api/{{category}}.php" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="默认值 JSON" label-width="90">
              <textarea v-model="mapForm.defaultValueJson" class="admin-json-editor" rows="4" spellcheck="false" />
            </lay-form-item>
          </lay-col>
        </lay-row>
        <div class="admin-layer-actions">
          <lay-button size="sm" type="primary" :loading="saving" @click="saveMap">保存</lay-button>
          <lay-button size="sm" @click="mapLayerVisible = false">取消</lay-button>
        </div>
      </div>
    </lay-layer>
  </lay-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { layer } from '@layui/layer-vue'
import {
  createAdminAdapterParamMap,
  updateAdminAdapterParamMap,
  type AdminAdapterParamMapConfig,
} from '@/api/admin'
import { useAdminConfig } from './useAdminConfig'
import '@/assets/styles/admin-platform.css'

const { loading, config, applyConfig, loadConfig } = useAdminConfig()
const keyword = ref('')
const saving = ref(false)
const mapLayerVisible = ref(false)

const mapForm = reactive({
  id: '',
  functionId: '',
  adapterId: '',
  routeId: '',
  publicParam: '',
  target: 'param',
  targetKey: '',
  template: '',
  defaultValueJson: '',
  status: 'enabled',
})

const includesKeyword = (values: unknown[]) => {
  const normalizedKeyword = keyword.value.trim().toLowerCase()
  if (!normalizedKeyword) return true
  return values.some((value) => String(value ?? '').toLowerCase().includes(normalizedKeyword))
}

const filteredAdapterParamMaps = computed(() =>
  config.adapterParamMaps.filter((item) =>
    includesKeyword([
      item.function_code,
      item.route_key,
      item.adapter_code,
      item.public_param,
      item.target,
      item.target_key,
      item.template,
    ]),
  ),
)

const mapRoutes = computed(() =>
  config.functionRoutes.filter((item) => !mapForm.functionId || item.function_id === mapForm.functionId),
)

function jsonText(value: unknown, empty = '') {
  if (value === undefined || value === null) return empty
  return JSON.stringify(value, null, 2)
}

function parseJsonValue(raw: string, label: string) {
  if (!raw.trim()) return undefined
  try {
    return JSON.parse(raw) as unknown
  } catch {
    layer.msg(`${label}格式不正确`, { icon: 2 })
    return null
  }
}

function openMapLayer(item?: AdminAdapterParamMapConfig) {
  mapForm.id = item?.id ?? ''
  mapForm.functionId = item?.function_id ?? config.functions[0]?.id ?? ''
  mapForm.adapterId = item?.adapter_id ?? config.adapters[0]?.id ?? ''
  mapForm.routeId = item?.route_id ?? ''
  mapForm.publicParam = item?.public_param ?? ''
  mapForm.target = item?.target ?? 'param'
  mapForm.targetKey = item?.target_key ?? ''
  mapForm.template = item?.template ?? ''
  mapForm.defaultValueJson = jsonText(item?.defaultValue)
  mapForm.status = item?.status ?? 'enabled'
  mapLayerVisible.value = true
}

async function saveMap() {
  const defaultValue = parseJsonValue(mapForm.defaultValueJson, '默认值 JSON')
  if (defaultValue === null) return

  saving.value = true
  try {
    const payload = {
      functionId: mapForm.functionId,
      adapterId: mapForm.adapterId,
      routeId: mapForm.routeId || null,
      publicParam: mapForm.publicParam,
      target: mapForm.target,
      targetKey: mapForm.targetKey,
      template: mapForm.template || null,
      defaultValue,
      status: mapForm.status,
    }
    const res = mapForm.id
      ? await updateAdminAdapterParamMap(mapForm.id, payload)
      : await createAdminAdapterParamMap(payload)
    if (res.data) applyConfig(res.data)
    mapLayerVisible.value = false
    layer.msg('参数映射已保存', { icon: 1 })
  } catch {
    // 请求层已提示错误。
  } finally {
    saving.value = false
  }
}

async function toggleMapStatus(item: AdminAdapterParamMapConfig) {
  const res = await updateAdminAdapterParamMap(item.id, {
    status: item.status === 'enabled' ? 'disabled' : 'enabled',
  }).catch(() => null)
  if (res?.data) applyConfig(res.data)
}

onMounted(loadConfig)
</script>
