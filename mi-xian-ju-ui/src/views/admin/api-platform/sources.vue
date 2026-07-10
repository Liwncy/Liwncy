<template>
  <lay-container fluid="true" class="admin-page">
    <lay-card class="admin-card admin-page-hero">
      <div>
        <p class="admin-page-eyebrow">Platform</p>
        <h1>平台源</h1>
        <p class="admin-page-desc">这里只维护第三方平台基础信息，包括编码、Base URL、超时和状态。</p>
      </div>
    </lay-card>

    <lay-card class="admin-card">
      <lay-form class="admin-search-form">
        <lay-row>
          <lay-col md="6" sm="12" xs="24">
            <lay-form-item label="平台搜索" label-width="90">
              <lay-input v-model="keyword" placeholder="编码 / 名称 / Base URL" size="sm" :allow-clear="true" />
            </lay-form-item>
          </lay-col>
          <lay-col md="8" sm="12" xs="24">
            <lay-form-item label-width="20">
              <lay-button type="normal" size="sm" @click="keyword = ''">重置</lay-button>
              <lay-button type="primary" size="sm" :loading="loading" @click="loadConfig">查询</lay-button>
              <lay-button size="sm" type="primary" @click="openSourceLayer()">新增平台</lay-button>
            </lay-form-item>
          </lay-col>
        </lay-row>
      </lay-form>
    </lay-card>

    <lay-card title="平台源" class="admin-card">
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
                <lay-button size="xs" border="green" @click="openSourceLayer(item)">修改</lay-button>
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
  </lay-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { layer } from '@layui/layer-vue'
import { createAdminSource, updateAdminSource, type AdminSourceConfig } from '@/api/admin'
import { useAdminConfig } from './useAdminConfig'
import '@/assets/styles/admin-platform.css'

const { loading, config, applyConfig, loadConfig } = useAdminConfig()
const keyword = ref('')
const saving = ref(false)
const sourceLayerVisible = ref(false)

const sourceForm = reactive({
  id: '',
  code: '',
  name: '',
  baseUrl: '',
  timeoutMs: 20000,
  status: 'enabled',
})

const includesKeyword = (values: unknown[]) => {
  const normalizedKeyword = keyword.value.trim().toLowerCase()
  if (!normalizedKeyword) return true
  return values.some((value) => String(value ?? '').toLowerCase().includes(normalizedKeyword))
}

const filteredSources = computed(() =>
  config.sources.filter((item) => includesKeyword([item.code, item.name, item.base_url, item.status])),
)

function openSourceLayer(item?: AdminSourceConfig) {
  sourceForm.id = item?.id ?? ''
  sourceForm.code = item?.code ?? ''
  sourceForm.name = item?.name ?? ''
  sourceForm.baseUrl = item?.base_url ?? ''
  sourceForm.timeoutMs = item?.timeout_ms ?? 20000
  sourceForm.status = item?.status ?? 'enabled'
  sourceLayerVisible.value = true
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

async function toggleSourceStatus(item: AdminSourceConfig) {
  const res = await updateAdminSource(item.id, {
    status: item.status === 'enabled' ? 'disabled' : 'enabled',
  }).catch(() => null)
  if (res?.data) applyConfig(res.data)
}

onMounted(loadConfig)
</script>
