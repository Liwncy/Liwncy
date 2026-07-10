<template>
  <lay-container fluid="true" class="admin-page">
    <lay-card class="admin-card admin-page-hero">
      <div>
        <p class="admin-page-eyebrow">API Platform</p>
        <h1>{{ selectedFunction?.name || '接口详情' }}</h1>
        <p class="admin-page-desc">在这一页直接维护接口、参数、场景、绑定和响应映射。</p>
      </div>
    </lay-card>

    <lay-card class="admin-card">
      <div class="admin-toolbar">
        <lay-button size="sm" @click="router.push('/admin/api/functions')">返回主列表</lay-button>
        <lay-button size="sm" type="primary" :loading="loading" @click="loadConfig">刷新配置</lay-button>
      </div>
    </lay-card>

    <lay-card title="接口信息" class="admin-card">
      <template #extra>
        <lay-button size="sm" type="primary" @click="openFunctionLayer()">编辑接口</lay-button>
      </template>
      <table class="admin-table compact">
        <tbody>
          <tr>
            <th>Code</th>
            <td><code>{{ selectedFunction?.code || '-' }}</code></td>
            <th>名称</th>
            <td>{{ selectedFunction?.name || '-' }}</td>
          </tr>
          <tr>
            <th>方法</th>
            <td>{{ selectedFunction?.method || '-' }}</td>
            <th>响应类型</th>
            <td>{{ selectedFunction?.response_type || '-' }}</td>
          </tr>
          <tr>
            <th>状态</th>
            <td>
              <span v-if="selectedFunction" class="admin-status" :class="selectedFunction.status">
                {{ selectedFunction.status }}
              </span>
            </td>
            <th>描述</th>
            <td>{{ selectedFunction?.description || '暂无描述' }}</td>
          </tr>
        </tbody>
      </table>
    </lay-card>

    <lay-card title="请求类型" class="admin-card">
      <table class="admin-table compact">
        <thead>
          <tr>
            <th>类型</th>
            <th>平台如何处理</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>无参</td>
            <td>直接使用默认参数或固定参数发起请求</td>
            <td>适合健康检查、固定文案、固定图片</td>
          </tr>
          <tr>
            <td>Query</td>
            <td>从公开参数中取值，映射到 URL Query</td>
            <td>适合搜索、筛选、分页</td>
          </tr>
          <tr>
            <td>Path</td>
            <td>通过 URL 模板变量拼接路径</td>
            <td>适合 /api/{code}.php 这类路径占位</td>
          </tr>
          <tr>
            <td>Body</td>
            <td>根据 Adapter 的 body 类型组装 JSON / 表单 / 文本</td>
            <td>适合提交类接口和复杂结构请求</td>
          </tr>
          <tr>
            <td>Header</td>
            <td>把映射值写入请求头，或用于签名 / 鉴权</td>
            <td>适合 API Key、Bearer Token、签名串等</td>
          </tr>
          <tr>
            <td>文件上传</td>
            <td>第一版预留，不作为默认能力开放</td>
            <td>后续如有需要，再单独补 multipart 支持</td>
          </tr>
        </tbody>
      </table>
    </lay-card>

    <lay-card title="公开参数" class="admin-card">
      <template #extra>
        <lay-button size="sm" type="primary" @click="openParamLayer()">新增参数</lay-button>
      </template>
      <table class="admin-table compact">
        <thead>
          <tr>
            <th>参数</th>
            <th>来源</th>
            <th>类型</th>
            <th>必填</th>
            <th>默认值</th>
            <th>说明</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in functionParams" :key="item.id">
            <td>
              <strong>{{ item.param_key }}</strong>
              <p>{{ item.label }}</p>
            </td>
            <td>{{ item.source }}</td>
            <td>{{ item.type }}</td>
            <td>{{ item.required ? '是' : '否' }}</td>
            <td><code>{{ formatValue(item.defaultValue) }}</code></td>
            <td>{{ item.description || '-' }}</td>
            <td><span class="admin-status" :class="item.status">{{ item.status }}</span></td>
            <td>
              <div class="admin-table-actions">
                <lay-button size="xs" border="green" @click="openParamLayer(item)">修改</lay-button>
                <lay-button size="xs" type="danger" @click="deleteParam(item)">删除</lay-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <lay-empty v-if="!functionParams.length" description="当前接口暂无公开参数" />
    </lay-card>

    <lay-card title="调用场景" class="admin-card">
      <template #extra>
        <lay-button size="sm" type="primary" @click="openRouteLayer()">新增场景</lay-button>
      </template>
      <table class="admin-table compact">
        <thead>
          <tr>
            <th>场景 Key</th>
            <th>名称</th>
            <th>匹配条件</th>
            <th>默认参数</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in functionRoutes" :key="item.id">
            <td><code>{{ item.route_key }}</code></td>
            <td>{{ item.name }}</td>
            <td><code>{{ formatValue(item.match) }}</code></td>
            <td><code>{{ formatValue(item.defaultParams) }}</code></td>
            <td><span class="admin-status" :class="item.status">{{ item.status }}</span></td>
            <td>
              <div class="admin-table-actions">
                <lay-button size="xs" border="green" @click="openRouteLayer(item)">修改</lay-button>
                <lay-button size="xs" type="danger" @click="deleteRoute(item)">删除</lay-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <lay-empty v-if="!functionRoutes.length" description="当前接口暂无调用场景" />
    </lay-card>

    <lay-card title="Adapter 绑定" class="admin-card">
      <template #extra>
        <lay-button size="sm" type="primary" @click="openBindingLayer()">新增绑定</lay-button>
      </template>
      <table class="admin-table compact">
        <thead>
          <tr>
            <th>场景</th>
            <th>Adapter</th>
            <th>平台源</th>
            <th>优先级</th>
            <th>Fallback</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in functionAdapters" :key="item.id">
            <td><code>{{ item.route_key || '默认' }}</code></td>
            <td>
              <strong>{{ item.adapter_name }}</strong>
              <p><code>{{ item.adapter_code }}</code></p>
            </td>
            <td>{{ item.source_name }}</td>
            <td>{{ item.priority }}</td>
            <td>{{ item.fallback_enabled ? '开启' : '关闭' }}</td>
            <td><span class="admin-status" :class="item.status">{{ item.status }}</span></td>
            <td>
              <div class="admin-table-actions">
                <lay-button size="xs" border="green" @click="openBindingLayer(item)">修改</lay-button>
                <lay-button size="xs" type="danger" @click="deleteBinding(item)">删除</lay-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <lay-empty v-if="!functionAdapters.length" description="当前接口暂无 Adapter 绑定" />
    </lay-card>

    <lay-card title="响应映射" class="admin-card">
      <template #extra>
        <lay-button size="sm" type="primary" @click="openResponseMapLayer()">新增映射</lay-button>
      </template>
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
          <tr v-for="item in functionResponseMaps" :key="item.id">
            <td><code>{{ item.adapter_code }}</code></td>
            <td><code>{{ item.function_code || '通用' }}</code></td>
            <td><code>{{ item.data_path || '-' }}</code></td>
            <td><code>{{ item.items_path || '-' }}</code></td>
            <td><code>{{ formatValue(item.fields) }}</code></td>
            <td><span class="admin-status" :class="item.status">{{ item.status }}</span></td>
            <td>
              <div class="admin-table-actions">
                <lay-button size="xs" border="green" @click="openResponseMapLayer(item)">修改</lay-button>
                <lay-button size="xs" type="danger" @click="deleteResponseMap(item)">删除</lay-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <lay-empty v-if="!functionResponseMaps.length" description="当前接口暂无响应映射" />
    </lay-card>

    <lay-layer v-model="functionLayerVisible" title="修改接口" :area="['760px', '520px']">
      <div class="admin-layer-form">
        <lay-row space="10">
          <lay-col md="12">
            <lay-form-item label="接口编码" label-width="100">
              <input v-model="functionForm.code" class="admin-form-input" placeholder="litevideo" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="名称" label-width="100">
              <input v-model="functionForm.name" class="admin-form-input" />
            </lay-form-item>
          </lay-col>
          <lay-col md="8">
            <lay-form-item label="方法" label-width="100">
              <select v-model="functionForm.method" class="admin-form-input">
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
              <input v-model="functionForm.responseType" class="admin-form-input" placeholder="raw" />
            </lay-form-item>
          </lay-col>
          <lay-col md="8">
            <lay-form-item label="状态" label-width="100">
              <select v-model="functionForm.status" class="admin-form-input">
                <option value="enabled">enabled</option>
                <option value="disabled">disabled</option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="24">
            <lay-form-item label="描述" label-width="100">
              <input v-model="functionForm.description" class="admin-form-input" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="参数 Schema" label-width="100">
              <textarea v-model="functionForm.paramsSchemaJson" class="admin-json-editor" rows="6" spellcheck="false" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="默认参数" label-width="100">
              <textarea v-model="functionForm.defaultParamsJson" class="admin-json-editor" rows="6" spellcheck="false" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="公开接口" label-width="100">
              <select v-model="functionForm.isPublic" class="admin-form-input">
                <option :value="true">是</option>
                <option :value="false">否</option>
              </select>
            </lay-form-item>
          </lay-col>
        </lay-row>
        <div class="admin-layer-actions">
          <lay-button size="sm" type="primary" :loading="saving" @click="saveFunction">保存</lay-button>
          <lay-button size="sm" @click="functionLayerVisible = false">取消</lay-button>
        </div>
      </div>
    </lay-layer>

    <lay-layer v-model="paramLayerVisible" :title="paramForm.id ? '修改参数' : '新增参数'" :area="['760px', '560px']">
      <div class="admin-layer-form">
        <lay-row space="10">
          <lay-col md="12">
            <lay-form-item label="参数 Key" label-width="100">
              <input v-model="paramForm.paramKey" class="admin-form-input" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="名称" label-width="100">
              <input v-model="paramForm.label" class="admin-form-input" />
            </lay-form-item>
          </lay-col>
          <lay-col md="8">
            <lay-form-item label="来源" label-width="100">
              <select v-model="paramForm.source" class="admin-form-input">
                <option value="any">any</option>
                <option value="query">query</option>
                <option value="body">body</option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="8">
            <lay-form-item label="类型" label-width="100">
              <select v-model="paramForm.type" class="admin-form-input">
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="boolean">boolean</option>
                <option value="json">json</option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="8">
            <lay-form-item label="状态" label-width="100">
              <select v-model="paramForm.status" class="admin-form-input">
                <option value="enabled">enabled</option>
                <option value="disabled">disabled</option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="8">
            <lay-form-item label="必填" label-width="100">
              <select v-model="paramForm.required" class="admin-form-input">
                <option :value="true">是</option>
                <option :value="false">否</option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="8">
            <lay-form-item label="排序" label-width="100">
              <input v-model.number="paramForm.sort" class="admin-form-input" type="number" min="0" />
            </lay-form-item>
          </lay-col>
          <lay-col md="24">
            <lay-form-item label="默认值 JSON" label-width="100">
              <textarea v-model="paramForm.defaultValueJson" class="admin-json-editor" rows="4" spellcheck="false" />
            </lay-form-item>
          </lay-col>
          <lay-col md="24">
            <lay-form-item label="可选值 JSON" label-width="100">
              <textarea v-model="paramForm.allowValuesJson" class="admin-json-editor" rows="4" spellcheck="false" />
            </lay-form-item>
          </lay-col>
          <lay-col md="24">
            <lay-form-item label="说明" label-width="100">
              <input v-model="paramForm.description" class="admin-form-input" />
            </lay-form-item>
          </lay-col>
        </lay-row>
        <div class="admin-layer-actions">
          <lay-button size="sm" type="primary" :loading="saving" @click="saveParam">保存</lay-button>
          <lay-button size="sm" @click="paramLayerVisible = false">取消</lay-button>
        </div>
      </div>
    </lay-layer>

    <lay-layer v-model="routeLayerVisible" :title="routeForm.id ? '修改场景' : '新增场景'" :area="['760px', '520px']">
      <div class="admin-layer-form">
        <lay-row space="10">
          <lay-col md="12">
            <lay-form-item label="场景 Key" label-width="100">
              <input v-model="routeForm.routeKey" class="admin-form-input" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="名称" label-width="100">
              <input v-model="routeForm.name" class="admin-form-input" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="排序" label-width="100">
              <input v-model.number="routeForm.sort" class="admin-form-input" type="number" min="0" />
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="状态" label-width="100">
              <select v-model="routeForm.status" class="admin-form-input">
                <option value="enabled">enabled</option>
                <option value="disabled">disabled</option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="24">
            <lay-form-item label="匹配条件 JSON" label-width="100">
              <textarea v-model="routeForm.matchJson" class="admin-json-editor" rows="5" spellcheck="false" />
            </lay-form-item>
          </lay-col>
          <lay-col md="24">
            <lay-form-item label="默认参数 JSON" label-width="100">
              <textarea v-model="routeForm.defaultParamsJson" class="admin-json-editor" rows="5" spellcheck="false" />
            </lay-form-item>
          </lay-col>
        </lay-row>
        <div class="admin-layer-actions">
          <lay-button size="sm" type="primary" :loading="saving" @click="saveRoute">保存</lay-button>
          <lay-button size="sm" @click="routeLayerVisible = false">取消</lay-button>
        </div>
      </div>
    </lay-layer>

    <lay-layer v-model="bindingLayerVisible" :title="bindingForm.id ? '修改绑定' : '新增绑定'" :area="['820px', '620px']">
      <div class="admin-layer-form">
        <lay-row space="10">
          <lay-col md="12">
            <lay-form-item label="Adapter" label-width="100">
              <select v-model="bindingForm.adapterId" class="admin-form-input">
                <option value="">请选择</option>
                <option v-for="adapter in config.adapters" :key="adapter.id" :value="adapter.id">
                  {{ adapter.name }}({{ adapter.code }})
                </option>
              </select>
            </lay-form-item>
          </lay-col>
          <lay-col md="12">
            <lay-form-item label="场景" label-width="100">
              <select v-model="bindingForm.routeId" class="admin-form-input">
                <option value="">默认</option>
                <option v-for="item in functionRoutes" :key="item.id" :value="item.id">
                  {{ item.name }}({{ item.route_key }})
                </option>
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
              <input v-model.number="bindingForm.weight" class="admin-form-input" type="number" min="0" />
            </lay-form-item>
          </lay-col>
          <lay-col md="8">
            <lay-form-item label="状态" label-width="100">
              <select v-model="bindingForm.status" class="admin-form-input">
                <option value="enabled">enabled</option>
                <option value="disabled">disabled</option>
              </select>
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
          <lay-col md="24">
            <lay-form-item label="默认参数 JSON" label-width="100">
              <textarea v-model="bindingForm.defaultParamsJson" class="admin-json-editor" rows="5" spellcheck="false" />
            </lay-form-item>
          </lay-col>
          <lay-col md="24">
            <lay-form-item label="固定参数 JSON" label-width="100">
              <textarea v-model="bindingForm.fixedParamsJson" class="admin-json-editor" rows="5" spellcheck="false" />
            </lay-form-item>
          </lay-col>
        </lay-row>
        <div class="admin-layer-actions">
          <lay-button size="sm" type="primary" :loading="saving" @click="saveBinding">保存</lay-button>
          <lay-button size="sm" @click="bindingLayerVisible = false">取消</lay-button>
        </div>
      </div>
    </lay-layer>

    <lay-layer
      v-model="responseMapLayerVisible"
      :title="responseMapForm.id ? '修改映射' : '新增映射'"
      :area="['760px', '540px']"
    >
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
              <textarea v-model="responseMapForm.fieldsJson" class="admin-json-editor" rows="6" spellcheck="false" />
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
import { useRoute, useRouter } from 'vue-router'
import { layer } from '@layui/layer-vue'
import {
  createAdminFunctionAdapter,
  createAdminFunctionParam,
  createAdminFunctionRoute,
  createAdminResponseMap,
  deleteAdminFunctionParam,
  deleteAdminFunctionRoute,
  deleteAdminFunctionAdapter,
  deleteAdminResponseMap,
  updateAdminFunction,
  updateAdminFunctionParam,
  updateAdminFunctionRoute,
  updateAdminFunctionAdapter,
  updateAdminResponseMap,
  type AdminFunctionConfig,
  type AdminFunctionParamConfig,
  type AdminFunctionRouteConfig,
  type AdminFunctionAdapterConfig,
  type AdminResponseMapConfig,
} from '@/api/admin'
import { formatValue, useAdminConfig } from './useAdminConfig'
import '@/assets/styles/admin-platform.css'

