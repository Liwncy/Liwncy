import {defineStore} from 'pinia'
import {menu, permission} from "../api/module/user";
import {getRouters, getPermission} from "@/api/menu";

export const useUserStore = defineStore({
    id: 'user',
    state: () => {
        return {
            token: '',
            userInfo: {},
            routes: [],
            permissions: [],
            menus: [],
        }
    },
    actions: {
        async loadRoutes() {
            // @ts-ignore
            const {data, code} = await getRouters();
            if (code == 200) {
                // @ts-ignore
                this.routes = data;
            }
        },
        async loadMenus() {
            const {data, code} = await menu();
            if (code == 200) {
                this.menus = data;
            }
        },
        async loadPermissions() {
            // @ts-ignore
            const {data, code} = await getPermission();
            if (code == 200) {
                // @ts-ignore
                this.permissions = data;
            }
        }
    },
    persist: {
        storage: localStorage,
        paths: ['token', 'userInfo', 'routes', 'permissions', 'menus'],
    }
})