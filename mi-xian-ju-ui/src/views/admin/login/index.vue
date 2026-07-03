<template>
  <div class="login-page">
    <lay-card class="login-card">
      <h2>芈仙居 · 管理登录</h2>
      <p class="hint">登录后可维护 API 平台接口、平台源与 adapter 配置</p>

      <lay-form :model="form" @submit="handleLogin">
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
import { loginAdmin } from '@/api/admin'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const form = reactive({
  username: 'admin',
  password: '',
})

async function handleLogin() {
  loading.value = true
  try {
    const res = await loginAdmin(form.username, form.password)
    if (!res.success || !res.data) {
      layer.msg(res.msg ?? '登录失败', { icon: 2 })
      return
    }

    userStore.login({
      token: res.data.token,
      expiresAt: res.data.expiresAt,
      userId: res.data.user.id,
      username: res.data.user.username,
      nickname: res.data.user.displayName,
    })
    layer.msg('登录成功', { icon: 1 })
    const redirect = (route.query.redirect as string) || '/admin/dashboard'
    router.push(redirect)
  } catch {
    // 请求层已经弹出错误提示，这里只负责吞掉异常，避免 Vue 报未处理错误。
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
