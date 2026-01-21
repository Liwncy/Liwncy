import {defineStore} from 'pinia'

export const useArticleStore = defineStore({
    id: 'article',
    state: () => {
        return {
            articleInfo: {},
        }
    },
    actions: {
        async loadArticleInfo(dataList, curData) {
            this.articleInfo = {dataList: dataList, curData: curData};
        },
    },
    persist: {
        storage: localStorage,
        paths: ['articleInfo'],
    }
})