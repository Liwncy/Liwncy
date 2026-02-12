import {request} from "@/utils/request";

/**
 * peark api 数据请求
 * 面向开发者的 API 服务与分发平台
 * https://api.pearktrue.cn/
 */
enum Api {
    BaseUrl = 'https://api.pearktrue.cn',
    Get = 'get',
    Post = 'post',
    Put = 'put',
    Delete = 'delete'
}

// CfGet请求
export const requestGetPearkApi = function (url: string, param: any = {}) {
    return request.request('GET', Api.BaseUrl + url, {params: param})
}

// CfPost请求
export const requestPostPearkApi = function (url: string, param: any = {}) {
    return request.request('POST', Api.BaseUrl + url, {data: param})
}

/**
 * 接口集合
 */
export const PEARK_API = {
    /**
     * AI聚合聊天 - 多模型支持流式
     * 集聚大模型AI调用，支持Stream流式输出，自定义对话内容参数（付费模型需添加Authorization: Bearer xxx请求头，xxx值在个人中心的AIToken取）默认没有传请求头的都会重定向到免费模型使用
     */
    AI_CHAT: '/api/aichat',
    /**
     * 今日热榜 - 聚合接口
     * 查看各大榜单的今日热榜排行，不传入任何参数将返回平台列表（ 36氪, 51CTO, 吾爱破解, AcFun, 百度, 哔哩哔哩, 酷安, CSDN, 数字尾巴, 豆瓣讨论, 豆瓣电影, 抖音, 极客公园, 原神, 果壳, HelloGitHub, 历史上的今天, 崩坏3, 虎扑, 虎嗅, 爱范儿, IT之家「喜加一」, IT之家, 简书, 稀土掘金, 英雄联盟, 米游社 · 崩坏3, 网易新闻, 水木社区, NGA, 腾讯新闻, 新浪新闻, 新浪网, 什么值得买, 少数派, 崩坏：星穹铁道, 澎湃新闻, 百度贴吧, 今日头条, 中央气象台, 微博, 微信读书, 游研社, 知乎, 知乎日报）
     */
    DAILY_HOT: '/api/dailyhot',



};