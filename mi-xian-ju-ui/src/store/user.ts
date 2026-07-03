import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '' as string,
    userId: '' as string,
    username: '' as string,
    nickname: '管理员',
    expiresAt: '' as string,
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token && state.expiresAt && new Date(state.expiresAt).getTime() > Date.now()),
  },
  actions: {
    login(payload: { token: string; expiresAt: string; userId: string; username: string; nickname: string }) {
      this.token = payload.token
      this.expiresAt = payload.expiresAt
      this.userId = payload.userId
      this.username = payload.username
      this.nickname = payload.nickname || payload.username || '管理员'
    },
    logout() {
      this.token = ''
      this.userId = ''
      this.username = ''
      this.nickname = '管理员'
      this.expiresAt = ''
    },
  },
  persist: {
    paths: ['token', 'userId', 'username', 'nickname', 'expiresAt'],
  },
})
