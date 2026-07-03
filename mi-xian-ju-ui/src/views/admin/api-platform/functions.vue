<template>
  <lay-container fluid="true" class="admin-page">
    <lay-card class="admin-card">
      <lay-form class="admin-search-form">
        <lay-row>
          <lay-col md="6" sm="12" xs="24">
            <lay-form-item label="接口编码" label-width="80">
              <lay-input
                v-model="functionKeyword"
                placeholder="请输入 code / 名称"
                size="sm"
                :allow-clear="true"
              />
            </lay-form-item>
          </lay-col>
          <lay-col md="6" sm="12" xs="24">
            <lay-form-item label-width="20">
              <lay-button type="normal" size="sm" @click="functionKeyword = ''">重置</lay-button>
              <lay-button type="primary" size="sm" :loading="loading" @click="loadConfig">
                查询
              </lay-button>
            </lay-form-item>
          </lay-col>
        </lay-row>
      </lay-form>
    </lay-card>

    <lay-card title="功能接口" class="admin-card">
      <template #extra>
        <lay-button size="sm" type="primary" @click="openFunctionLayer()">新增接口</lay-button>
        <lay-button size="sm" :loading="loading" @click="loadConfig">刷新</lay-button>
      </template>
      <div v-if="loading" class="admin-empty-tip">正在加载配置...</div>
      <table v-else class="admin-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>名称</th>
            <th>方法</th>
            <th>响应类型</th>
            <th>状态</th>
            <th>默认参数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredFunctions" :key="item.id">
            <td><code>{{ item.code }}</code></td>
            <td>
              <strong>{{ item.name }}</strong>
              <p>{{ item.description || '暂无描述' }}</p>
            </td>
            <td>{{ item.method }}</td>
            <td>{{ item.response_type }}</td>
            <td><span class="admin-status" :class="item.status">{{ item.status }}</span></td>
            <td>
              <textarea
                v-model="functionParamDrafts[item.id]"
                class="admin-json-editor"
                rows="3"
                spellcheck="false"
              />
            </td>
            <td>
              <div class="admin-table-actions">
                <lay-button
                  size="xs"
                  :type="item.status === 'enabled' ? 'warm' : 'primary'"
                  :loading="updating === `function-status:${item.id}`"
                  @click="toggleFunctionStatus(item)"
                >
                  {{ item.status === 'enabled' ? '停用' : '启用' }}
                </lay-button>
                <lay-button
                  size="xs"
                  border="green"
                  @click="openFunctionLayer(item)"
                >
                  修改
                </lay-button>
                <lay-button
                  size="xs"
                  border="blue"
                  :loading="updating === `function-params:${item.id}`"
                  @click="saveFunctionParams(item)"
                >
                  保存参数
                </lay-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </lay-card>

    <lay-card class="admin-card">
      <lay-form class="admin-search-form">
        <lay-row>
          <lay-col md="6" sm="12" xs="24">
            <lay-form-item label="绑定关键字" label-width="90">
              <lay-input
                v-model="bindingKeyword"
                placeholder="功能 / Route / Adapter"
                size="sm"
                :allow-clear="true"
              />
            </lay-form-item>
          </lay-col>
          <lay-col md="6" sm="12" xs="24">
            <lay-form-item label-width="20">
              <lay-button type="normal" size="sm" @click="bindingKeyword = ''">重置</lay-button>
              <lay-button type="primary" size="sm" :loading="loading" @click="loadConfig">
                查询
              </lay-button>
            </lay-form-item>
          </lay-col>
        </lay-row>
      </lay-form>
    </lay-card>

    <lay-card title="功能 Adapter 绑定" class="admin-card">
      <template #extra>
        <lay-button size="sm" type="primary" @click="openBindingLayer()">新增绑定</lay-button>
      </template>
      <table class="admin-table">
        <thead>
          <tr>
            <th>功能</th>
            <th>Route</th>
            <th>Adapter</th>
            <th>平台源</th>
            <th>优先级</th>
            <th>Fallback</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredFunctionAdapters" :key="item.id">
            <td>
              <strong>{{ item.function_name }}</strong>
              <p><code>{{ item.function_code }}</code></p>
            </td>
            <td><code>{{ item.route_key || '未绑定' }}</code></td>
            <td>
              {{ item.adapter_name }}
              <p><code>{{ item.adapter_code }}</code></p>
            </td>
            <td>{{ item.source_name }}</td>
            <td>
              <input
                v-model.number="adapterPriorityDrafts[item.id]"
                class="admin-priority-input"
                type="number"
                min="0"
              />
            </td>
            <td>{{ item.fallback_enabled ? '开启' : '关闭' }}</td>
            <td><span class="admin-status" :class="item.status">{{ item.status }}</span></td>
            <td>
              <div class="admin-table-actions">
                <lay-button
                  size="xs"
                  :type="item.status === 'enabled' ? 'warm' : 'primary'"
                  :loading="updating === `binding-status:${item.id}`"
                  @click="toggleBindingStatus(item)"
                >
                  {{ item.status === 'enabled' ? '停用' : '启用' }}
                </lay-button>
                <lay-button
                  size="xs"
                  border="blue"
                  :loading="updating === `binding-priority:${item.id}`"
                  @click="saveBindingPriority(item)"
                >
                  保存排序
                </lay-button>
                <lay-button size="xs" border="green" @click="openBindingLayer(item)">
                  修改
                </lay-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </lay-card>

    <lay-layer v-model="functionLayerVisible" :title="functionForm.id ? '修改功能接口' : '新增功能接口'" :area="['760px', '620px']">
      <div class="admin-layer-form">
        <lay-row space="10">
          <lay-col md="12">
            <lay-form-item label="接口编码" label-width="100">
              <input v-model="functionForm.code" class="admin-form-input" placeholder="hot-video" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="名称" label-width="100">
              <input v-model="functionForm.name" class="admin-form-input" />
            </lay-form-item>
          </lay-col>
          <lay-col md="8">
            <lay-form-item label="方法" label-width="100">
              <select v-model="functionForm.method" class="admin-form-input">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="8">
            <lay-form-item label="响应类型" label-width="100">
              <input v-model="functionForm.responseType" class="admin-form-input" placeholder="raw" />
            </lay-form-item>
          </lay-col>
          <lay-col md="8">
            <lay-form-item label="状态" label-width="100">
              <select v-model="functionForm.status" class="admin-form-input">
                <option value="enabled">enabled</option>
                <option value="disabled">disabled</option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="24">
            <lay-form-item label="描述" label-width="100">
              <input v-model="functionForm.description" class="admin-form-input" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="参数 Schema" label-width="100">
              <textarea v-model="functionForm.paramsSchemaJson" class="admin-json-editor" rows="7" spellcheck="false" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="默认参数" label-width="100">
              <textarea v-model="functionForm.defaultParamsJson" class="admin-json-editor" rows="7" spellcheck="false" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="公开接口" label-width="100">
              <select v-model="functionForm.isPublic" class="admin-form-input">
                <option :value="true">是</option>
                <option :value="false">否</option>
              </select>
            </lay-form-item>
          </lay-col>
        </lay-row>
        <div class="admin-layer-actions">
          <lay-button size="sm" type="primary" :loading="saving" @click="saveFunction">保存</lay-button>
          <lay-button size="sm" @click="functionLayerVisible = false">取消</lay-button>
        </div>
      </div>
    </lay-layer>

    <lay-layer v-model="bindingLayerVisible" :title="bindingForm.id ? '修改 Adapter 绑定' : '新增 Adapter 绑定'" :area="['760px', '620px']">
      <div class="admin-layer-form">
        <lay-row space="10">
          <lay-col md="12">
            <lay-form-item label="功能接口" label-width="100">
              <select v-model="bindingForm.functionId" class="admin-form-input">
                <option value="">请选择</option>
                <option v-for="item in config.functions" :key="item.id" :value="item.id">
                  {{ item.name }}({{ item.code }})
                </option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="Route" label-width="100">
              <select v-model="bindingForm.routeId" class="admin-form-input">
                <option value="">未绑定</option>
                <option v-for="item in bindingRoutes" :key="item.id" :value="item.id">
                  {{ item.name }}({{ item.route_key }})
                </option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="Adapter" label-width="100">
              <select v-model="bindingForm.adapterId" class="admin-form-input">
                <option value="">请选择</option>
                <option v-for="item in config.adapters" :key="item.id" :value="item.id">
                  {{ item.name }}({{ item.code }})
                </option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="状态" label-width="100">
              <select v-model="bindingForm.status" class="admin-form-input">
                <option value="enabled">enabled</option>
                <option value="disabled">disabled</option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="8">
            <lay-form-item label="优先级" label-width="100">
              <input v-model.number="bindingForm.priority" class="admin-form-input" type="number" min="0" />
            </lay-form-item>
          </lay-col>
          <lay-col md="8">
            <lay-form-item label="权重" label-width="100">
              <input v-model.number="bindingForm.weight" class="admin-form-input" type="number" min="1" />
            </lay-form-item>
          </lay-col>
          <lay-col md="8">
            <lay-form-item label="Fallback" label-width="100">
              <select v-model="bindingForm.fallbackEnabled" class="admin-form-input">
                <option :value="true">开启</option>
                <option :value="false">关闭</option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="固定参数" label-width="100">
              <textarea v-model="bindingForm.fixedParamsJson" class="admin-json-editor" rows="7" spellcheck="false" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="默认参数" label-width="100">
              <textarea v-model="bindingForm.defaultParamsJson" class="admin-json-editor" rows="7" spellcheck="false" />
            </lay-form-item>
          </lay-col>
        </lay-row>
        <div class="admin-layer-actions">
          <lay-button size="sm" type="primary" :loading="saving" @click="saveBinding">保存</lay-button>
          <lay-button size="sm" @click="bindingLayerVisible = false">取消</lay-button>
        </div>
      </div>
    </lay-layer>
  </lay-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { layer } from '@layui/layer-vue'
