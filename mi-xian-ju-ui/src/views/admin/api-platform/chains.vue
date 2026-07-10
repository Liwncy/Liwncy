<template>
  <lay-container fluid="true" class="admin-page">
    <lay-card class="admin-card admin-page-hero">
      <div>
        <p class="admin-page-eyebrow">API Platform</p>
        <h1>执行链</h1>
        <p class="admin-page-desc">这里把基础配置串成真正的运行步骤，API 调用会优先按启用的默认链执行。</p>
      </div>
    </lay-card>

    <lay-card class="admin-card">
      <lay-form class="admin-search-form">
        <lay-row>
          <lay-col md="6" sm="12" xs="24">
            <lay-form-item label="所属 API" label-width="90">
              <select v-model="selectedFunctionId" class="admin-form-input">
                <option value="">全部 API</option>
                <option v-for="item in config.functions" :key="item.id" :value="item.id">
                  {{ item.name }}({{ item.code }})
                </option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="8" sm="12" xs="24">
            <lay-form-item label-width="20">
              <lay-button type="normal" size="sm" @click="selectedFunctionId = ''">重置</lay-button>
              <lay-button type="primary" size="sm" :loading="loading" @click="loadConfig">刷新</lay-button>
              <lay-button size="sm" type="primary" @click="openChainLayer()">新增执行链</lay-button>
              <lay-button size="sm" @click="openStepLayer()">新增步骤</lay-button>
            </lay-form-item>
          </lay-col>
        </lay-row>
      </lay-form>
    </lay-card>

    <lay-card title="执行链" class="admin-card">
      <table class="admin-table compact">
        <thead>
          <tr>
            <th>所属 API</th>
            <th>链</th>
            <th>默认</th>
            <th>排序</th>
            <th>步骤数</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in filteredChains"
            :key="item.id"
            :class="{ active: item.id === selectedChainId }"
            @click="selectedChainId = item.id"
          >
            <td>
              <strong>{{ item.function_name }}</strong>
              <p><code>{{ item.function_code }}</code></p>
            </td>
            <td>
              <strong>{{ item.name }}</strong>
              <p><code>{{ item.code }}</code></p>
            </td>
            <td>{{ item.is_default ? '是' : '否' }}</td>
            <td>{{ item.sort }}</td>
            <td>{{ getStepCount(item.id) }}</td>
            <td><span class="admin-status" :class="item.status">{{ item.status }}</span></td>
            <td>
              <div class="admin-table-actions">
                <lay-button size="xs" border="green" @click.stop="openChainLayer(item)">修改</lay-button>
                <lay-button
                  size="xs"
                  :type="item.status === 'enabled' ? 'warm' : 'primary'"
                  @click.stop="toggleChainStatus(item)"
                >
                  {{ item.status === 'enabled' ? '停用' : '启用' }}
                </lay-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </lay-card>

    <lay-card title="链步骤" class="admin-card">
      <template #extra>
        <span class="admin-card-extra">{{ selectedChain?.name || '请先选择执行链' }}</span>
      </template>
      <table class="admin-table compact">
        <thead>
          <tr>
            <th>排序</th>
            <th>步骤</th>
            <th>类型</th>
            <th>配置</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in selectedSteps" :key="item.id">
            <td>{{ item.sort }}</td>
            <td>
              <strong>{{ item.name }}</strong>
              <p><code>{{ item.step_key }}</code></p>
            </td>
            <td><code>{{ item.type }}</code></td>
            <td><code>{{ formatValue(item.config) }}</code></td>
            <td><span class="admin-status" :class="item.status">{{ item.status }}</span></td>
            <td>
              <div class="admin-table-actions">
                <lay-button size="xs" border="green" @click="openStepLayer(item)">修改</lay-button>
                <lay-button
                  size="xs"
                  :type="item.status === 'enabled' ? 'warm' : 'primary'"
                  @click="toggleStepStatus(item)"
                >
                  {{ item.status === 'enabled' ? '停用' : '启用' }}
                </lay-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <lay-empty v-if="selectedChain && !selectedSteps.length" description="当前执行链暂无步骤" />
    </lay-card>

    <lay-layer v-model="chainLayerVisible" :title="chainForm.id ? '修改执行链' : '新增执行链'" :area="['680px', '440px']">
      <div class="admin-layer-form">
        <lay-row space="10">
          <lay-col md="12">
            <lay-form-item label="所属 API" label-width="90">
              <select v-model="chainForm.functionId" class="admin-form-input">
                <option value="">请选择</option>
                <option v-for="item in config.functions" :key="item.id" :value="item.id">
                  {{ item.name }}({{ item.code }})
                </option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="链编码" label-width="90">
              <input v-model="chainForm.code" class="admin-form-input" placeholder="default" />
            </lay-form-item>
          </lay-col>
          <lay-col md="24">
            <lay-form-item label="名称" label-width="90">
              <input v-model="chainForm.name" class="admin-form-input" />
            </lay-form-item>
          </lay-col>
          <lay-col md="24">
            <lay-form-item label="说明" label-width="90">
              <input v-model="chainForm.description" class="admin-form-input" />
            </lay-form-item>
          </lay-col>
          <lay-col md="8">
            <lay-form-item label="默认链" label-width="90">
              <select v-model="chainForm.isDefault" class="admin-form-input">
                <option :value="true">是</option>
                <option :value="false">否</option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="8">
            <lay-form-item label="排序" label-width="90">
              <input v-model.number="chainForm.sort" class="admin-form-input" type="number" min="0" />
            </lay-form-item>
          </lay-col>
          <lay-col md="8">
            <lay-form-item label="状态" label-width="90">
              <select v-model="chainForm.status" class="admin-form-input">
                <option value="enabled">enabled</option>
                <option value="disabled">disabled</option>
              </select>
            </lay-form-item>
          </lay-col>
        </lay-row>
        <div class="admin-layer-actions">
          <lay-button size="sm" type="primary" :loading="saving" @click="saveChain">保存</lay-button>
          <lay-button size="sm" @click="chainLayerVisible = false">取消</lay-button>
        </div>
      </div>
    </lay-layer>

    <lay-layer v-model="stepLayerVisible" :title="stepForm.id ? '修改链步骤' : '新增链步骤'" :area="['760px', '560px']">
      <div class="admin-layer-form">
        <lay-row space="10">
          <lay-col md="12">
            <lay-form-item label="执行链" label-width="90">
              <select v-model="stepForm.chainId" class="admin-form-input">
                <option value="">请选择</option>
                <option v-for="item in config.chains" :key="item.id" :value="item.id">
                  {{ item.function_code }} / {{ item.name }}
                </option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="步骤类型" label-width="90">
              <select v-model="stepForm.type" class="admin-form-input">
                <option v-for="item in stepTypes" :key="item" :value="item">{{ item }}</option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="步骤编码" label-width="90">
              <input v-model="stepForm.stepKey" class="admin-form-input" placeholder="normalize-params" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="名称" label-width="90">
              <input v-model="stepForm.name" class="admin-form-input" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="排序" label-width="90">
              <input v-model.number="stepForm.sort" class="admin-form-input" type="number" min="0" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="状态" label-width="90">
              <select v-model="stepForm.status" class="admin-form-input">
                <option value="enabled">enabled</option>
                <option value="disabled">disabled</option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="24">
            <lay-form-item label="配置 JSON" label-width="90">
              <textarea v-model="stepForm.configJson" class="admin-json-editor" rows="8" spellcheck="false" />
            </lay-form-item>
          </lay-col>
        </lay-row>
        <div class="admin-layer-actions">
          <lay-button size="sm" type="primary" :loading="saving" @click="saveStep">保存</lay-button>
          <lay-button size="sm" @click="stepLayerVisible = false">取消</lay-button>
        </div>
      </div>
    </lay-layer>
  </lay-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { layer } from '@layui/layer-vue'
