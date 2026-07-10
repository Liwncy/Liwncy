<template>
  <lay-container fluid="true" class="admin-page">
    <lay-card class="admin-card admin-page-hero">
      <div>
        <p class="admin-page-eyebrow">API Platform</p>
        <h1>参数契约</h1>
        <p class="admin-page-desc">这里只维护公开参数定义，不处理 Route、参数映射或 Adapter 绑定。</p>
      </div>
    </lay-card>

    <lay-card class="admin-card">
      <lay-form class="admin-search-form">
        <lay-row>
          <lay-col md="6" sm="12" xs="24">
            <lay-form-item label="参数搜索" label-width="80">
              <lay-input v-model="keyword" placeholder="功能 / 参数 / 名称 / 类型" size="sm" :allow-clear="true" />
            </lay-form-item>
          </lay-col>
          <lay-col md="8" sm="12" xs="24">
            <lay-form-item label-width="20">
              <lay-button type="normal" size="sm" @click="keyword = ''">重置</lay-button>
              <lay-button type="primary" size="sm" :loading="loading" @click="loadConfig">查询</lay-button>
              <lay-button size="sm" type="primary" @click="openParamLayer()">新增参数</lay-button>
            </lay-form-item>
          </lay-col>
        </lay-row>
      </lay-form>
    </lay-card>

    <lay-card title="公开参数" class="admin-card">
      <table class="admin-table compact">
        <thead>
          <tr>
            <th>功能</th>
            <th>参数</th>
            <th>来源/类型</th>
            <th>默认值</th>
            <th>必填</th>
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
            <td>{{ item.required ? '是' : '否' }}</td>
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

  </lay-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { layer } from '@layui/layer-vue'
import {
  createAdminFunctionParam,
  updateAdminFunctionParam,
  type AdminFunctionParamConfig,
} from '@/api/admin'
import { formatValue, useAdminConfig } from './useAdminConfig'
import '@/assets/styles/admin-platform.css'

const { loading, config, applyConfig, loadConfig } = useAdminConfig()
const keyword = ref('')
const saving = ref(false)
const paramLayerVisible = ref(false)

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

async function toggleParamStatus(item: AdminFunctionParamConfig) {
  const res = await updateAdminFunctionParam(item.id, {
    status: item.status === 'enabled' ? 'disabled' : 'enabled',
  }).catch(() => null)
  if (res?.data) applyConfig(res.data)
}

onMounted(loadConfig)
</script>
