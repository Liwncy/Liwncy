<template>
  <lay-container fluid="true" class="admin-page">
    <lay-card class="admin-card admin-page-hero">
      <div>
        <p class="admin-page-eyebrow">API Platform</p>
        <h1>Adapter 绑定</h1>
        <p class="admin-page-desc">这里只维护功能接口、Route 与 Adapter 的绑定关系、优先级和 fallback。</p>
      </div>
    </lay-card>

    <lay-card class="admin-card">
      <lay-form class="admin-search-form">
        <lay-row>
          <lay-col md="6" sm="12" xs="24">
            <lay-form-item label="绑定搜索" label-width="90">
              <lay-input v-model="keyword" placeholder="功能 / Route / Adapter / 平台" size="sm" :allow-clear="true" />
            </lay-form-item>
          </lay-col>
          <lay-col md="8" sm="12" xs="24">
            <lay-form-item label-width="20">
              <lay-button type="normal" size="sm" @click="keyword = ''">重置</lay-button>
              <lay-button type="primary" size="sm" :loading="loading" @click="loadConfig">查询</lay-button>
              <lay-button size="sm" type="primary" @click="openBindingLayer()">新增绑定</lay-button>
            </lay-form-item>
          </lay-col>
        </lay-row>
      </lay-form>
    </lay-card>

    <lay-card title="Adapter 绑定" class="admin-card">
      <table class="admin-table compact">
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
          <tr v-for="item in filteredBindings" :key="item.id">
            <td><code>{{ item.function_code }}</code></td>
            <td><code>{{ item.route_key || '未绑定' }}</code></td>
            <td>
              <strong>{{ item.adapter_name }}</strong>
              <p><code>{{ item.adapter_code }}</code></p>
            </td>
            <td>{{ item.source_name }}</td>
            <td>
              <input v-model.number="adapterPriorityDrafts[item.id]" class="admin-priority-input" type="number" min="0" />
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
                <lay-button size="xs" border="green" @click="openBindingLayer(item)">修改</lay-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </lay-card>

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
  createAdminFunctionAdapter,
  updateAdminFunctionAdapter,
  type AdminFunctionAdapterConfig,
} from '@/api/admin'
import { useAdminConfig } from './useAdminConfig'
import '@/assets/styles/admin-platform.css'

const {
  loading,
  updating,
  config,
  applyConfig,
  adapterPriorityDrafts,
  loadConfig,
  toggleBindingStatus,
  saveBindingPriority,
} = useAdminConfig()

const keyword = ref('')
const saving = ref(false)
const bindingLayerVisible = ref(false)

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

const includesKeyword = (values: unknown[]) => {
  const normalizedKeyword = keyword.value.trim().toLowerCase()
  if (!normalizedKeyword) return true
  return values.some((value) => String(value ?? '').toLowerCase().includes(normalizedKeyword))
}

const filteredBindings = computed(() =>
  config.functionAdapters.filter((item) =>
    includesKeyword([item.function_code, item.route_key, item.adapter_code, item.adapter_name, item.source_name]),
  ),
)

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
