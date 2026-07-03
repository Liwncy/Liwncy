<template>
  <lay-container fluid="true" class="admin-page">
    <lay-card class="admin-card">
      <lay-form class="admin-search-form">
        <lay-row>
          <lay-col md="6" sm="12" xs="24">
            <lay-form-item label="功能编码" label-width="80">
              <lay-input
                v-model="keyword"
                placeholder="功能 / 参数 / Route / Adapter"
                size="sm"
                :allow-clear="true"
              />
            </lay-form-item>
          </lay-col>
          <lay-col md="6" sm="12" xs="24">
            <lay-form-item label-width="20">
              <lay-button type="normal" size="sm" @click="keyword = ''">重置</lay-button>
              <lay-button type="primary" size="sm" :loading="loading" @click="loadConfig">
                查询
              </lay-button>
            </lay-form-item>
          </lay-col>
        </lay-row>
      </lay-form>
    </lay-card>

    <lay-row space="10">
      <lay-col md="12">
        <lay-card title="公开参数" class="admin-card">
          <template #extra>
            <lay-button size="sm" type="primary" @click="openParamLayer()">新增参数</lay-button>
          </template>
          <table class="admin-table compact">
            <thead>
              <tr>
                <th>功能</th>
                <th>参数</th>
                <th>来源/类型</th>
                <th>默认值</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredFunctionParams" :key="item.id">
                <td><code>{{ item.function_code }}</code></td>
                <td>
                  <strong>{{ item.label }}</strong>
                  <p><code>{{ item.param_key }}</code></p>
                </td>
                <td>{{ item.source }} / {{ item.type }}</td>
                <td><code>{{ formatValue(item.defaultValue) }}</code></td>
                <td><span class="admin-status" :class="item.status">{{ item.status }}</span></td>
                <td>
                  <div class="admin-table-actions">
                    <lay-button size="xs" border="green" @click="openParamLayer(item)">修改</lay-button>
                    <lay-button
                      size="xs"
                      :type="item.status === 'enabled' ? 'warm' : 'primary'"
                      @click="toggleParamStatus(item)"
                    >
                      {{ item.status === 'enabled' ? '停用' : '启用' }}
                    </lay-button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </lay-card>
      </lay-col>
      <lay-col md="12">
        <lay-card title="参数场景 Route" class="admin-card">
          <template #extra>
            <lay-button size="sm" type="primary" @click="openRouteLayer()">新增 Route</lay-button>
          </template>
          <table class="admin-table compact">
            <thead>
              <tr>
                <th>功能</th>
                <th>Route</th>
                <th>匹配条件</th>
                <th>默认参数</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredFunctionRoutes" :key="item.id">
                <td><code>{{ item.function_code }}</code></td>
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
      </lay-col>
    </lay-row>

    <lay-card title="Adapter 参数映射" class="admin-card">
      <template #extra>
        <lay-button size="sm" type="primary" @click="openMapLayer()">新增映射</lay-button>
        <lay-button size="sm" :loading="loading" @click="loadConfig">刷新</lay-button>
      </template>
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

    <lay-layer v-model="paramLayerVisible" :title="paramForm.id ? '修改公开参数' : '新增公开参数'" :area="['720px', '560px']">
      <div class="admin-layer-form">
        <lay-row space="10">
          <lay-col md="12">
            <lay-form-item label="功能接口" label-width="90">
              <select v-model="paramForm.functionId" class="admin-form-input">
                <option value="">请选择</option>
                <option v-for="item in config.functions" :key="item.id" :value="item.id">
                  {{ item.name }}({{ item.code }})
                </option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="参数 Key" label-width="90">
              <input v-model="paramForm.paramKey" class="admin-form-input" placeholder="category" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="名称" label-width="90">
              <input v-model="paramForm.label" class="admin-form-input" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="来源/类型" label-width="90">
              <div class="admin-inline-fields">
                <select v-model="paramForm.source" class="admin-form-input">
                  <option value="any">any</option>
                  <option value="query">query</option>
                  <option value="body">body</option>
                </select>
                <select v-model="paramForm.type" class="admin-form-input">
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="json">json</option>
                </select>
              </div>
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="默认值 JSON" label-width="90">
              <textarea v-model="paramForm.defaultValueJson" class="admin-json-editor" rows="4" spellcheck="false" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="可选值 JSON" label-width="90">
              <textarea v-model="paramForm.allowValuesJson" class="admin-json-editor" rows="4" spellcheck="false" />
            </lay-form-item>
          </lay-col>
          <lay-col md="24">
            <lay-form-item label="说明" label-width="90">
              <input v-model="paramForm.description" class="admin-form-input" />
            </lay-form-item>
          </lay-col>
          <lay-col md="8">
            <lay-form-item label="排序" label-width="90">
              <input v-model.number="paramForm.sort" class="admin-form-input" type="number" min="0" />
            </lay-form-item>
          </lay-col>
          <lay-col md="8">
            <lay-form-item label="必填" label-width="90">
              <select v-model="paramForm.required" class="admin-form-input">
                <option :value="false">否</option>
                <option :value="true">是</option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="8">
            <lay-form-item label="状态" label-width="90">
              <select v-model="paramForm.status" class="admin-form-input">
                <option value="enabled">enabled</option>
                <option value="disabled">disabled</option>
              </select>
            </lay-form-item>
          </lay-col>
        </lay-row>
        <div class="admin-layer-actions">
          <lay-button size="sm" type="primary" :loading="saving" @click="saveParam">保存</lay-button>
          <lay-button size="sm" @click="paramLayerVisible = false">取消</lay-button>
        </div>
      </div>
    </lay-layer>

    <lay-layer v-model="routeLayerVisible" :title="routeForm.id ? '修改 Route' : '新增 Route'" :area="['720px', '500px']">
      <div class="admin-layer-form">
        <lay-row space="10">
          <lay-col md="12">
            <lay-form-item label="功能接口" label-width="90">
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
  createAdminFunctionParam,
  createAdminFunctionRoute,
  updateAdminAdapterParamMap,
  updateAdminFunctionParam,
  updateAdminFunctionRoute,
  type AdminAdapterParamMapConfig,
  type AdminFunctionParamConfig,
  type AdminFunctionRouteConfig,
} from '@/api/admin'
import { formatValue, useAdminConfig } from './useAdminConfig'
import '@/assets/styles/admin-platform.css'

