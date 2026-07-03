<template>
  <lay-container fluid="true" class="admin-page">
    <lay-card class="admin-card">
      <lay-form class="admin-search-form">
        <lay-row>
          <lay-col md="6" sm="12" xs="24">
            <lay-form-item label="平台关键字" label-width="90">
              <lay-input
                v-model="keyword"
                placeholder="平台 / Adapter / Base URL"
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
        <lay-card title="平台源" class="admin-card">
          <template #extra>
            <lay-button size="sm" type="primary" @click="openSourceLayer()">新增平台</lay-button>
          </template>
          <table class="admin-table compact">
            <thead>
              <tr>
                <th>Code</th>
                <th>名称</th>
                <th>Base URL</th>
                <th>超时</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredSources" :key="item.id">
                <td><code>{{ item.code }}</code></td>
                <td>{{ item.name }}</td>
                <td><code>{{ item.base_url }}</code></td>
                <td>{{ item.timeout_ms }}ms</td>
                <td><span class="admin-status" :class="item.status">{{ item.status }}</span></td>
                <td>
                  <div class="admin-table-actions">
                    <lay-button size="xs" border="green" @click="openSourceLayer(item)">
                      修改
                    </lay-button>
                    <lay-button
                      size="xs"
                      :type="item.status === 'enabled' ? 'warm' : 'primary'"
                      @click="toggleSourceStatus(item)"
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
        <lay-card title="Adapters" class="admin-card">
          <template #extra>
            <lay-button size="sm" type="primary" @click="openAdapterLayer()">新增 Adapter</lay-button>
            <lay-button size="sm" :loading="loading" @click="loadConfig">刷新</lay-button>
          </template>
          <table class="admin-table compact">
            <thead>
              <tr>
                <th>Code</th>
                <th>名称</th>
                <th>类型</th>
                <th>方法</th>
                <th>平台</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredAdapters" :key="item.id">
                <td><code>{{ item.code }}</code></td>
                <td>{{ item.name }}</td>
                <td>{{ item.type }}</td>
                <td>{{ item.method }}</td>
                <td>{{ item.source_name }}</td>
                <td><span class="admin-status" :class="item.status">{{ item.status }}</span></td>
                <td>
                  <div class="admin-table-actions">
                    <lay-button size="xs" border="green" @click="openAdapterLayer(item)">
                      修改
                    </lay-button>
                    <lay-button
                      size="xs"
                      :type="item.status === 'enabled' ? 'warm' : 'primary'"
                      @click="toggleAdapterStatus(item)"
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

    <lay-card title="响应映射" class="admin-card">
      <template #extra>
        <lay-button size="sm" type="primary" @click="openResponseMapLayer()">新增映射</lay-button>
      </template>
      <table class="admin-table compact">
        <thead>
          <tr>
            <th>Adapter</th>
            <th>功能</th>
            <th>Data Path</th>
            <th>Items Path</th>
            <th>字段映射</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredResponseMaps" :key="item.id">
            <td><code>{{ item.adapter_code }}</code></td>
            <td><code>{{ item.function_code || '通用' }}</code></td>
            <td><code>{{ item.data_path || '-' }}</code></td>
            <td><code>{{ item.items_path || '-' }}</code></td>
            <td><code>{{ formatObject(item.fields) }}</code></td>
            <td><span class="admin-status" :class="item.status">{{ item.status }}</span></td>
            <td>
              <div class="admin-table-actions">
                <lay-button size="xs" border="green" @click="openResponseMapLayer(item)">
                  修改
                </lay-button>
                <lay-button
                  size="xs"
                  :type="item.status === 'enabled' ? 'warm' : 'primary'"
                  @click="toggleResponseMapStatus(item)"
                >
                  {{ item.status === 'enabled' ? '停用' : '启用' }}
                </lay-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </lay-card>

    <lay-layer v-model="sourceLayerVisible" :title="sourceForm.id ? '修改平台源' : '新增平台源'" :area="['620px', '360px']">
      <div class="admin-layer-form">
        <lay-form>
          <lay-row space="10">
            <lay-col md="12">
              <lay-form-item label="编码" label-width="90">
                <input v-model="sourceForm.code" class="admin-form-input" placeholder="例如 yujn" />
              </lay-form-item>
            </lay-col>
            <lay-col md="12">
              <lay-form-item label="名称" label-width="90">
                <input v-model="sourceForm.name" class="admin-form-input" placeholder="例如 遇见 API" />
              </lay-form-item>
            </lay-col>
            <lay-col md="24">
              <lay-form-item label="Base URL" label-width="90">
                <input v-model="sourceForm.baseUrl" class="admin-form-input" placeholder="https://api.example.com" />
              </lay-form-item>
            </lay-col>
            <lay-col md="12">
              <lay-form-item label="超时(ms)" label-width="90">
                <input v-model.number="sourceForm.timeoutMs" class="admin-form-input" type="number" min="1" />
              </lay-form-item>
            </lay-col>
            <lay-col md="12">
              <lay-form-item label="状态" label-width="90">
                <select v-model="sourceForm.status" class="admin-form-input">
                  <option value="enabled">enabled</option>
                  <option value="disabled">disabled</option>
                </select>
              </lay-form-item>
            </lay-col>
          </lay-row>
        </lay-form>
        <div class="admin-layer-actions">
          <lay-button size="sm" type="primary" :loading="saving" @click="saveSource">保存</lay-button>
          <lay-button size="sm" @click="sourceLayerVisible = false">取消</lay-button>
        </div>
      </div>
    </lay-layer>

    <lay-layer v-model="adapterLayerVisible" :title="adapterForm.id ? '修改 Adapter' : '新增 Adapter'" :area="['760px', '620px']">
      <div class="admin-layer-form">
        <lay-form>
          <lay-row space="10">
            <lay-col md="12">
              <lay-form-item label="平台源" label-width="100">
                <select v-model="adapterForm.sourceId" class="admin-form-input">
                  <option value="">请选择</option>
                  <option v-for="source in config.sources" :key="source.id" :value="source.id">
                    {{ source.name }}({{ source.code }})
                  </option>
                </select>
              </lay-form-item>
            </lay-col>
            <lay-col md="12">
              <lay-form-item label="编码" label-width="100">
                <input v-model="adapterForm.code" class="admin-form-input" placeholder="例如 yujn-json" />
              </lay-form-item>
            </lay-col>
            <lay-col md="12">
              <lay-form-item label="名称" label-width="100">
                <input v-model="adapterForm.name" class="admin-form-input" />
              </lay-form-item>
            </lay-col>
            <lay-col md="12">
              <lay-form-item label="类型" label-width="100">
                <select v-model="adapterForm.type" class="admin-form-input">
                  <option value="http_custom">http_custom</option>
                  <option value="builtin">builtin</option>
                </select>
              </lay-form-item>
            </lay-col>
            <lay-col md="12">
              <lay-form-item label="方法" label-width="100">
                <select v-model="adapterForm.method" class="admin-form-input">
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </lay-form-item>
            </lay-col>
            <lay-col md="12">
              <lay-form-item label="Body 类型" label-width="100">
                <select v-model="adapterForm.bodyType" class="admin-form-input">
                  <option value="none">none</option>
                  <option value="json">json</option>
                  <option value="form">form</option>
                  <option value="text">text</option>
                </select>
              </lay-form-item>
            </lay-col>
            <lay-col md="24">
              <lay-form-item label="URL 模板" label-width="100">
                <input v-model="adapterForm.urlTemplate" class="admin-form-input" placeholder="{{baseUrl}}/api/demo.php" />
              </lay-form-item>
            </lay-col>
            <lay-col md="12">
              <lay-form-item label="Headers JSON" label-width="100">
                <textarea v-model="adapterForm.headersJson" class="admin-json-editor" rows="4" spellcheck="false" />
              </lay-form-item>
            </lay-col>
            <lay-col md="12">
              <lay-form-item label="Query JSON" label-width="100">
                <textarea v-model="adapterForm.queryJson" class="admin-json-editor" rows="4" spellcheck="false" />
              </lay-form-item>
            </lay-col>
            <lay-col md="12">
              <lay-form-item label="超时(ms)" label-width="100">
                <input v-model.number="adapterForm.timeoutMs" class="admin-form-input" type="number" min="1" />
              </lay-form-item>
            </lay-col>
            <lay-col md="12">
              <lay-form-item label="状态" label-width="100">
                <select v-model="adapterForm.status" class="admin-form-input">
                  <option value="enabled">enabled</option>
                  <option value="disabled">disabled</option>
                </select>
              </lay-form-item>
            </lay-col>
          </lay-row>
        </lay-form>
        <div class="admin-layer-actions">
          <lay-button size="sm" type="primary" :loading="saving" @click="saveAdapter">保存</lay-button>
          <lay-button size="sm" @click="adapterLayerVisible = false">取消</lay-button>
        </div>
      </div>
    </lay-layer>

    <lay-layer v-model="responseMapLayerVisible" :title="responseMapForm.id ? '修改响应映射' : '新增响应映射'" :area="['720px', '500px']">
      <div class="admin-layer-form">
        <lay-row space="10">
          <lay-col md="12">
            <lay-form-item label="Adapter" label-width="100">
              <select v-model="responseMapForm.adapterId" class="admin-form-input">
                <option value="">请选择</option>
                <option v-for="adapter in config.adapters" :key="adapter.id" :value="adapter.id">
                  {{ adapter.name }}({{ adapter.code }})
                </option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="功能接口" label-width="100">
              <select v-model="responseMapForm.functionId" class="admin-form-input">
                <option value="">通用</option>
                <option v-for="item in config.functions" :key="item.id" :value="item.id">
                  {{ item.name }}({{ item.code }})
                </option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="Data Path" label-width="100">
              <input v-model="responseMapForm.dataPath" class="admin-form-input" placeholder="data" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="Items Path" label-width="100">
              <input v-model="responseMapForm.itemsPath" class="admin-form-input" placeholder="list" />
            </lay-form-item>
          </lay-col>
          <lay-col md="24">
            <lay-form-item label="字段映射 JSON" label-width="100">
              <textarea
                v-model="responseMapForm.fieldsJson"
                class="admin-json-editor"
                rows="7"
                spellcheck="false"
                placeholder='{"url":"data.url","title":"title"}'
              />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="状态" label-width="100">
              <select v-model="responseMapForm.status" class="admin-form-input">
                <option value="enabled">enabled</option>
                <option value="disabled">disabled</option>
              </select>
            </lay-form-item>
          </lay-col>
        </lay-row>
        <div class="admin-layer-actions">
          <lay-button size="sm" type="primary" :loading="saving" @click="saveResponseMap">保存</lay-button>
          <lay-button size="sm" @click="responseMapLayerVisible = false">取消</lay-button>
        </div>
      </div>
    </lay-layer>
  </lay-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { layer } from '@layui/layer-vue'
