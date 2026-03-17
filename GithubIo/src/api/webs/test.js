// 今日热榜API

/**
 * 获取侧边栏菜单
 * @returns {Promise<{data: *[]}>}
 */
export const getSideMenus = async () => {
  // 平台列表分类
  const menus = [
        {
            "id": "comprehensive",
            "title": "📊 综合",
            "children": [
                {
                    "id": "baidu",
                    "title": "百度",
                    "subTitle": "baidu",
                    "data": [
                        {
                            "id": "baidu_hot",
                            "name": "热榜",
                            "api": "/v2/baidu/hot"
                        },
                        {
                            "id": "baidu_tieba",
                            "name": "贴吧话题榜",
                            "api": "/v2/baidu/tieba"
                        },
                        {
                            "id": "baidu_teleplay",
                            "name": "电视剧榜",
                            "api": "/v2/baidu/teleplay"
                        }
                    ]
                },
                {
                    "id": "douyin",
                    "title": "抖音",
                    "subTitle": "douyin",
                    "data": [
                        {
                            "id": "douyin_hot",
                            "name": "热搜",
                            "api": "/v2/douyin"
                        }
                    ]
                },
                {
                    "id": "rednote",
                    "title": "小红书",
                    "subTitle": "rednote",
                    "data": [
                        {
                            "id": "rednote_hot",
                            "name": "热点",
                            "api": "/v2/rednote"
                        }
                    ]
                },
                {
                    "id": "bilibili",
                    "title": "哔哩哔哩",
                    "subTitle": "bili",
                    "data": [
                        {
                            "id": "bilibili_hot",
                            "name": "热搜",
                            "api": "/v2/bili"
                        }
                    ]
                },
                {
                    "id": "quark",
                    "title": "夸克",
                    "subTitle": "quark",
                    "data": [
                        {
                            "id": "quark_hot",
                            "name": "热点",
                            "api": "/v2/quark"
                        }
                    ]
                },
                {
                    "id": "zhihu",
                    "title": "知乎",
                    "subTitle": "zhihu",
                    "data": [
                        {
                            "id": "zhihu_topic",
                            "name": "话题",
                            "api": "/v2/zhihu"
                        }
                    ]
                },
                {
                    "id": "dongchedi",
                    "title": "懂车帝",
                    "subTitle": "dongchedi",
                    "data": [
                        {
                            "id": "dongchedi_hot",
                            "name": "热搜",
                            "api": "/v2/dongchedi"
                        }
                    ]
                }
            ]
        },
        {
            "id": "news",
            "title": "📰 新闻",
            "children": [
                {
                    "id": "weibo",
                    "title": "微博",
                    "subTitle": "weibo",
                    "data": [
                        {
                            "id": "weibo_hot",
                            "name": "微博",
                            "api": "/v2/weibo"
                        }
                    ]
                },
                {
                    "id": "toutiao",
                    "title": "头条",
                    "subTitle": "toutiao",
                    "data": [
                        {
                            "id": "toutiao_hot",
                            "name": "今日热榜",
                            "api": "/v2/toutiao"
                        }
                    ]
                },
                {
                    "id": "hacker_news",
                    "title": "Hacker News",
                    "subTitle": "hacker",
                    "data": [
                        {
                            "id": "hacker_news_top",
                            "name": "热榜",
                            "api": "/v2/hacker-news/top"
                        },
                        {
                            "id": "hacker_news_new",
                            "name": "最新",
                            "api": "/v2/hacker-news/new"
                        },
                        {
                            "id": "hacker_news_best",
                            "name": "更好",
                            "api": "/v2/hacker-news/best"
                        }
                    ]
                }
            ]
        },
        {
            "id": "entertainment",
            "title": "🎬 影视",
            "children": [
                {
                    "id": "maoyan",
                    "title": "猫眼",
                    "subTitle": "maoyan",
                    "data": [
                        {
                            "id": "maoyan_global_box_office",
                            "name": "全球票房总榜",
                            "api": "/v2/maoyan/all/movie"
                        },
                        {
                            "id": "maoyan_realtime_box_office",
                            "name": "电影实时票房",
                            "api": "/v2/maoyan/realtime/movie"
                        },
                        {
                            "id": "maoyan_tv_ratings",
                            "name": "电视收视排行",
                            "api": "/v2/maoyan/realtime/tv"
                        },
                        {
                            "id": "maoyan_web_drama_hot",
                            "name": "网剧实时热度",
                            "api": "/v2/maoyan/realtime/web"
                        }
                    ]
                }
            ]
        },
        {
            "id": "music",
            "title": "🎵 音乐",
            "children": [
                {
                    "id": "netease_cloud",
                    "title": "网易云",
                    "subTitle": "netease",
                    "data": [
                        {
                            "id": "netease_rank_list",
                            "name": "榜单列表",
                            "api": "/v2/ncm-rank/list"
                        }
                    ]
                }
            ]
        }
    ];
  
  // 模拟API请求延迟
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ 
        code: 200, 
        message: "操作成功", 
        data: menus, 
        error: null, 
        success: true 
      });
    }, 300);
  });
};

/**
 * 获取数据
 * @param platform 平台名称
 * @param page 页码
 * @returns {Promise<{data: *[]}>}
 */
export const getData = async (platform, page = 1) => {
  // 模拟热榜数据
  const mockData = [];
  for (let i = 1; i <= 20; i++) {
    mockData.push({
      rank: (page - 1) * 20 + i,
      title: `${platform}热榜第${i}名：这是一条模拟的热榜数据`,
      hotValue: Math.floor(Math.random() * 100000),
      link: `#`,
      time: new Date().toLocaleTimeString()
    });
  }
  
  // 模拟API请求延迟
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ data: mockData });
    }, 500);
  });
};
