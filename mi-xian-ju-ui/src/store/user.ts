import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '' as string,
    nickname: '管理员',
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
  },
  actions: {
    login(token: string, nickname = '管理员') {
      this.token = token
      this.nickname = nickname
    },
    logout() {
      this.token = ''
    },
  },
  persist: {
    paths: ['token', 'nickname'],
  },
})
