<template>
  <lay-container fluid="true" class="admin-page">
    <lay-card class="admin-card admin-page-hero">
      <div>
        <p class="admin-page-eyebrow">Platform</p>
        <h1>响应映射</h1>
        <p class="admin-page-desc">这里只维护 Adapter 响应结构到统一返回字段的映射关系。</p>
      </div>
    </lay-card>

    <lay-card class="admin-card">
      <lay-form class="admin-search-form">
        <lay-row>
          <lay-col md="6" sm="12" xs="24">
            <lay-form-item label="映射搜索" label-width="90">
              <lay-input v-model="keyword" placeholder="Adapter / 功能 / Path" size="sm" :allow-clear="true" />
            </lay-form-item>
          </lay-col>
          <lay-col md="8" sm="12" xs="24">
            <lay-form-item label-width="20">
              <lay-button type="normal" size="sm" @click="keyword = ''">重置</lay-button>
              <lay-button type="primary" size="sm" :loading="loading" @click="loadConfig">查询</lay-button>
              <lay-button size="sm" type="primary" @click="openResponseMapLayer()">新增映射</lay-button>
            </lay-form-item>
          </lay-col>
        </lay-row>
      </lay-form>
    </lay-card>

    <lay-card title="响应映射" class="admin-card">
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
                <lay-button size="xs" border="green" @click="openResponseMapLayer(item)">修改</lay-button>
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
import { createAdminResponseMap, updateAdminResponseMap, type AdminResponseMapConfig } from '@/api/admin'
import { useAdminConfig } from './useAdminConfig'
import '@/assets/styles/admin-platform.css'

const { loading, config, applyConfig, loadConfig } = useAdminConfig()
const keyword = ref('')
const saving = ref(false)
const responseMapLayerVisible = ref(false)

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

async function toggleResponseMapStatus(item: AdminResponseMapConfig) {
  const res = await updateAdminResponseMap(item.id, {
    status: item.status === 'enabled' ? 'disabled' : 'enabled',
  }).catch(() => null)
  if (res?.data) applyConfig(res.data)
}

onMounted(loadConfig)
</script>