const { loading, config, applyConfig, loadConfig } = useAdminConfig()
const keyword = ref('')
const saving = ref(false)
const paramLayerVisible = ref(false)
const routeLayerVisible = ref(false)
const mapLayerVisible = ref(false)

const paramForm = reactive({
  id: '',
  functionId: '',
  paramKey: '',
  label: '',
  source: 'any',
  type: 'string',
  required: false,
  defaultValueJson: '',
  allowValuesJson: '[]',
  description: '',
  sort: 100,
  status: 'enabled',
})

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

const filteredFunctionParams = computed(() =>
  config.functionParams.filter((item) =>
    includesKeyword([item.function_code, item.param_key, item.label, item.source, item.type]),
  ),
)

const filteredFunctionRoutes = computed(() =>
  config.functionRoutes.filter((item) =>
    includesKeyword([item.function_code, item.route_key, item.name, formatValue(item.match)]),
  ),
)

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

function parseJsonObject(raw: string, label: string) {
  const value = parseJsonValue(raw || '{}', label)
  if (value === null) return null
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    layer.msg(`${label}必须是 JSON 对象`, { icon: 2 })
    return null
  }
  return value as Record<string, unknown>
}

function parseJsonArray(raw: string, label: string) {
  const value = parseJsonValue(raw || '[]', label)
  if (value === null) return null
  if (!Array.isArray(value)) {
    layer.msg(`${label}必须是 JSON 数组`, { icon: 2 })
    return null
  }
  return value
}

function openParamLayer(item?: AdminFunctionParamConfig) {
  paramForm.id = item?.id ?? ''
  paramForm.functionId = item?.function_id ?? config.functions[0]?.id ?? ''
  paramForm.paramKey = item?.param_key ?? ''
  paramForm.label = item?.label ?? ''
  paramForm.source = item?.source ?? 'any'
  paramForm.type = item?.type ?? 'string'
  paramForm.required = Boolean(item?.required)
  paramForm.defaultValueJson = jsonText(item?.defaultValue)
  paramForm.allowValuesJson = jsonText(item?.allowValues ?? [], '[]')
  paramForm.description = item?.description ?? ''
  paramForm.sort = item?.sort ?? 100
  paramForm.status = item?.status ?? 'enabled'
  paramLayerVisible.value = true
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

async function saveParam() {
  const defaultValue = parseJsonValue(paramForm.defaultValueJson, '默认值 JSON')
  const allowValues = parseJsonArray(paramForm.allowValuesJson, '可选值 JSON')
  if (defaultValue === null || allowValues === null) return

  saving.value = true
  try {
    const payload = {
      functionId: paramForm.functionId,
      paramKey: paramForm.paramKey,
      label: paramForm.label,
      source: paramForm.source,
      type: paramForm.type,
      required: paramForm.required,
      defaultValue,
      allowValues,
      description: paramForm.description,
      sort: paramForm.sort,
      status: paramForm.status,
    }
    const res = paramForm.id
      ? await updateAdminFunctionParam(paramForm.id, payload)
      : await createAdminFunctionParam(payload)
    if (res.data) applyConfig(res.data)
    paramLayerVisible.value = false
    layer.msg('公开参数已保存', { icon: 1 })
  } catch {
    // 请求层已提示错误。
  } finally {
    saving.value = false
  }
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

async function toggleParamStatus(item: AdminFunctionParamConfig) {
  const res = await updateAdminFunctionParam(item.id, {
    status: item.status === 'enabled' ? 'disabled' : 'enabled',
  }).catch(() => null)
  if (res?.data) applyConfig(res.data)
}

async function toggleRouteStatus(item: AdminFunctionRouteConfig) {
  const res = await updateAdminFunctionRoute(item.id, {
    status: item.status === 'enabled' ? 'disabled' : 'enabled',
  }).catch(() => null)
  if (res?.data) applyConfig(res.data)
}

async function toggleMapStatus(item: AdminAdapterParamMapConfig) {
  const res = await updateAdminAdapterParamMap(item.id, {
    status: item.status === 'enabled' ? 'disabled' : 'enabled',
  }).catch(() => null)
  if (res?.data) applyConfig(res.data)
}

onMounted(loadConfig)
</script>
