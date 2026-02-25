// 今日热榜API

/**
 * 获取侧边栏菜单
 * @returns {Promise<{data: *[]}>}
 */
export const getSideMenus = async () => {
  // 平台列表分类
  const menus = [
      {
          "id": "text-content",
          "title": "📝 文案内容",
          "description": "各种类型的文案和文本内容",
          "children": [
              {
                  "id": "text-search",
                  "title": "文案搜索",
                  "description": "高质量文案搜索，可惜生活不是电影，我也少了点运气",
                  "subTitle": "sswenan",
                  "data": {
                      "id": "text-search-api",
                      "name": "文案搜索",
                      "api": "/api/sswenan.php"
                  }
              },
              {
                  "id": "text-random",
                  "title": "随机美句",
                  "description": "随机返回优美美句文案",
                  "subTitle": "wenan",
                  "data": {
                      "id": "text-random-api",
                      "name": "随机美句摘抄文案",
                      "api": "/api/wenan.php"
                  }
              },
              {
                  "id": "text-dog",
                  "title": "狗屁不通文章",
                  "description": "生成一篇狗屁不通的文章",
                  "subTitle": "dog",
                  "data": {
                      "id": "text-dog-api",
                      "name": "狗屁不通文章生成",
                      "api": "/api/dog.php"
                  }
              }
          ]
      },
      {
          "id": "text-emotion",
          "title": "❤️ 情感文案",
          "description": "各种情感类型的文案",
          "children": [
              {
                  "id": "text-sad",
                  "title": "伤感语录",
                  "description": "返回一段伤感语录",
                  "subTitle": "sgyl",
                  "data": {
                      "id": "text-sad-api",
                      "name": "伤感语录",
                      "api": "/api/sgyl.php"
                  }
              },
              {
                  "id": "text-soft",
                  "title": "温柔文案",
                  "description": "返回一段温柔文案",
                  "subTitle": "wenrou",
                  "data": {
                      "id": "text-soft-api",
                      "name": "温柔文案",
                      "api": "/api/wenrou.php"
                  }
              },
              {
                  "id": "text-poison",
                  "title": "毒鸡汤",
                  "description": "返回一段毒鸡汤文案",
                  "subTitle": "dujitang",
                  "data": {
                      "id": "text-poison-api",
                      "name": "毒鸡汤",
                      "api": "/api/dujitang.php"
                  }
              },
              {
                  "id": "text-soil",
                  "title": "土味情话",
                  "description": "返回一条土味情话",
                  "subTitle": "qinghua",
                  "data": {
                      "id": "text-soil-api",
                      "name": "土味情话",
                      "api": "/api/qinghua.php"
                  }
              }
          ]
      },
      {
          "id": "text-quote",
          "title": "✍️ 语录短句",
          "description": "各种类型的语录和短句",
          "children": [
              {
                  "id": "text-yiyan",
                  "title": "随机一言",
                  "description": "返回随机一言文案",
                  "subTitle": "yan",
                  "data": {
                      "id": "text-yiyan-api",
                      "name": "随机一言",
                      "api": "/api/yan.php"
                  }
              },
              {
                  "id": "text-yiyan-multi",
                  "title": "随机一言（多行）",
                  "description": "随机返回10条一言",
                  "subTitle": "yiyan",
                  "data": {
                      "id": "text-yiyan-multi-api",
                      "name": "随机一言（多行）",
                      "api": "/api/yiyan.php"
                  }
              },
              {
                  "id": "text-answer",
                  "title": "答案之书",
                  "description": "返回一句简短语录",
                  "subTitle": "daan",
                  "data": {
                      "id": "text-answer-api",
                      "name": "答案之书",
                      "api": "/api/daan.php"
                  }
              },
              {
                  "id": "text-english",
                  "title": "英汉语录",
                  "description": "随机返回英语汉语文案",
                  "subTitle": "yhyl",
                  "data": {
                      "id": "text-english-api",
                      "name": "英汉语录",
                      "api": "/api/yhyl.php"
                  }
              }
          ]
      },
      {
          "id": "text-social",
          "title": "💬 社交文案",
          "description": "社交媒体相关的文案",
          "children": [
              {
                  "id": "text-pyq",
                  "title": "朋友圈文案",
                  "description": "随机返回朋友圈文案",
                  "subTitle": "pyq",
                  "data": {
                      "id": "text-pyq-api",
                      "name": "朋友圈文案",
                      "api": "/api/pyq.php"
                  }
              },
              {
                  "id": "text-qq-signature",
                  "title": "QQ签名文案",
                  "description": "随机一段qq签名文案",
                  "subTitle": "qianming",
                  "data": {
                      "id": "text-qq-signature-api",
                      "name": "QQ签名文案",
                      "api": "/api/qianming.php"
                  }
              }
          ]
      },
      {
          "id": "text-game",
          "title": "🎮 游戏文案",
          "description": "游戏相关的文案和语录",
          "children": [
              {
                  "id": "text-wzry",
                  "title": "王者荣耀台词",
                  "description": "这是谁的小鹿，真厉害！——虎扑评分",
                  "subTitle": "wzry",
                  "data": {
                      "id": "text-wzry-api",
                      "name": "王者荣耀英雄台词",
                      "api": "/api/wzry.php"
                  }
              },
              {
                  "id": "text-lol",
                  "title": "英雄联盟台词",
                  "description": "爱你，老妈！",
                  "subTitle": "yxlm",
                  "data": {
                      "id": "text-lol-api",
                      "name": "英雄联盟台词",
                      "api": "/api/yxlm.php"
                  }
              }
          ]
      },
      {
          "id": "text-tool",
          "title": "🔧 实用工具",
          "description": "实用的文本工具和功能",
          "children": [
              {
                  "id": "text-zishu",
                  "title": "字数检测",
                  "description": "检测文章有多少个字",
                  "subTitle": "zishu",
                  "data": {
                      "id": "text-zishu-api",
                      "name": "字数检测",
                      "api": "/api/zishu.php"
                  }
              }
          ]
      },
      {
          "id": "text-other",
          "title": "📄 其他文案",
          "description": "其他类型的文案内容",
          "children": [
              {
                  "id": "text-saohua",
                  "title": "随机骚话",
                  "description": "返回一段随机骚话",
                  "subTitle": "saohua",
                  "data": {
                      "id": "text-saohua-api",
                      "name": "随机骚话",
                      "api": "/api/saohua.php"
                  }
              },
              {
                  "id": "text-wu",
                  "title": "污句子",
                  "description": "返回一段污句子",
                  "subTitle": "text_wu",
                  "data": {
                      "id": "text-wu-api",
                      "name": "污句子",
                      "api": "/api/text_wu.php"
                  }
              },
              {
                  "id": "text-renjian",
                  "title": "我在人间凑日子",
                  "description": "返回一段凑日子文案",
                  "subTitle": "renjian",
                  "data": {
                      "id": "text-renjian-api",
                      "name": "我在人间凑日子",
                      "api": "/api/renjian.php"
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
