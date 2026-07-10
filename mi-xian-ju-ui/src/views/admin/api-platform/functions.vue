<template>
  <lay-container fluid="true" class="admin-page admin-api-workbench">
    <lay-card class="admin-card admin-page-hero">
      <div>
        <p class="admin-page-eyebrow">API Platform</p>
        <h1>功能接口</h1>
        <p class="admin-page-desc">
          在这里维护公开接口、参数契约、Route 选择和 Adapter 绑定，所有配置都围绕接口编码展开。
        </p>
      </div>
    </lay-card>

    <lay-card class="admin-card">
      <lay-form class="admin-search-form">
        <lay-row>
          <lay-col md="8" sm="12" xs="24">
            <lay-form-item label="接口搜索" label-width="80">
              <lay-input
                v-model="functionKeyword"
                placeholder="请输入 code / 名称 / 描述"
                size="sm"
                :allow-clear="true"
              />
            </lay-form-item>
          </lay-col>
          <lay-col md="8" sm="12" xs="24">
            <lay-form-item label-width="20">
              <lay-button type="normal" size="sm" @click="functionKeyword = ''">重置</lay-button>
              <lay-button type="primary" size="sm" :loading="loading" @click="loadConfig">
                刷新配置
              </lay-button>
              <lay-button size="sm" type="primary" @click="openFunctionLayer()">新增接口</lay-button>
            </lay-form-item>
          </lay-col>
        </lay-row>
      </lay-form>
    </lay-card>

    <lay-card title="功能接口" class="admin-card admin-list-card">
      <template #extra>
        <span class="admin-card-extra">点击名称进入接口详情，查看详情只展示单条数据</span>
      </template>
      <div v-if="loading" class="admin-empty-tip">正在加载配置...</div>
      <div v-else-if="!filteredFunctions.length" class="admin-empty-tip">
        没有找到匹配的接口，请调整搜索条件。
      </div>
      <table v-else class="admin-table compact admin-function-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>名称</th>
            <th>方法</th>
            <th>状态</th>
            <th>参数 / Route / 绑定</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredFunctions" :key="item.id">
            <td><code>{{ item.code }}</code></td>
            <td>
              <router-link class="admin-cell-link" :to="`/admin/api/functions/${item.id}/configs`">
                <strong>{{ item.name }}</strong>
              </router-link>
              <p>{{ item.description || '暂无描述' }}</p>
            </td>
            <td>{{ item.method }}</td>
            <td><span class="admin-status" :class="item.status">{{ item.status }}</span></td>
            <td>
              <router-link class="admin-cell-link" :to="`/admin/api/functions/${item.id}/configs`">
                <strong>{{ getFunctionParamCount(item.id) }}</strong>
              </router-link>
              <p>参数 / 场景 / 绑定：{{ getFunctionRouteCount(item.id) }} / {{ getFunctionBindingCount(item.id) }}</p>
            </td>
            <td>
              <div class="admin-table-actions">
                <lay-button size="xs" border="green" @click.stop="openFunctionLayer(item, true)">
                  查看详情
                </lay-button>
                <lay-button size="xs" border="green" @click.stop="openFunctionLayer(item)">
                  修改
                </lay-button>
                <lay-button size="xs" border="blue" @click.stop="openDebugLayer(item)">
                  试运行
                </lay-button>
                <lay-button
                  size="xs"
                  :type="item.status === 'enabled' ? 'warm' : 'primary'"
                  :loading="updating === `function-status:${item.id}`"
                  @click.stop="toggleFunctionStatus(item)"
                >
                  {{ item.status === 'enabled' ? '停用' : '启用' }}
                </lay-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </lay-card>

    <lay-layer
      v-model="functionLayerVisible"
      :title="functionReadonly ? '查看功能接口' : functionForm.id ? '修改功能接口' : '新增功能接口'"
      :area="['760px', '620px']"
    >
      <div class="admin-layer-form">
        <lay-row space="10">
          <lay-col md="12">
            <lay-form-item label="接口编码" label-width="100">
              <input v-model="functionForm.code" class="admin-form-input" :disabled="functionReadonly" placeholder="litevideo" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="名称" label-width="100">
              <input v-model="functionForm.name" class="admin-form-input" :disabled="functionReadonly" />
            </lay-form-item>
          </lay-col>
          <lay-col md="8">
            <lay-form-item label="方法" label-width="100">
              <select v-model="functionForm.method" class="admin-form-input" :disabled="functionReadonly">
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
              <input v-model="functionForm.responseType" class="admin-form-input" :disabled="functionReadonly" placeholder="raw" />
            </lay-form-item>
          </lay-col>
          <lay-col md="8">
            <lay-form-item label="状态" label-width="100">
              <select v-model="functionForm.status" class="admin-form-input" :disabled="functionReadonly">
                <option value="enabled">enabled</option>
                <option value="disabled">disabled</option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="24">
            <lay-form-item label="描述" label-width="100">
              <input v-model="functionForm.description" class="admin-form-input" :disabled="functionReadonly" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="参数 Schema" label-width="100">
              <textarea
                v-model="functionForm.paramsSchemaJson"
                class="admin-json-editor"
                rows="7"
                spellcheck="false"
                :readonly="functionReadonly"
              />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="默认参数" label-width="100">
              <textarea
                v-model="functionForm.defaultParamsJson"
                class="admin-json-editor"
                rows="7"
                spellcheck="false"
                :readonly="functionReadonly"
              />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="公开接口" label-width="100">
              <select v-model="functionForm.isPublic" class="admin-form-input" :disabled="functionReadonly">
                <option :value="true">是</option>
                <option :value="false">否</option>
              </select>
            </lay-form-item>
          </lay-col>
        </lay-row>
        <div class="admin-layer-actions">
          <lay-button v-if="!functionReadonly" size="sm" type="primary" :loading="saving" @click="saveFunction">
            保存
          </lay-button>
          <lay-button size="sm" @click="functionLayerVisible = false">
            {{ functionReadonly ? '关闭' : '取消' }}
          </lay-button>
        </div>
      </div>
    </lay-layer>

    <lay-layer v-model="debugLayerVisible" title="功能接口试运行" :area="['920px', '720px']">
      <div class="admin-layer-form">
        <lay-row space="10">
          <lay-col md="8">
            <lay-form-item label="接口编码" label-width="90">
              <input v-model="debugForm.code" class="admin-form-input" placeholder="litevideo" />
            </lay-form-item>
          </lay-col>
          <lay-col md="6">
            <lay-form-item label="方法" label-width="70">
              <select v-model="debugForm.method" class="admin-form-input">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="24">
            <lay-form-item label="请求参数" label-width="90">
              <textarea
                v-model="debugForm.paramsJson"
                class="admin-json-editor"
                rows="6"
                spellcheck="false"
                placeholder='{"category":"xiaojiejie"}'
              />
            </lay-form-item>
          </lay-col>
        </lay-row>

        <div class="admin-layer-actions">
          <lay-button size="sm" type="primary" :loading="debugLoading" @click="runDebugFunction">
            开始试运行
          </lay-button>
          <lay-button size="sm" @click="debugLayerVisible = false">关闭</lay-button>
        </div>

        <div v-if="debugResult" class="admin-debug-result">
          <h3>调试摘要</h3>
          <div class="admin-debug-grid">
            <div><span>接口</span><strong>{{ debugResult.name }}({{ debugResult.code }})</strong></div>
            <div><span>Route</span><strong>{{ debugResult.route?.routeKey || '-' }}</strong></div>
            <div><span>响应类型</span><strong>{{ debugResult.responseType }}</strong></div>
            <div><span>总耗时</span><strong>{{ debugResult.durationMs }}ms</strong></div>
          </div>

          <h3>公开参数</h3>
          <pre class="admin-debug-json">{{ formatDebugValue(debugResult.publicParams) }}</pre>

          <h3>Adapter 尝试</h3>
          <table class="admin-table compact">
            <thead>
              <tr>
                <th>Adapter</th>
                <th>URL</th>
                <th>状态</th>
                <th>耗时</th>
                <th>错误</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="attempt in debugResult.attempts" :key="`${attempt.bindingId}:${attempt.url}`">
                <td>
                  <strong>{{ attempt.adapterName }}</strong>
                  <p><code>{{ attempt.adapterCode }}</code></p>
                </td>
                <td><code>{{ attempt.url || '-' }}</code></td>
                <td>
                  <span class="admin-status" :class="attempt.success ? 'enabled' : 'disabled'">
                    {{ attempt.success ? 'success' : 'failed' }}
                  </span>
                  <p v-if="attempt.responseStatus">HTTP {{ attempt.responseStatus }}</p>
                </td>
                <td>{{ attempt.durationMs }}ms</td>
                <td>{{ attempt.error || '-' }}</td>
              </tr>
            </tbody>
          </table>

          <h3>最终响应</h3>
          <pre class="admin-debug-json">{{ formatDebugValue(debugResult.result ?? { errors: debugResult.errors }) }}</pre>
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
  debugAdminFunction,
  updateAdminFunction,
  type AdminFunctionDebugResponse,
  type AdminFunctionConfig,
} from '@/api/admin'
import { useAdminConfig } from './useAdminConfig'
import '@/assets/styles/admin-platform.css'