const route = useRoute()
const router = useRouter()
const { loading, config, loadConfig, applyConfig } = useAdminConfig()

const functionId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))
const selectedFunction = computed(
  () => config.functions.find((item) => item.id === functionId.value) ?? null,
)
const functionParams = computed(() =>
  config.functionParams.filter((item) => item.function_id === functionId.value),
)
const functionRoutes = computed(() =>
  config.functionRoutes.filter((item) => item.function_id === functionId.value),
)
const functionAdapters = computed(() =>
  config.functionAdapters.filter((item) => item.function_id === functionId.value),
)
const functionResponseMaps = computed(() =>
  config.responseMaps.filter((item) => item.function_id === functionId.value || item.function_id === null),
)

const saving = ref(false)
const functionLayerVisible = ref(false)
const paramLayerVisible = ref(false)
const routeLayerVisible = ref(false)
const bindingLayerVisible = ref(false)
const responseMapLayerVisible = ref(false)

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

const paramForm = reactive({
  id: '',
  paramKey: '',
  label: '',
  source: 'any',
  type: 'string',
  required: true,
  defaultValueJson: '',
  allowValuesJson: '[]',
  description: '',
  sort: 100,
  status: 'enabled',
})

const routeForm = reactive({
  id: '',
  routeKey: '',
  name: '',
  matchJson: '{}',
  defaultParamsJson: '{}',
  sort: 100,
  status: 'enabled',
})

