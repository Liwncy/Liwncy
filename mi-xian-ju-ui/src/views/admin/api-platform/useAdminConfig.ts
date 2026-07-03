import { reactive, ref } from 'vue'
import { layer } from '@layui/layer-vue'
import {
  fetchAdminConfig,
  updateAdminFunction,
  updateAdminFunctionAdapter,
  type AdminConfigResponse,
  type AdminFunctionAdapterConfig,
  type AdminFunctionConfig,
} from '@/api/admin'

export function createEmptyAdminConfig(): AdminConfigResponse {
  return {
    functions: [],
    sources: [],
    adapters: [],
    functionAdapters: [],
    functionParams: [],
    functionRoutes: [],
    adapterParamMaps: [],
    responseMaps: [],
  }
}

export function formatJsonPretty(value: Record<string, unknown>) {
  return JSON.stringify(value, null, 2)
}

export function formatValue(value: unknown) {
  if (value === undefined || value === null) return '-'
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

export function useAdminConfig() {
  const loading = ref(false)
  const updating = ref('')
  const config = reactive<AdminConfigResponse>(createEmptyAdminConfig())
  const functionParamDrafts = reactive<Record<string, string>>({})
  const adapterPriorityDrafts = reactive<Record<string, number>>({})

  function applyConfig(data: AdminConfigResponse) {
    config.functions = data.functions
    config.sources = data.sources
    config.adapters = data.adapters
    config.functionAdapters = data.functionAdapters
    config.functionParams = data.functionParams
    config.functionRoutes = data.functionRoutes
    config.adapterParamMaps = data.adapterParamMaps
    config.responseMaps = data.responseMaps

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

  return {
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
  }
}