import {
  createAdminAdapter,
  createAdminResponseMap,
  createAdminSource,
  updateAdminAdapter,
  updateAdminResponseMap,
  updateAdminSource,
  type AdminAdapterConfig,
  type AdminResponseMapConfig,
  type AdminSourceConfig,
} from '@/api/admin'
import { useAdminConfig } from './useAdminConfig'
import '@/assets/styles/admin-platform.css'

const { loading, config, applyConfig, loadConfig } = useAdminConfig()
const keyword = ref('')
const saving = ref(false)
const sourceLayerVisible = ref(false)
const adapterLayerVisible = ref(false)
const responseMapLayerVisible = ref(false)

const sourceForm = reactive({
  id: '',
  code: '',
  name: '',
  baseUrl: '',
  timeoutMs: 20000,
  status: 'enabled',
})

const adapterForm = reactive({
  id: '',
  sourceId: '',
  code: '',
  name: '',
  type: 'http_custom',
  method: 'GET',
  urlTemplate: '{{baseUrl}}',
  headersJson: '{}',
  queryJson: '{}',
  bodyType: 'none',
  timeoutMs: 20000,
  status: 'enabled',
})

const responseMapForm = reactive({
  id: '',
  adapterId: '',
  functionId: '',
  dataPath: '',
  itemsPath: '',
  fieldsJson: '{}',
  status: 'enabled',
})