const bindingForm = reactive({
  id: '',
  adapterId: '',
  routeId: '',
  priority: 100,
  weight: 1,
  fallbackEnabled: true,
  defaultParamsJson: '{}',
  fixedParamsJson: '{}',
  status: 'enabled',
})

const responseMapForm = reactive({
  id: '',
  adapterId: '',
  functionId: '',
  dataPath: '',
  itemsPath: '',
  fieldsJson: '{}',
  status: 'enabled',
})

function parseJsonAny(raw: string, label: string, fallback: unknown = null) {
  const text = raw.trim()
  if (!text) return fallback
  try {
    return JSON.parse(text) as unknown
  } catch {
    layer.msg(`${label}格式不正确`, { icon: 2 })
    return undefined
  }
}

function parseJsonObject(raw: string, label: string, fallback: Record<string, unknown> = {}) {
  const value = parseJsonAny(raw, label, fallback)
  if (value === undefined) return undefined
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    layer.msg(`${label}必须是 JSON 对象`, { icon: 2 })
    return undefined
  }
  return value as Record<string, unknown>
}

function parseJsonArray(raw: string, label: string, fallback: unknown[] = []) {
  const value = parseJsonAny(raw, label, fallback)
  if (value === undefined) return undefined
  if (!Array.isArray(value)) {
    layer.msg(`${label}必须是 JSON 数组`, { icon: 2 })
    return undefined
  }
  return value
}