import {
  createAdminChain,
  createAdminChainStep,
  updateAdminChain,
  updateAdminChainStep,
  type AdminChainConfig,
  type AdminChainStepConfig,
} from '@/api/admin'
import { formatValue, useAdminConfig } from './useAdminConfig'
import '@/assets/styles/admin-platform.css'

const stepTypes = [
  'normalize_params',
  'match_route',
  'map_request',
  'call_adapter',
  'map_response',
  'normalize_response',
]

const { loading, config, applyConfig, loadConfig } = useAdminConfig()
const saving = ref(false)
const selectedFunctionId = ref('')
const selectedChainId = ref('')
const chainLayerVisible = ref(false)
const stepLayerVisible = ref(false)

const chainForm = reactive({
  id: '',
  functionId: '',
  code: 'default',
  name: '',
  description: '',
  isDefault: true,
  sort: 100,
  status: 'enabled',
})

const stepForm = reactive({
  id: '',
  chainId: '',
  stepKey: '',
  type: 'normalize_params',
  name: '',
  configJson: '{}',
  sort: 100,
  status: 'enabled',
})

const filteredChains = computed(() =>
  config.chains.filter((item) => !selectedFunctionId.value || item.function_id === selectedFunctionId.value),
)

const selectedChain = computed(() => config.chains.find((item) => item.id === selectedChainId.value) ?? null)

