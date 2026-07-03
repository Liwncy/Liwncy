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
            <td><code>{{ formatJson(item.defaultParams) }}</code></td>
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
import { fetchAdminConfig, type AdminConfigResponse } from '@/api/admin'

const loading = ref(false)
const config = reactive<AdminConfigResponse>({
  functions: [],
  sources: [],
  adapters: [],
})

function formatJson(value: Record<string, unknown>) {
  const text = JSON.stringify(value)
  return text.length > 80 ? `${text.slice(0, 80)}...` : text
}

async function loadConfig() {
  loading.value = true
  try {
    const res = await fetchAdminConfig()
    if (!res.success || !res.data) {
      layer.msg(res.msg ?? '加载配置失败', { icon: 2 })
      return
    }
    config.functions = res.data.functions
    config.sources = res.data.sources
    config.adapters = res.data.adapters
  } finally {
    loading.value = false
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