const {
  loading,
  updating,
  config,
  applyConfig,
  selectedFunction,
  loadConfig,
  toggleFunctionStatus,
} = useAdminConfig()

const functionKeyword = ref('')
const saving = ref(false)
const debugLoading = ref(false)
const functionReadonly = ref(false)
const functionLayerVisible = ref(false)
const debugLayerVisible = ref(false)
const debugResult = ref<AdminFunctionDebugResponse | null>(null)

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

const debugForm = reactive({
  code: '',
  method: 'GET',
  paramsJson: '{}',
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

function getFunctionParamCount(functionId: string) {
  return config.functionParams.filter((item) => item.function_id === functionId).length
}

function getFunctionRouteCount(functionId: string) {
  return config.functionRoutes.filter((item) => item.function_id === functionId).length
}

function getFunctionBindingCount(functionId: string) {
  return config.functionAdapters.filter((item) => item.function_id === functionId).length
}

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

function openFunctionLayer(item?: AdminFunctionConfig, readonly = false) {
  functionReadonly.value = readonly
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

function openDebugLayer(item?: AdminFunctionConfig) {
  const target = item ?? selectedFunction.value
  if (!target) return
  debugForm.code = target.code
  debugForm.method = target.method
  debugForm.paramsJson = jsonText(target.defaultParams ?? {}, '{}')
  debugResult.value = null
  debugLayerVisible.value = true
}

function formatDebugValue(value: unknown) {
  return JSON.stringify(value ?? null, null, 2)
}

async function runDebugFunction() {
  const params = parseJsonObject(debugForm.paramsJson, '请求参数')
  if (!params) return

  debugLoading.value = true
  try {
    const res = await debugAdminFunction({
      code: debugForm.code,
      method: debugForm.method,
      params,
    })
    if (res.data) {
      debugResult.value = res.data
      layer.msg('试运行完成', { icon: 1 })
    }
  } catch {
    // 请求层已提示错误。
  } finally {
    debugLoading.value = false
  }
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

onMounted(loadConfig)
</script>