function initFunctionForm(item: AdminFunctionConfig | null) {
  functionForm.id = item?.id ?? ''
  functionForm.code = item?.code ?? ''
  functionForm.name = item?.name ?? ''
  functionForm.method = item?.method ?? 'GET'
  functionForm.responseType = item?.response_type ?? 'raw'
  functionForm.description = item?.description ?? ''
  functionForm.paramsSchemaJson = item?.paramsSchema ? JSON.stringify(item.paramsSchema, null, 2) : ''
  functionForm.defaultParamsJson = JSON.stringify(item?.defaultParams ?? {}, null, 2)
  functionForm.isPublic = item ? Boolean(item.is_public) : true
  functionForm.status = item?.status ?? 'enabled'
}

function initParamForm(item?: AdminFunctionParamConfig) {
  paramForm.id = item?.id ?? ''
  paramForm.paramKey = item?.param_key ?? ''
  paramForm.label = item?.label ?? ''
  paramForm.source = item?.source ?? 'any'
  paramForm.type = item?.type ?? 'string'
  paramForm.required = item ? Boolean(item.required) : true
  paramForm.defaultValueJson = item?.defaultValue === undefined ? '' : JSON.stringify(item.defaultValue, null, 2)
  paramForm.allowValuesJson = JSON.stringify(item?.allowValues ?? [], null, 2)
  paramForm.description = item?.description ?? ''
  paramForm.sort = item?.sort ?? 100
  paramForm.status = item?.status ?? 'enabled'
}