import {
  createAdminFunction,
  createAdminFunctionAdapter,
  updateAdminFunction,
  updateAdminFunctionAdapter,
  type AdminFunctionAdapterConfig,
  type AdminFunctionConfig,
} from '@/api/admin'
import { useAdminConfig } from './useAdminConfig'
import '@/assets/styles/admin-platform.css'

const {
  loading,
  updating,
  config,
  applyConfig,
  functionParamDrafts,
  adapterPriorityDrafts,
  loadConfig,
  toggleFunctionStatus,
  saveFunctionParams,
  toggleBindingStatus,
  saveBindingPriority,
} = useAdminConfig()

const functionKeyword = ref('')
const bindingKeyword = ref('')
const saving = ref(false)
const functionLayerVisible = ref(false)
const bindingLayerVisible = ref(false)

const functionForm = reactive({
  id: '',
  code: '',
  name: '',
  method: 'GET',
  responseType: 'raw',
  description: '',
  paramsSchemaJson: '',
  defaultParamsJson: '{}',
  isPublic: true,
  status: 'enabled',
})

const bindingForm = reactive({
  id: '',
  functionId: '',
  adapterId: '',
  routeId: '',
  priority: 100,
  weight: 1,
  fallbackEnabled: true,
  fixedParamsJson: '{}',
  defaultParamsJson: '{}',
  status: 'enabled',
})

