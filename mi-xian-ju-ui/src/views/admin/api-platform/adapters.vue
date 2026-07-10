<template>
  <lay-container fluid="true" class="admin-page">
    <lay-card class="admin-card admin-page-hero">
      <div>
        <p class="admin-page-eyebrow">API Platform</p>
        <h1>Adapter</h1>
        <p class="admin-page-desc">这里只维护第三方接口 Adapter，不管理平台源和响应映射。</p>
      </div>
    </lay-card>

    <lay-card class="admin-card">
      <lay-form class="admin-search-form">
        <lay-row>
          <lay-col md="6" sm="12" xs="24">
            <lay-form-item label="Adapter 搜索" label-width="90">
              <lay-input
                v-model="keyword"
                placeholder="Adapter / 方法 / 平台"
                size="sm"
                :allow-clear="true"
              />
            </lay-form-item>
          </lay-col>
          <lay-col md="6" sm="12" xs="24">
            <lay-form-item label-width="20">
              <lay-button type="normal" size="sm" @click="keyword = ''">重置</lay-button>
              <lay-button type="primary" size="sm" :loading="loading" @click="loadConfig">查询</lay-button>
              <lay-button size="sm" type="primary" @click="openAdapterLayer()">新增 Adapter</lay-button>
            </lay-form-item>
          </lay-col>
        </lay-row>
      </lay-form>
    </lay-card>

    <lay-card title="Adapter" class="admin-card">
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

  </lay-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { layer } from '@layui/layer-vue'
import {
  createAdminAdapter,
  updateAdminAdapter,
  type AdminAdapterConfig,
} from '@/api/admin'
import { useAdminConfig } from './useAdminConfig'
import '@/assets/styles/admin-platform.css'

const { loading, config, applyConfig, loadConfig } = useAdminConfig()
const keyword = ref('')
const saving = ref(false)
const adapterLayerVisible = ref(false)

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


const includesKeyword = (values: unknown[]) => {
  const normalizedKeyword = keyword.value.trim().toLowerCase()
  if (!normalizedKeyword) return true

  return values.some((value) => String(value ?? '').toLowerCase().includes(normalizedKeyword))
}

const filteredAdapters = computed(() =>
  config.adapters.filter((item) =>
    includesKeyword([item.code, item.name, item.type, item.method, item.source_name, item.status]),
  ),
)

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

async function toggleAdapterStatus(item: AdminAdapterConfig) {
  const res = await updateAdminAdapter(item.id, {
    status: item.status === 'enabled' ? 'disabled' : 'enabled',
  }).catch(() => null)
  if (res?.data) applyConfig(res.data)
}

onMounted(loadConfig)
</script>