function initRouteForm(item?: AdminFunctionRouteConfig) {
  routeForm.id = item?.id ?? ''
  routeForm.routeKey = item?.route_key ?? ''
  routeForm.name = item?.name ?? ''
  routeForm.matchJson = JSON.stringify(item?.match ?? {}, null, 2)
  routeForm.defaultParamsJson = JSON.stringify(item?.defaultParams ?? {}, null, 2)
  routeForm.sort = item?.sort ?? 100
  routeForm.status = item?.status ?? 'enabled'
}

function initBindingForm(item?: AdminFunctionAdapterConfig) {
  bindingForm.id = item?.id ?? ''
  bindingForm.adapterId = item?.adapter_id ?? config.adapters[0]?.id ?? ''
  bindingForm.routeId = item?.route_id ?? ''
  bindingForm.priority = item?.priority ?? 100
  bindingForm.weight = item?.weight ?? 1
  bindingForm.fallbackEnabled = item ? Boolean(item.fallback_enabled) : true
  bindingForm.defaultParamsJson = JSON.stringify(item?.defaultParams ?? {}, null, 2)
  bindingForm.fixedParamsJson = JSON.stringify(item?.fixedParams ?? {}, null, 2)
  bindingForm.status = item?.status ?? 'enabled'
}

function initResponseMapForm(item?: AdminResponseMapConfig) {
  responseMapForm.id = item?.id ?? ''
  responseMapForm.adapterId = item?.adapter_id ?? config.adapters[0]?.id ?? ''
  responseMapForm.functionId = item?.function_id ?? ''
  responseMapForm.dataPath = item?.data_path ?? ''
  responseMapForm.itemsPath = item?.items_path ?? ''
  responseMapForm.fieldsJson = JSON.stringify(item?.fields ?? {}, null, 2)
  responseMapForm.status = item?.status ?? 'enabled'
}

