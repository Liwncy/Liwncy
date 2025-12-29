/**
 * 特别说明：
 * 此文件是后端“菜单管理”接口返回的数据。
 * 如果想要修改系统左侧菜单栏数据
 * 请前往`mock/_data/login.ts`文件
 * 找到`loginUserMenu`进行修改
 */

/** web顶部菜单树 */
export const topMenuTree = {
    code: 200,
    message: '操作成功',
    data: [
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
    error: null,
    success: true,
}

/** 菜单树 不包含按钮 */
export const menuTreeNoButton = {
    code: 200,
    message: '操作成功',
    data: [

    ],
    error: null,
    success: true,
}
