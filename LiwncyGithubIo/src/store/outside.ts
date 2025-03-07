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
                // console.log("weTabLogin:", data)
                axios.post("https://api.wetab.link/api/user/login", data, {
                    headers: {
                        "I-App": 'hitab',
                        "I-Version": '1.9.42',
                        "I-Platform": 'chrome',
                        "I-Branch": 'zh',
                        "I-Lang": 'zh-CN',
                        "Content-Type": 'application/json',
                    },
                    params: {
                        t: Date.now().toString()
                    }
                }).then(res => {
                    // console.log("weTab:", res.data);
                    this.weTabInfo = res.data.data;
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