function openFunctionLayer() {
  initFunctionForm(selectedFunction.value)
  functionLayerVisible.value = true
}

function openParamLayer(item?: AdminFunctionParamConfig) {
  if (!selectedFunction.value) {
    layer.msg('请先选择接口', { icon: 2 })
    return
  }
  initParamForm(item)
  paramLayerVisible.value = true
}

function openRouteLayer(item?: AdminFunctionRouteConfig) {
  if (!selectedFunction.value) {
    layer.msg('请先选择接口', { icon: 2 })
    return
  }
  initRouteForm(item)
  routeLayerVisible.value = true
}

function openBindingLayer(item?: AdminFunctionAdapterConfig) {
  if (!selectedFunction.value) {
    layer.msg('请先选择接口', { icon: 2 })
    return
  }
  initBindingForm(item)
  bindingLayerVisible.value = true
}

function openResponseMapLayer(item?: AdminResponseMapConfig) {
  if (!selectedFunction.value) {
    layer.msg('请先选择接口', { icon: 2 })
    return
  }
  initResponseMapForm(item)
  responseMapLayerVisible.value = true
}

async function saveFunction() {
  if (!selectedFunction.value) return
  const paramsSchemaText = functionForm.paramsSchemaJson.trim()
  const paramsSchema =
    paramsSchemaText === ''
      ? null
      : (parseJsonObject(functionForm.paramsSchemaJson, '参数 Schema') ?? undefined)
  if (paramsSchema === undefined) return
  const defaultParams = parseJsonObject(functionForm.defaultParamsJson, '默认参数')
  if (!defaultParams) return

  saving.value = true
  try {
    const res = await updateAdminFunction(selectedFunction.value.id, {
      code: functionForm.code,
      name: functionForm.name,
      method: functionForm.method,
      responseType: functionForm.responseType,
      description: functionForm.description,
      paramsSchema,
      defaultParams,
      isPublic: functionForm.isPublic,
      status: functionForm.status,
    })
    if (res.data) applyConfig(res.data)
    functionLayerVisible.value = false
    layer.msg('接口信息已保存', { icon: 1 })
  } finally {
    saving.value = false
  }
}

