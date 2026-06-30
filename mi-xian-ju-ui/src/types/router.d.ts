import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requireAuth?: boolean
    guest?: boolean
    fullBleed?: boolean
    placeholder?: string
  }
}

export {}
