/**
 * 特别说明：
 * 此文件是后端“菜单管理”接口返回的数据。
 * 如果想要修改系统左侧菜单栏数据
 * 请前往`mock/_data/login.ts`文件
 * 找到`loginUserMenu`进行修改
 */

/** web顶部菜单树 */
export const topMenuTree = {
    "code": 200,
    "message": '操作成功',
    "data": [
        {
            "id": 1,
            "title": "首页",
            "useI18n": "nav.home",
            "path": "/webs/index"
        },
        {
            "id": 2,
            "title": "书签",
            "useI18n": "nav.bookMark",
            "path": "/webs/book_mark"
        },
        {
            "id": 3,
            "title": "随记",
            "useI18n": "nav.notes",
            "path": "/webs/notes"
        },
        {
            "id": 4,
            "title": "生活",
            "useI18n": "nav.life",
            "path": "/webs/life",
            "children": [
                {
                    "id": 401,
                    "title": "看新闻",
                    "useI18n": "nav.life.news",
                    "path": "/webs/hot_bans"
                },
                {
                    "id": 302,
                    "title": "最新",
                    "useI18n": "nav.life.latest",
                    "path": "/webs/life/b"
                },
                {
                    "id": 303,
                    "title": "推荐",
                    "useI18n": "nav.life.recommended",
                    "path": "/webs/life/c"
                }
            ]
        },
        {
            "id": 10,
            "title": "生态",
            "useI18n": "nav.resources",
            "path": "/webs/resources"
        }
    ],
    "error": null,
    "success": true,
}

/** 菜单树 不包含按钮 */
export const menuTreeNoButton = {
    "code": 200,
    "message": "操作成功",
    "data": [
        {
            "id": 1000,
            "title": "综合",
            "children": [
                {
                    "id": 1100,
                    "title": "百度",
                    "subTitle": "baidu",
                    "data": [
                        {"id":1101,"name":"热榜","api":"/v2/baidu/hot"},
                        {"id":1102,"name":"贴吧话题榜","api":"/v2/baidu/tieba"},
                        {"id":1103,"name":"电视剧榜","api":"/v2/baidu/teleplay"}
                    ]
                },
                {
                    "id": 1200,
                    "title": "抖音",
                    "subTitle": "douyin",
                    "data": [
                        {"id":1201,"name":"热搜","api":"/v2/douyin"}
                    ]
                },
                {
                    "id": 1300,
                    "title": "小红书",
                    "subTitle": "rednote",
                    "data": [
                        {"id":1301,"name":"热点","api":"/v2/rednote"}
                    ]
                },
                {
                    "id": 1400,
                    "title": "哔哩哔哩",
                    "subTitle": "bili",
                    "data": [
                        {"id":1301,"name":"热搜","api":"/v2/bili"}
                    ]
                },
                {
                    "id": 1500,
                    "title": "夸克",
                    "subTitle": "quark",
                    "data": [
                        {"id":1301,"name":"热点","api":"/v2/quark"}
                    ]
                },
                {
                    "id": 1600,
                    "title": "知乎",
                    "subTitle": "zhihu",
                    "data": [
                        {"id":1601,"name":"话题","api":"/v2/zhihu"}
                    ]
                },

                {
                    "id": 1900,
                    "title": "懂车帝",
                    "subTitle": "dongchedi",
                    "data": [
                        {"id":1901,"name":"热搜","api":"/v2/dongchedi"}
                    ]
                }
            ]
        },
        {
            "id": 2000,
            "title": "新闻",
            "children": [
                {
                    "id": 1700,
                    "title": "微博",
                    "subTitle": "weibo",
                    "data": [
                        {"id":1701,"name":"微博","api":"/v2/weibo"}
                    ]
                },
                {
                    "id": 1800,
                    "title": "头条",
                    "subTitle": "toutiao",
                    "data": [
                        {"id":1801,"name":"今日热榜","api":"/v2/toutiao"}
                    ]
                },
                {
                    "id": 2100,
                    "title": "Hacker News",
                    "subTitle": "hacker",
                    "data": [
                        {"id":2101,"name":"热榜","api":"/v2/hacker-news/top"},
                        {"id":2102,"name":"最新","api":"/v2/hacker-news/new"},
                        {"id":2103,"name":"更好","api":"/v2/hacker-news/best"}
                    ]
                }
            ]
        },
        {
            "id": 3000,
            "title": "影视",
            "children": [
                {
                    "id": 3100,
                    "title": "猫眼",
                    "subTitle": "maoyan",
                    "data": [
                        {"id":3101,"name":"全球票房总榜","api":"/v2/maoyan/all/movie"},
                        {"id":3101,"name":"电影实时票房","api":"/v2/maoyan/realtime/movie"},
                        {"id":3101,"name":"电视收视排行","api":"/v2/maoyan/realtime/tv"},
                        {"id":3101,"name":"网剧实时热度","api":"/v2/maoyan/realtime/web"}
                    ]
                }
            ]
        },
        {
            "id": 4000,
            "title": "音乐",
            "children":  [
                {
                    "id": 4100,
                    "title": "网易云",
                    "subTitle": "maoyan",
                    "data": [
                        {"id":4101,"name":"榜单列表","api":"/v2/ncm-rank/list"},
                        {"id":4102,"name":"榜单详情","api":"/v2/ncm-rank/{id}"}
                    ]
                }
            ]
        }
    ],
    "error": null,
    "success": true
}
