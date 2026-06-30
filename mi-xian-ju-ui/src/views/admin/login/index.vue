<template>
  <div class="login-page">
    <lay-card class="login-card">
      <h2>芈仙居 · 管理登录</h2>
      <p class="hint">骨架阶段：任意账号密码即可进入（后续对接 mi-xian-ju-api）</p>

      <lay-form :model="form" @submit.prevent="handleLogin">
        <lay-form-item label="账号">
          <lay-input v-model="form.username" placeholder="admin" />
        </lay-form-item>
        <lay-form-item label="密码">
          <lay-input v-model="form.password" type="password" placeholder="••••••" />
        </lay-form-item>
        <lay-form-item>
          <lay-button type="primary" fluid native-type="submit" :loading="loading">
            登录
          </lay-button>
        </lay-form-item>
      </lay-form>
    </lay-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { layer } from '@layui/layer-vue'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const form = reactive({
  username: 'admin',
  password: 'admin',
})

async function handleLogin() {
  loading.value = true
  try {
    // TODO: 对接 mi-xian-ju-api 登录接口
    userStore.login('dev-token', form.username)
    layer.msg('登录成功', { icon: 1 })
    const redirect = (route.query.redirect as string) || '/admin/dashboard'
    router.push(redirect)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 100%);
}

.login-card {
  width: 400px;
  padding: 8px;
}

.login-card h2 {
  margin: 0 0 8px;
  text-align: center;
}

.hint {
  text-align: center;
  color: #999;
  font-size: 13px;
  margin: 0 0 20px;
}
</style>