const includesKeyword = (values: unknown[]) => {
  const normalizedKeyword = keyword.value.trim().toLowerCase()
  if (!normalizedKeyword) return true

  return values.some((value) => String(value ?? '').toLowerCase().includes(normalizedKeyword))
}

const filteredSources = computed(() =>
  config.sources.filter((item) =>
    includesKeyword([item.code, item.name, item.base_url, item.status]),
  ),
)

const filteredAdapters = computed(() =>
  config.adapters.filter((item) =>
    includesKeyword([item.code, item.name, item.type, item.method, item.source_name, item.status]),
  ),
)

const filteredResponseMaps = computed(() =>
  config.responseMaps.filter((item) =>
    includesKeyword([
      item.adapter_code,
      item.adapter_name,
      item.function_code,
      item.function_name,
      item.data_path,
      item.items_path,
      item.status,
    ]),
  ),
)

function formatObject(value: Record<string, unknown>) {
  return JSON.stringify(value)
}

function jsonText(value: string | null | undefined) {
  if (!value) return '{}'
  try {
    return JSON.stringify(JSON.parse(value) as unknown, null, 2)
  } catch {
    return value
  }
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

function openSourceLayer(item?: AdminSourceConfig) {
  sourceForm.id = item?.id ?? ''
  sourceForm.code = item?.code ?? ''
  sourceForm.name = item?.name ?? ''
  sourceForm.baseUrl = item?.base_url ?? ''
  sourceForm.timeoutMs = item?.timeout_ms ?? 20000
  sourceForm.status = item?.status ?? 'enabled'
  sourceLayerVisible.value = true
}

function openAdapterLayer(item?: AdminAdapterConfig) {
  adapterForm.id = item?.id ?? ''
  adapterForm.sourceId = item?.source_id ?? config.sources[0]?.id ?? ''
  adapterForm.code = item?.code ?? ''
  adapterForm.name = item?.name ?? ''
  adapterForm.type = item?.type ?? 'http_custom'
  adapterForm.method = item?.method ?? 'GET'
  adapterForm.urlTemplate = item?.url_template ?? '{{baseUrl}}'
  adapterForm.headersJson = jsonText(item?.headers_json)
  adapterForm.queryJson = jsonText(item?.query_template_json)
  adapterForm.bodyType = item?.body_type ?? 'none'
  adapterForm.timeoutMs = item?.timeout_ms ?? 20000
  adapterForm.status = item?.status ?? 'enabled'
  adapterLayerVisible.value = true
}

function openResponseMapLayer(item?: AdminResponseMapConfig) {
  responseMapForm.id = item?.id ?? ''
  responseMapForm.adapterId = item?.adapter_id ?? config.adapters[0]?.id ?? ''
  responseMapForm.functionId = item?.function_id ?? ''
  responseMapForm.dataPath = item?.data_path ?? ''
  responseMapForm.itemsPath = item?.items_path ?? ''
  responseMapForm.fieldsJson = JSON.stringify(item?.fields ?? {}, null, 2)
  responseMapForm.status = item?.status ?? 'enabled'
  responseMapLayerVisible.value = true
}

async function saveSource() {
  saving.value = true
  try {
    const payload = {
      code: sourceForm.code,
      name: sourceForm.name,
      baseUrl: sourceForm.baseUrl,
      timeoutMs: sourceForm.timeoutMs,
      status: sourceForm.status,
    }
    const res = sourceForm.id
      ? await updateAdminSource(sourceForm.id, payload)
      : await createAdminSource(payload)
    if (res.data) applyConfig(res.data)
    sourceLayerVisible.value = false
    layer.msg('平台源已保存', { icon: 1 })
  } catch {
    // 请求层已提示错误。
  } finally {
    saving.value = false
  }
}

async function saveAdapter() {
  const headers = parseJsonObject(adapterForm.headersJson, 'Headers JSON')
  const queryTemplate = parseJsonObject(adapterForm.queryJson, 'Query JSON')
  if (!headers || !queryTemplate) return

  saving.value = true
  try {
    const payload = {
      sourceId: adapterForm.sourceId,
      code: adapterForm.code,
      name: adapterForm.name,
      type: adapterForm.type,
      method: adapterForm.method,
      urlTemplate: adapterForm.urlTemplate,
      headers,
      queryTemplate,
      bodyType: adapterForm.bodyType,
      timeoutMs: adapterForm.timeoutMs,
      status: adapterForm.status,
    }
    const res = adapterForm.id
      ? await updateAdminAdapter(adapterForm.id, payload)
      : await createAdminAdapter(payload)
    if (res.data) applyConfig(res.data)
    adapterLayerVisible.value = false
    layer.msg('Adapter 已保存', { icon: 1 })
  } catch {
    // 请求层已提示错误。
  } finally {
    saving.value = false
  }
}

async function saveResponseMap() {
  const fields = parseJsonObject(responseMapForm.fieldsJson, '字段映射 JSON')
  if (!fields) return

  saving.value = true
  try {
    const payload = {
      adapterId: responseMapForm.adapterId,
      functionId: responseMapForm.functionId || null,
      dataPath: responseMapForm.dataPath || null,
      itemsPath: responseMapForm.itemsPath || null,
      fields,
      status: responseMapForm.status,
    }
    const res = responseMapForm.id
      ? await updateAdminResponseMap(responseMapForm.id, payload)
      : await createAdminResponseMap(payload)
    if (res.data) applyConfig(res.data)
    responseMapLayerVisible.value = false
    layer.msg('响应映射已保存', { icon: 1 })
  } catch {
    // 请求层已提示错误。
  } finally {
    saving.value = false
  }
}

async function toggleSourceStatus(item: AdminSourceConfig) {
  const res = await updateAdminSource(item.id, {
    status: item.status === 'enabled' ? 'disabled' : 'enabled',
  }).catch(() => null)
  if (res?.data) applyConfig(res.data)
}

async function toggleAdapterStatus(item: AdminAdapterConfig) {
  const res = await updateAdminAdapter(item.id, {
    status: item.status === 'enabled' ? 'disabled' : 'enabled',
  }).catch(() => null)
  if (res?.data) applyConfig(res.data)
}

async function toggleResponseMapStatus(item: AdminResponseMapConfig) {
  const res = await updateAdminResponseMap(item.id, {
    status: item.status === 'enabled' ? 'disabled' : 'enabled',
  }).catch(() => null)
  if (res?.data) applyConfig(res.data)
}

onMounted(loadConfig)
</script>
