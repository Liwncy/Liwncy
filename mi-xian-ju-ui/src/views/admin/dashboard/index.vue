<template>
  <div class="admin-page">
    <lay-row space="10">
      <lay-col md="8" sm="12" xs="24">
        <lay-card title="快捷方式" class="admin-card">
          <div class="admin-shortcut-grid">
            <router-link class="admin-shortcut" to="/admin/api/functions">
              <i class="layui-icon layui-icon-app"></i>
              <cite>功能接口</cite>
            </router-link>
            <router-link class="admin-shortcut" to="/admin/api/contracts">
              <i class="layui-icon layui-icon-form"></i>
              <cite>参数契约</cite>
            </router-link>
            <router-link class="admin-shortcut" to="/admin/api/adapters">
              <i class="layui-icon layui-icon-set"></i>
              <cite>平台适配</cite>
            </router-link>
            <a class="admin-shortcut" @click="loadConfig">
              <i class="layui-icon layui-icon-refresh-one"></i>
              <cite>{{ loading ? '刷新中' : '刷新概览' }}</cite>
            </a>
          </div>
        </lay-card>
      </lay-col>

      <lay-col md="8" sm="12" xs="24">
        <lay-card title="平台状态" class="admin-card">
          <lay-row space="10">
            <lay-col md="12" xs="12">
              <div class="admin-agency">
                <h3>公开接口</h3>
                <p><cite>{{ config.functions.length }}</cite></p>
              </div>
            </lay-col>
            <lay-col md="12" xs="12">
              <div class="admin-agency">
                <h3>参数场景</h3>
                <p><cite>{{ config.functionRoutes.length }}</cite></p>
              </div>
            </lay-col>
            <lay-col md="12" xs="12">
              <div class="admin-agency">
                <h3>平台源</h3>
                <p><cite>{{ config.sources.length }}</cite></p>
              </div>
            </lay-col>
            <lay-col md="12" xs="12">
              <div class="admin-agency">
                <h3>Adapters</h3>
                <p><cite>{{ config.adapters.length }}</cite></p>
              </div>
            </lay-col>
          </lay-row>
        </lay-card>
      </lay-col>

      <lay-col md="8" sm="24" xs="24">
        <lay-card title="版本信息" class="admin-card">
          <table class="layui-table admin-version-table">
            <tbody>
              <tr>
                <td>平台定位</td>
                <td>芈仙居 API Platform</td>
              </tr>
              <tr>
                <td>公开入口</td>
                <td><code>/api/v1/:code</code></td>
              </tr>
              <tr>
                <td>核心能力</td>
                <td>参数契约 / Route / Adapter</td>
              </tr>
            </tbody>
          </table>
        </lay-card>
      </lay-col>

      <lay-col md="16" sm="24" xs="24">
        <lay-card title="接口概览" class="admin-card">
          <table class="admin-table compact">
            <thead>
              <tr>
                <th>Code</th>
                <th>名称</th>
                <th>方法</th>
                <th>响应类型</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in config.functions" :key="item.id">
                <td><code>{{ item.code }}</code></td>
                <td>{{ item.name }}</td>
                <td>{{ item.method }}</td>
                <td>{{ item.response_type }}</td>
                <td><span class="admin-status" :class="item.status">{{ item.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </lay-card>
      </lay-col>

      <lay-col md="8" sm="24" xs="24">
        <lay-card title="管理说明" class="admin-card">
          <p class="admin-page-tip">公开接口固定由芈仙居定义，第三方平台地址、参数映射和 fallback 优先级统一在后台维护。</p>
          <p class="admin-page-tip">当前先提供核心配置查看和启停能力，后续可继续补齐新增、编辑、删除表单。</p>
        </lay-card>
      </lay-col>
    </lay-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAdminConfig } from '@/views/admin/api-platform/useAdminConfig'
import '@/assets/styles/admin-platform.css'

const { loading, config, loadConfig } = useAdminConfig()

onMounted(loadConfig)
</script>