const filteredFunctions = computed(() => {
  const keyword = functionKeyword.value.trim().toLowerCase()
  if (!keyword) return config.functions

  return config.functions.filter((item) =>
    [item.code, item.name, item.description].some((value) =>
      String(value ?? '').toLowerCase().includes(keyword),
    ),
  )
})

const filteredFunctionAdapters = computed(() => {
  const keyword = bindingKeyword.value.trim().toLowerCase()
  if (!keyword) return config.functionAdapters

  return config.functionAdapters.filter((item) =>
    [
      item.function_code,
      item.function_name,
      item.route_key,
      item.adapter_code,
      item.adapter_name,
      item.source_name,
    ].some((value) => String(value ?? '').toLowerCase().includes(keyword)),
  )
})

const bindingRoutes = computed(() =>
  config.functionRoutes.filter((item) => !bindingForm.functionId || item.function_id === bindingForm.functionId),
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

function openFunctionLayer(item?: AdminFunctionConfig) {
  functionForm.id = item?.id ?? ''
  functionForm.code = item?.code ?? ''
  functionForm.name = item?.name ?? ''
  functionForm.method = item?.method ?? 'GET'
  functionForm.responseType = item?.response_type ?? 'raw'
  functionForm.description = item?.description ?? ''
  functionForm.paramsSchemaJson = item?.paramsSchema ? jsonText(item.paramsSchema) : ''
  functionForm.defaultParamsJson = jsonText(item?.defaultParams ?? {}, '{}')
  functionForm.isPublic = item ? Boolean(item.is_public) : true
  functionForm.status = item?.status ?? 'enabled'
  functionLayerVisible.value = true
}

function openBindingLayer(item?: AdminFunctionAdapterConfig) {
  bindingForm.id = item?.id ?? ''
  bindingForm.functionId = item?.function_id ?? config.functions[0]?.id ?? ''
  bindingForm.adapterId = item?.adapter_id ?? config.adapters[0]?.id ?? ''
  bindingForm.routeId = item?.route_id ?? ''
  bindingForm.priority = item?.priority ?? 100
  bindingForm.weight = item?.weight ?? 1
  bindingForm.fallbackEnabled = item ? Boolean(item.fallback_enabled) : true
  bindingForm.fixedParamsJson = jsonText(item?.fixedParams ?? {}, '{}')
  bindingForm.defaultParamsJson = jsonText(item?.defaultParams ?? {}, '{}')
  bindingForm.status = item?.status ?? 'enabled'
  bindingLayerVisible.value = true
}

async function saveFunction() {
  const paramsSchema = functionForm.paramsSchemaJson.trim()
    ? parseJsonObject(functionForm.paramsSchemaJson, '参数 Schema')
    : null
  const defaultParams = parseJsonObject(functionForm.defaultParamsJson, '默认参数')
  if (paramsSchema === null && functionForm.paramsSchemaJson.trim()) return
  if (!defaultParams) return

  saving.value = true
  try {
    const payload = {
      code: functionForm.code,
      name: functionForm.name,
      method: functionForm.method,
      responseType: functionForm.responseType,
      description: functionForm.description,
      paramsSchema,
      defaultParams,
      isPublic: functionForm.isPublic,
      status: functionForm.status,
    }
    const res = functionForm.id
      ? await updateAdminFunction(functionForm.id, payload)
      : await createAdminFunction(payload)
    if (res.data) applyConfig(res.data)
    functionLayerVisible.value = false
    layer.msg('功能接口已保存', { icon: 1 })
  } catch {
    // 请求层已提示错误。
  } finally {
    saving.value = false
  }
}

async function saveBinding() {
  const fixedParams = parseJsonObject(bindingForm.fixedParamsJson, '固定参数')
  const defaultParams = parseJsonObject(bindingForm.defaultParamsJson, '默认参数')
  if (!fixedParams || !defaultParams) return

  saving.value = true
  try {
    const payload = {
      functionId: bindingForm.functionId,
      adapterId: bindingForm.adapterId,
      routeId: bindingForm.routeId || null,
      priority: bindingForm.priority,
      weight: bindingForm.weight,
      fallbackEnabled: bindingForm.fallbackEnabled,
      fixedParams,
      defaultParams,
      status: bindingForm.status,
    }
    const res = bindingForm.id
      ? await updateAdminFunctionAdapter(bindingForm.id, payload)
      : await createAdminFunctionAdapter(payload)
    if (res.data) applyConfig(res.data)
    bindingLayerVisible.value = false
    layer.msg('Adapter 绑定已保存', { icon: 1 })
  } catch {
    // 请求层已提示错误。
  } finally {
    saving.value = false
  }
}

onMounted(loadConfig)
</script>
