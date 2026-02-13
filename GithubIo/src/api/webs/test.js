// 今日热榜API

/**
 * 获取侧边栏菜单
 * @returns {Promise<{data: *[]}>}
 */
export const getSideMenus = async () => {
  // 平台列表分类
  const menus = [
      {
          "id": "girls-recommended",
          "title": "🏆 推荐系列",
          "description": "推荐和热门的小姐姐视频",
          "children": [
              {
                  "id": "zzxjj-video",
                  "title": "站长推荐",
                  "description": "全网极高质量的视频，响应速度极快",
                  "subTitle": "zzxjj",
                  "data": {
                      "id": "zzxjj-video-api",
                      "name": "小姐姐随机视频",
                      "api": "/api/zzxjj.php"
                  }
              },
              {
                  "id": "xj-video",
                  "title": "小姐姐视频",
                  "description": "此接口比较稳定，视频大约6000，持续添加",
                  "subTitle": "xjj",
                  "data": {
                      "id": "xj-video-api",
                      "name": "小姐姐视频",
                      "api": "/api/xjj.php"
                  }
              },
              {
                  "id": "juhe-xjj",
                  "title": "各类小姐姐",
                  "description": "此站所有小姐姐类资源视频，随机输出各种类型",
                  "subTitle": "juhexjj",
                  "data": {
                      "id": "juhe-xjj-api",
                      "name": "各类小姐姐视频",
                      "api": "/api/juhexjj.php"
                  }
              }
          ]
      },
      {
          "id": "girls-pure",
          "title": "👸 清纯小姐姐",
          "description": "清纯风格的小姐姐视频",
          "children": [
              {
                  "id": "pure-girls",
                  "title": "清纯系列",
                  "description": "清纯系列（超高质量）",
                  "subTitle": "qingchun",
                  "data": {
                      "id": "pure-girls-api",
                      "name": "清纯系列视频",
                      "api": "/api/qingchun.php"
                  }
              },
              {
                  "id": "sweet-girls",
                  "title": "甜妹系列",
                  "description": "返回甜妹视频，实时更新",
                  "subTitle": "tianmei",
                  "data": {
                      "id": "sweet-girls-api",
                      "name": "甜妹系列视频",
                      "api": "/api/tianmei.php"
                  }
              },
              {
                  "id": "loli-video",
                  "title": "萝莉系列",
                  "description": "全是高质量萝莉系列视频",
                  "subTitle": "luoli",
                  "data": {
                      "id": "loli-video-api",
                      "name": "萝莉系列视频",
                      "api": "/api/luoli.php"
                  }
              }
          ]
      },
      {
          "id": "girls-cute",
          "title": "🎀 可爱小姐姐",
          "description": "可爱风格的小姐姐视频",
          "children": [
              {
                  "id": "face-video",
                  "title": "怼脸自拍",
                  "description": "返回怼脸自拍系列视频",
                  "subTitle": "duilian",
                  "data": {
                      "id": "face-video-api",
                      "name": "怼脸自拍视频",
                      "api": "/api/duilian.php"
                  }
              },
              {
                  "id": "jk-video",
                  "title": "JK洛丽塔",
                  "description": "随机返回jk、洛丽塔、裙子之类的视频",
                  "subTitle": "jksp",
                  "data": {
                      "id": "jk-video-api",
                      "name": "JK洛丽塔视频",
                      "api": "/api/jksp.php"
                  }
              }
          ]
      },
      {
          "id": "girls-sexy",
          "title": "🔥 性感小姐姐",
          "description": "性感风格的小姐姐视频",
          "children": [
              {
                  "id": "black-stockings",
                  "title": "黑丝视频",
                  "description": "随机返回黑丝视频",
                  "subTitle": "heisis",
                  "data": {
                      "id": "black-stockings-api",
                      "name": "黑丝视频",
                      "api": "/api/heisis.php"
                  }
              },
              {
                  "id": "white-stockings",
                  "title": "白丝视频",
                  "description": "返回高质量白丝视频",
                  "subTitle": "baisis",
                  "data": {
                      "id": "white-stockings-api",
                      "name": "白丝视频",
                      "api": "/api/baisis.php"
                  }
              },
              {
                  "id": "sling-video",
                  "title": "吊带系列",
                  "description": "高质量吊带系列视频",
                  "subTitle": "diaodai",
                  "data": {
                      "id": "sling-video-api",
                      "name": "吊带系列视频",
                      "api": "/api/diaodai.php"
                  }
              }
          ]
      },
      {
          "id": "girls-legs",
          "title": "🦵 美腿玉足",
          "description": "美腿和玉足相关视频",
          "children": [
              {
                  "id": "feet-legs",
                  "title": "玉足美腿",
                  "description": "对接好几个快手博主，实时更新",
                  "subTitle": "yuzu",
                  "data": {
                      "id": "feet-legs-api",
                      "name": "玉足美腿视频",
                      "api": "/api/yuzu.php"
                  }
              }
          ]
      },
      {
          "id": "girls-special",
          "title": "✨ 特色小姐姐",
          "description": "特色类型的小姐姐视频",
          "children": [
              {
                  "id": "double-happiness",
                  "title": "双倍快乐",
                  "description": "高质量，对接快手实时更新",
                  "subTitle": "sbkl",
                  "data": {
                      "id": "double-happiness-api",
                      "name": "双倍快乐视频",
                      "api": "/api/sbkl.php"
                  }
              },
              {
                  "id": "bianzhuang-video",
                  "title": "抖音变装",
                  "description": "返回抖音小姐姐变装视频",
                  "subTitle": "bianzhuang",
                  "data": {
                      "id": "bianzhuang-video-api",
                      "name": "抖音变装视频",
                      "api": "/api/bianzhuang.php"
                  }
              },
              {
                  "id": "ksxjj-video",
                  "title": "小姐姐视频②",
                  "description": "视频接口有点多",
                  "subTitle": "ksxjjsp",
                  "data": {
                      "id": "ksxjj-video-api",
                      "name": "小姐姐视频②",
                      "api": "/api/ksxjjsp.php"
                  }
              }
          ]
      },
      {
          "id": "girls-popular",
          "title": "🌟 热门小姐姐",
          "description": "热门博主和系列视频",
          "children": [
              {
                  "id": "shejie-video",
                  "title": "杀猪饲料蛇姐",
                  "description": "厦门没有茉莉花，就像我们的世界没有蛇姐",
                  "subTitle": "shejie",
                  "data": {
                      "id": "shejie-video-api",
                      "name": "杀猪饲料蛇姐视频",
                      "api": "/api/shejie.php"
                  }
              },
              {
                  "id": "jjy-video",
                  "title": "鞠婧祎系列",
                  "description": "随机返回鞠婧祎系列视频",
                  "subTitle": "jjy",
                  "data": {
                      "id": "jjy-video-api",
                      "name": "鞠婧祎系列视频",
                      "api": "/api/jjy.php"
                  }
              },
              {
                  "id": "yumeng-video",
                  "title": "你的欲梦",
                  "description": "快手官网视频外链，响应速度快",
                  "subTitle": "ndym",
                  "data": {
                      "id": "yumeng-video-api",
                      "name": "你的欲梦视频",
                      "api": "/api/ndym.php"
                  }
              }
          ]
      },
      {
          "id": "boys-handsome",
          "title": "🤵 小哥哥",
          "description": "各种类型的小哥哥视频",
          "children": [
              {
                  "id": "handsome-boys",
                  "title": "帅哥视频",
                  "description": "小geigei~",
                  "subTitle": "xgg",
                  "data": {
                      "id": "handsome-boys-api",
                      "name": "帅哥视频",
                      "api": "/api/xgg.php"
                  }
              }
          ]
      },
      {
          "id": "douyin",
          "title": "🎵 抖音视频",
          "description": "抖音平台的视频资源",
          "children": [
              {
                  "id": "douyin-random",
                  "title": "抖音随机",
                  "description": "随机输出抖音视频，小姐姐视频居多",
                  "subTitle": "dy_sj",
                  "data": {
                      "id": "douyin-random-api",
                      "name": "抖音随机视频",
                      "api": "/api/dy_sj.php"
                  }
              },
              {
                  "id": "douyin-search",
                  "title": "抖音搜索",
                  "description": "指定搜索抖音内容",
                  "subTitle": "dy_search",
                  "data": {
                      "id": "douyin-search-api",
                      "name": "抖音视频搜索",
                      "api": "/api/dy_search.php"
                  }
              },
              {
                  "id": "douyin-hot",
                  "title": "抖音热点",
                  "description": "返回抖音热点视频",
                  "subTitle": "dy_hot",
                  "data": {
                      "id": "douyin-hot-api",
                      "name": "抖音热点视频",
                      "api": "/api/dy_hot.php"
                  }
              }
          ]
      },
      {
          "id": "douyin-stars",
          "title": "⭐ 抖音达人",
          "description": "抖音知名达人和博主视频",
          "children": [
              {
                  "id": "douyin-xiaoxiao",
                  "title": "抖音潇潇",
                  "description": "随机返回抖音xiaoxiao视频，大概只有几百个",
                  "subTitle": "xiaoxiao",
                  "data": {
                      "id": "douyin-xiaoxiao-api",
                      "name": "抖音潇潇随机视频",
                      "api": "/api/xiaoxiao.php"
                  }
              }
          ]
      },
      {
          "id": "kuaishou",
          "title": "📱 快手视频",
          "description": "快手平台的视频资源",
          "children": [
              {
                  "id": "kuaishou-random",
                  "title": "快手随机",
                  "description": "随机类型输出快手视频",
                  "subTitle": "ks_sj",
                  "data": {
                      "id": "kuaishou-random-api",
                      "name": "快手随机视频",
                      "api": "/api/ks_sj.php"
                  }
              },
              {
                  "id": "manhuay-video",
                  "title": "漫画芋",
                  "description": "快手官网视频，实时更新",
                  "subTitle": "manhuay",
                  "data": {
                      "id": "manhuay-video-api",
                      "name": "漫画芋视频",
                      "api": "/api/manhuay.php"
                  }
              }
          ]
      },
      {
          "id": "dance",
          "title": "💃 舞蹈视频",
          "description": "各种舞蹈类型的视频",
          "children": [
              {
                  "id": "hot-dance",
                  "title": "热舞视频",
                  "description": "小姐姐热舞视频",
                  "subTitle": "rewu",
                  "data": {
                      "id": "hot-dance-api",
                      "name": "热舞视频",
                      "api": "/api/rewu.php"
                  }
              },
              {
                  "id": "slow-dance",
                  "title": "慢摇系列",
                  "description": "高质量慢摇系列视频",
                  "subTitle": "manyao",
                  "data": {
                      "id": "slow-dance-api",
                      "name": "慢摇系列视频",
                      "api": "/api/manyao.php"
                  }
              }
          ]
      },
      {
          "id": "comic-con",
          "title": "🎪 漫展视频",
          "description": "漫展现场和cosplay相关视频",
          "children": [
              {
                  "id": "comic-con-video",
                  "title": "漫展视频",
                  "description": "漫展现场随机视频",
                  "subTitle": "manzhan",
                  "data": {
                      "id": "comic-con-api",
                      "name": "漫展视频",
                      "api": "/api/manzhan.php"
                  }
              },
              {
                  "id": "cosplay-video",
                  "title": "COS系列",
                  "description": "返回COS动漫系列视频",
                  "subTitle": "COS",
                  "data": {
                      "id": "cosplay-video-api",
                      "name": "COS系列视频",
                      "api": "/api/COS.php"
                  }
              }
          ]
      },
      {
          "id": "kids",
          "title": "� 萌娃系列",
          "description": "可爱萌娃相关视频",
          "children": [
              {
                  "id": "kids-video",
                  "title": "萌娃系列",
                  "description": "包含（摇一摇、贝贝、丸子妹、果粒儿）系列",
                  "subTitle": "mengwa",
                  "data": {
                      "id": "kids-video-api",
                      "name": "萌娃系列视频",
                      "api": "/api/mengwa.php"
                  }
              }
          ]
      },
      {
          "id": "scenery",
          "title": "🌄 风景视频",
          "description": "各种风景类型的视频",
          "children": [
              {
                  "id": "sea-view",
                  "title": "海边晚霞",
                  "description": "喜欢花 喜欢海 喜欢日落",
                  "subTitle": "haibian",
                  "data": {
                      "id": "sea-view-api",
                      "name": "海边晚霞风景视频",
                      "api": "/api/haibian.php"
                  }
              },
              {
                  "id": "pc-scenery",
                  "title": "PC风景",
                  "description": "可用做网站背景的PC端风景视频",
                  "subTitle": "pcfj",
                  "data": {
                      "id": "pc-scenery-api",
                      "name": "PC端风景视频",
                      "api": "/api/pcfj.php"
                  }
              }
          ]
      },
      {
          "id": "anime",
          "title": "🎮 动漫相关",
          "description": "动漫和二次元相关视频",
          "children": [
              {
                  "id": "anime-video",
                  "title": "动漫视频",
                  "description": "燃起来了的动漫视频",
                  "subTitle": "dmsp",
                  "data": {
                      "id": "anime-video-api",
                      "name": "动漫视频",
                      "api": "/api/dmsp.php"
                  }
              },
              {
                  "id": "anime-room",
                  "title": "二次元房间",
                  "description": "可用作网站背景的随机二次元房间背景视频",
                  "subTitle": "pcfjsp",
                  "data": {
                      "id": "anime-room-api",
                      "name": "随机二次元房间背景视频",
                      "api": "/api/pcfjsp.php"
                  }
              }
          ]
      },
      {
          "id": "music",
          "title": "� 音乐相关",
          "description": "音乐和歌曲相关视频",
          "children": [
              {
                  "id": "cover-song",
                  "title": "抖音翻唱",
                  "description": "抖音忠宇、我是小力气、cici...随机歌曲",
                  "subTitle": "fanchang",
                  "data": {
                      "id": "cover-song-api",
                      "name": "抖音翻唱歌曲视频",
                      "api": "/api/fanchang.php"
                  }
              }
          ]
      },
      {
          "id": "sports",
          "title": "⚽ 体育相关",
          "description": "体育赛事和运动相关视频",
          "children": [
              {
                  "id": "football-video",
                  "title": "足球混剪",
                  "description": "梅西、C罗、内马尔、世界杯混剪视频",
                  "subTitle": "zuqiu",
                  "data": {
                      "id": "football-video-api",
                      "name": "足球混剪视频",
                      "api": "/api/zuqiu.php"
                  }
              }
          ]
      },
      {
          "id": "tech",
          "title": "💻 科技相关",
          "description": "科技和软件技巧相关视频",
          "children": [
              {
                  "id": "ps-video",
                  "title": "PS小技巧",
                  "description": "返回Photoshop技巧短视频",
                  "subTitle": "ps",
                  "data": {
                      "id": "ps-video-api",
                      "name": "PS小技巧视频",
                      "api": "/api/ps.php"
                  }
              }
          ]
      },
      {
          "id": "other",
          "title": "🎬 其他类型",
          "description": "其他各种类型的视频",
          "children": [
              {
                  "id": "random-video",
                  "title": "随机视频",
                  "description": "包含（歌曲、美女、风景、娱乐、动漫）",
                  "subTitle": "sjsp",
                  "data": {
                      "id": "random-video-api",
                      "name": "随机视频",
                      "api": "/api/sjsp.php"
                  }
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
