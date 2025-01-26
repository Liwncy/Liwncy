import {defineStore} from 'pinia'
import {getWeTabLoginInfo} from "@/api/common/secret";
import axios from "axios";

export const outsideStore = defineStore({
    id: 'outside',
    state: () => {
        return {
            weTabInfo: {},
        }
    },
    actions: {
        async loadWeTabInfo() {
            const {data, code} = await getWeTabLoginInfo();
            if (code == 200) {
                console.log("weTabLogin:",data)
                axios.defaults.headers.post['Content-Type'] = 'application/json';
                axios.post("https://api.wetab.link/api/user/login", {"email":"liwncy@qq.com","password":"7093baf2900024eef3497b657b9f2f01"},{
                    headers: {
                        "I-App": 'hitab',
                        "I-Version": '1.9.42',
                        "I-Platform": 'chrome',
                        "I-Branch": 'zh',
                        "I-Lang": 'zh-CN',
                        "Content-Type": 'application/json',
                    }
                }).then(res => {
                    console.log("weTab:",res.data);
                    this.weTabInfo = res.data;
                }).catch(() => {
                })
            }
        },
    },
    persist: {
        storage: localStorage,
        paths: ['weTabInfo'],
    }
})