const selectedSteps = computed(() =>
  selectedChainId.value
    ? config.chainSteps
        .filter((item) => item.chain_id === selectedChainId.value)
        .sort((left, right) => left.sort - right.sort)
    : [],
)

function getStepCount(chainId: string) {
  return config.chainSteps.filter((item) => item.chain_id === chainId).length
}

function jsonText(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2)
}

function parseJsonObject(raw: string) {
  try {
    const value = JSON.parse(raw || '{}') as unknown
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      layer.msg('配置必须是 JSON 对象', { icon: 2 })
      return null
    }
    return value as Record<string, unknown>
  } catch {
    layer.msg('配置 JSON 格式不正确', { icon: 2 })
    return null
  }
}

function openChainLayer(item?: AdminChainConfig) {
  chainForm.id = item?.id ?? ''
  chainForm.functionId = item?.function_id ?? selectedFunctionId.value ?? config.functions[0]?.id ?? ''
  chainForm.code = item?.code ?? 'default'
  chainForm.name = item?.name ?? ''
  chainForm.description = item?.description ?? ''
  chainForm.isDefault = item ? Boolean(item.is_default) : true
  chainForm.sort = item?.sort ?? 100
  chainForm.status = item?.status ?? 'enabled'
  chainLayerVisible.value = true
}

function openStepLayer(item?: AdminChainStepConfig) {
  stepForm.id = item?.id ?? ''
  stepForm.chainId = item?.chain_id ?? selectedChainId.value ?? config.chains[0]?.id ?? ''
  stepForm.stepKey = item?.step_key ?? ''
  stepForm.type = item?.type ?? 'normalize_params'
  stepForm.name = item?.name ?? ''
  stepForm.configJson = jsonText(item?.config ?? {})
  stepForm.sort = item?.sort ?? 100
  stepForm.status = item?.status ?? 'enabled'
  stepLayerVisible.value = true
}

async function saveChain() {
  saving.value = true
  try {
    const payload = {
      functionId: chainForm.functionId,
      code: chainForm.code,
      name: chainForm.name,
      description: chainForm.description,
      isDefault: chainForm.isDefault,
      sort: chainForm.sort,
      status: chainForm.status,
    }
    const res = chainForm.id
      ? await updateAdminChain(chainForm.id, payload)
      : await createAdminChain(payload)
    if (res.data) applyConfig(res.data)
    chainLayerVisible.value = false
    layer.msg('执行链已保存', { icon: 1 })
  } catch {
    // 请求层已提示错误。
  } finally {
    saving.value = false
  }
}

async function saveStep() {
  const configValue = parseJsonObject(stepForm.configJson)
  if (!configValue) return

  saving.value = true
  try {
    const payload = {
      chainId: stepForm.chainId,
      stepKey: stepForm.stepKey,
      type: stepForm.type,
      name: stepForm.name,
      config: configValue,
      sort: stepForm.sort,
      status: stepForm.status,
    }
    const res = stepForm.id
      ? await updateAdminChainStep(stepForm.id, payload)
      : await createAdminChainStep(payload)
    if (res.data) applyConfig(res.data)
    stepLayerVisible.value = false
    layer.msg('链步骤已保存', { icon: 1 })
  } catch {
    // 请求层已提示错误。
  } finally {
    saving.value = false
  }
}

async function toggleChainStatus(item: AdminChainConfig) {
  const res = await updateAdminChain(item.id, {
    status: item.status === 'enabled' ? 'disabled' : 'enabled',
  }).catch(() => null)
  if (res?.data) applyConfig(res.data)
}

async function toggleStepStatus(item: AdminChainStepConfig) {
  const res = await updateAdminChainStep(item.id, {
    status: item.status === 'enabled' ? 'disabled' : 'enabled',
  }).catch(() => null)
  if (res?.data) applyConfig(res.data)
}

onMounted(async () => {
  await loadConfig()
  selectedChainId.value = config.chains[0]?.id ?? ''
})
</script>
