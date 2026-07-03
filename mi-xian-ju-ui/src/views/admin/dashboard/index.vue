<template>
  <div class="dashboard api-dashboard">
    <div class="dashboard-hero">
      <div>
        <p class="eyebrow">Mi Xian Ju API Platform</p>
        <h1>芈仙居 API 平台</h1>
        <p class="hero-desc">统一维护公开接口、平台源和 adapter，前端只按功能调用。</p>
      </div>
      <lay-button type="primary" :loading="loading" @click="loadConfig">刷新配置</lay-button>
    </div>

    <lay-row space="16" class="summary-grid">
      <lay-col md="8">
        <lay-card title="公开接口">
          <strong class="metric">{{ config.functions.length }}</strong>
          <p class="metric-tip">通过 `/api/v1/:code` 对外提供服务</p>
        </lay-card>
      </lay-col>
      <lay-col md="8">
        <lay-card title="平台源">
          <strong class="metric">{{ config.sources.length }}</strong>
          <p class="metric-tip">第三方平台只在后台可见</p>
        </lay-card>
      </lay-col>
      <lay-col md="8">
        <lay-card title="Adapters">
          <strong class="metric">{{ config.adapters.length }}</strong>
          <p class="metric-tip">支持内置与自定义 HTTP adapter</p>
        </lay-card>
      </lay-col>
    </lay-row>

    <lay-card title="功能接口" class="config-card">
      <div v-if="loading" class="empty-tip">正在加载配置...</div>
      <table v-else class="config-table">
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
          <tr v-for="item in config.functions" :key="item.id">
            <td><code>{{ item.code }}</code></td>
            <td>
              <strong>{{ item.name }}</strong>
              <p>{{ item.description || '暂无描述' }}</p>
            </td>
            <td>{{ item.method }}</td>
            <td>{{ item.response_type }}</td>
            <td><span class="status" :class="item.status">{{ item.status }}</span></td>
            <td>
              <textarea
                v-model="functionParamDrafts[item.id]"
                class="json-editor"
                rows="3"
                spellcheck="false"
              />
            </td>
            <td>
              <div class="table-actions">
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

    <lay-card title="功能 Adapter 绑定" class="config-card">
      <table class="config-table">
        <thead>
          <tr>
            <th>功能</th>
            <th>Adapter</th>
            <th>平台源</th>
            <th>优先级</th>
            <th>Fallback</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in config.functionAdapters" :key="item.id">
            <td>
              <strong>{{ item.function_name }}</strong>
              <p><code>{{ item.function_code }}</code></p>
            </td>
            <td>
              {{ item.adapter_name }}
              <p><code>{{ item.adapter_code }}</code></p>
            </td>
            <td>{{ item.source_name }}</td>
            <td>
              <input
                v-model.number="adapterPriorityDrafts[item.id]"
                class="priority-input"
                type="number"
                min="0"
              />
            </td>
            <td>{{ item.fallback_enabled ? '开启' : '关闭' }}</td>
            <td><span class="status" :class="item.status">{{ item.status }}</span></td>
            <td>
              <div class="table-actions">
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
                  border="green"
                  :loading="updating === `binding-priority:${item.id}`"
                  @click="saveBindingPriority(item)"
                >
                  保存排序
                </lay-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </lay-card>

    <lay-row space="16">
      <lay-col md="12">
        <lay-card title="平台源" class="config-card">
          <table class="config-table compact">
            <thead>
              <tr>
                <th>Code</th>
                <th>名称</th>
                <th>Base URL</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in config.sources" :key="item.id">
                <td><code>{{ item.code }}</code></td>
                <td>{{ item.name }}</td>
                <td><code>{{ item.base_url }}</code></td>
                <td><span class="status" :class="item.status">{{ item.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </lay-card>
      </lay-col>
      <lay-col md="12">
        <lay-card title="Adapter" class="config-card">
          <table class="config-table compact">
            <thead>
              <tr>
                <th>Code</th>
                <th>名称</th>
                <th>类型</th>
                <th>平台</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in config.adapters" :key="item.id">
                <td><code>{{ item.code }}</code></td>
                <td>{{ item.name }}</td>
                <td>{{ item.type }}</td>
                <td>{{ item.source_name }}</td>
                <td><span class="status" :class="item.status">{{ item.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </lay-card>
      </lay-col>
    </lay-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { layer } from '@layui/layer-vue'
import {
  fetchAdminConfig,
  updateAdminFunction,
  updateAdminFunctionAdapter,
  type AdminConfigResponse,
  type AdminFunctionAdapterConfig,
  type AdminFunctionConfig,
} from '@/api/admin'

const loading = ref(false)
const updating = ref('')
const config = reactive<AdminConfigResponse>({
  functions: [],
  sources: [],
  adapters: [],
  functionAdapters: [],
})
const functionParamDrafts = reactive<Record<string, string>>({})
const adapterPriorityDrafts = reactive<Record<string, number>>({})

function formatJsonPretty(value: Record<string, unknown>) {
  return JSON.stringify(value, null, 2)
}

function applyConfig(data: AdminConfigResponse) {
  config.functions = data.functions
  config.sources = data.sources
  config.adapters = data.adapters
  config.functionAdapters = data.functionAdapters

  for (const item of data.functions) {
    functionParamDrafts[item.id] = formatJsonPretty(item.defaultParams)
  }
  for (const item of data.functionAdapters) {
    adapterPriorityDrafts[item.id] = item.priority
  }
}

function parseJsonObject(raw: string) {
  try {
    const value = JSON.parse(raw || '{}') as unknown
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      layer.msg('默认参数必须是 JSON 对象', { icon: 2 })
      return null
    }
    return value as Record<string, unknown>
  } catch {
    layer.msg('JSON 格式不正确', { icon: 2 })
    return null
  }
}

async function loadConfig() {
  loading.value = true
  try {
    const res = await fetchAdminConfig()
    if (!res.success || !res.data) {
      layer.msg(res.msg ?? '加载配置失败', { icon: 2 })
      return
    }
    applyConfig(res.data)
  } finally {
    loading.value = false
  }
}

async function toggleFunctionStatus(item: AdminFunctionConfig) {
  updating.value = `function-status:${item.id}`
  try {
    const res = await updateAdminFunction(item.id, {
      status: item.status === 'enabled' ? 'disabled' : 'enabled',
    })
    if (res.data) applyConfig(res.data)
    layer.msg('状态已更新', { icon: 1 })
  } catch {
    // 请求层已提示错误。
  } finally {
    updating.value = ''
  }
}

async function saveFunctionParams(item: AdminFunctionConfig) {
  const defaultParams = parseJsonObject(functionParamDrafts[item.id])
  if (!defaultParams) return

  updating.value = `function-params:${item.id}`
  try {
    const res = await updateAdminFunction(item.id, { defaultParams })
    if (res.data) applyConfig(res.data)
    layer.msg('默认参数已保存', { icon: 1 })
  } catch {
    // 请求层已提示错误。
  } finally {
    updating.value = ''
  }
}

async function toggleBindingStatus(item: AdminFunctionAdapterConfig) {
  updating.value = `binding-status:${item.id}`
  try {
    const res = await updateAdminFunctionAdapter(item.id, {
      status: item.status === 'enabled' ? 'disabled' : 'enabled',
    })
    if (res.data) applyConfig(res.data)
    layer.msg('绑定状态已更新', { icon: 1 })
  } catch {
    // 请求层已提示错误。
  } finally {
    updating.value = ''
  }
}

async function saveBindingPriority(item: AdminFunctionAdapterConfig) {
  const priority = Number(adapterPriorityDrafts[item.id])
  if (!Number.isInteger(priority) || priority < 0) {
    layer.msg('优先级必须是非负整数', { icon: 2 })
    return
  }

  updating.value = `binding-priority:${item.id}`
  try {
    const res = await updateAdminFunctionAdapter(item.id, { priority })
    if (res.data) applyConfig(res.data)
    layer.msg('优先级已保存', { icon: 1 })
  } catch {
    // 请求层已提示错误。
  } finally {
    updating.value = ''
  }
}

onMounted(loadConfig)
</script>

<style scoped>
.api-dashboard {
  display: grid;
  gap: 16px;
}

.dashboard-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 28px;
  border-radius: 22px;
  background:
    radial-gradient(circle at 12% 20%, rgba(31, 157, 138, 0.2), transparent 28%),
    linear-gradient(135deg, #f7fbf8 0%, #e8f3ef 100%);
  box-shadow: 0 18px 50px rgba(22, 75, 62, 0.1);
}

.eyebrow {
  margin: 0 0 8px;
  color: #1f9d8a;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.dashboard-hero h1 {
  margin: 0;
  color: #15241f;
  font-size: 28px;
}

.hero-desc {
  margin: 10px 0 0;
  color: #5f716b;
}

.summary-grid :deep(.layui-card-body) {
  min-height: 96px;
}

.metric {
  display: block;
  color: #1f9d8a;
  font-size: 34px;
  line-height: 1;
}

.metric-tip,
.empty-tip {
  margin: 10px 0 0;
  color: #7a8a85;
  font-size: 13px;
}

.config-card {
  overflow: hidden;
}

.config-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.config-table th,
.config-table td {
  padding: 13px 12px;
  border-bottom: 1px solid rgba(31, 157, 138, 0.12);
  text-align: left;
  vertical-align: top;
}

.config-table th {
  color: #5f716b;
  font-weight: 600;
  background: rgba(31, 157, 138, 0.06);
}

.config-table p {
  margin: 4px 0 0;
  color: #7a8a85;
  font-size: 12px;
}

.config-table code {
  color: #1b6f63;
  white-space: pre-wrap;
  word-break: break-all;
}

.json-editor,
.priority-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(31, 157, 138, 0.2);
  border-radius: 10px;
  color: #18352d;
  background: rgba(255, 255, 255, 0.88);
  outline: none;
}

.json-editor {
  min-width: 220px;
  padding: 8px 10px;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.55;
  resize: vertical;
}

.priority-input {
  max-width: 90px;
  padding: 7px 9px;
}

.json-editor:focus,
.priority-input:focus {
  border-color: rgba(31, 157, 138, 0.55);
  box-shadow: 0 0 0 3px rgba(31, 157, 138, 0.12);
}

.table-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.compact th,
.compact td {
  padding: 11px 10px;
}

.status {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: 999px;
  color: #7a5c1a;
  background: #fff4d6;
  font-size: 12px;
}

.status.enabled {
  color: #167866;
  background: #dff6ef;
}

@media (max-width: 768px) {
  .dashboard-hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .config-card {
    overflow-x: auto;
  }
}
</style>
