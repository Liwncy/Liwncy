import {defineFakeRoute} from 'vite-plugin-fake-server/client'
import type {FakeRoute, ProcessedRequest} from 'vite-plugin-fake-server'
import {checkFailure, getRequestToken, resultError, resultOk} from '../util'
import {topMenuTree} from '~/mock/data/webs/layout/topMenu'

/** 获取web顶部菜单 */
function getWebTopMenuApi(): FakeRoute {
    return {
        url: '/mock-api/webs/layout/topMenu',
        method: 'get',
        response: (request: ProcessedRequest) => {
            // 获取请求参数
            const body = request.body
            // 返回值
            return resultOk<any[]>(
                topMenuTree.data as unknown as any[],
            )
        },
    }
}

export default defineFakeRoute([
    getWebTopMenuApi()
])