async function saveParam() {
  if (!selectedFunction.value) return
  const defaultValue = parseJsonAny(paramForm.defaultValueJson, '默认值')
  if (defaultValue === undefined && paramForm.defaultValueJson.trim()) return
  const allowValues = parseJsonArray(paramForm.allowValuesJson, '可选值')
  if (!allowValues) return

  saving.value = true
  try {
    const payload = {
      functionId: selectedFunction.value.id,
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
    layer.msg('参数已保存', { icon: 1 })
  } finally {
    saving.value = false
  }
}

async function saveRoute() {
  if (!selectedFunction.value) return
  const match = parseJsonObject(routeForm.matchJson, '匹配条件')
  if (!match) return
  const defaultParams = parseJsonObject(routeForm.defaultParamsJson, '默认参数')
  if (!defaultParams) return

  saving.value = true
  try {
    const payload = {
      functionId: selectedFunction.value.id,
      routeKey: routeForm.routeKey,
      name: routeForm.name,
      match,
      defaultParams,
      sort: routeForm.sort,
      status: routeForm.status,
    }
    const res = routeForm.id
      ? await updateAdminFunctionRoute(routeForm.id, payload)
      : await createAdminFunctionRoute(payload)
    if (res.data) applyConfig(res.data)
    routeLayerVisible.value = false
    layer.msg('场景已保存', { icon: 1 })
  } finally {
    saving.value = false
  }
}

async function saveBinding() {
  if (!selectedFunction.value) return
  const defaultParams = parseJsonObject(bindingForm.defaultParamsJson, '默认参数')
  if (!defaultParams) return
  const fixedParams = parseJsonObject(bindingForm.fixedParamsJson, '固定参数')
  if (!fixedParams) return

  saving.value = true
  try {
    const payload = {
      functionId: selectedFunction.value.id,
      adapterId: bindingForm.adapterId,
      routeId: bindingForm.routeId || null,
      priority: bindingForm.priority,
      weight: bindingForm.weight,
      fallbackEnabled: bindingForm.fallbackEnabled,
      defaultParams,
      fixedParams,
      status: bindingForm.status,
    }
    const res = bindingForm.id
      ? await updateAdminFunctionAdapter(bindingForm.id, payload)
      : await createAdminFunctionAdapter(payload)
    if (res.data) applyConfig(res.data)
    bindingLayerVisible.value = false
    layer.msg('绑定已保存', { icon: 1 })
  } finally {
    saving.value = false
  }
}

async function saveResponseMap() {
  if (!selectedFunction.value) return
  const fields = parseJsonObject(responseMapForm.fieldsJson, '字段映射')
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
  } finally {
    saving.value = false
  }
}

async function deleteParam(item: AdminFunctionParamConfig) {
  if (!window.confirm(`确认删除参数 ${item.param_key} 吗？`)) return
  const res = await deleteAdminFunctionParam(item.id)
  if (res.data) applyConfig(res.data)
}

async function deleteRoute(item: AdminFunctionRouteConfig) {
  if (!window.confirm(`确认删除场景 ${item.route_key} 吗？`)) return
  const res = await deleteAdminFunctionRoute(item.id)
  if (res.data) applyConfig(res.data)
}

async function deleteBinding(item: AdminFunctionAdapterConfig) {
  if (!window.confirm(`确认删除绑定 ${item.adapter_name} 吗？`)) return
  const res = await deleteAdminFunctionAdapter(item.id)
  if (res.data) applyConfig(res.data)
}

async function deleteResponseMap(item: AdminResponseMapConfig) {
  if (!window.confirm(`确认删除响应映射 ${item.adapter_code} 吗？`)) return
  const res = await deleteAdminResponseMap(item.id)
  if (res.data) applyConfig(res.data)
}

onMounted(loadConfig)
</script>
