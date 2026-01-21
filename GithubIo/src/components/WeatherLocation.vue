<template>
  <!-- ✅ 核心判断：size=card 展示完整卡片样式 | 默认(mini)展示顶部栏极简样式 -->
  <div v-if="size === 'mini'" class="weather-mini-container" @click.stop>
    <!-- 顶部栏专用：一行极简布局 高度100%自适应top导航栏 不占空间 -->
    <div class="weather-mini-content flex items-center gap-2 h-full">
      <lay-icon
          v-if="loading"
          type="layui-icon-loading"
          spin
          size="14"
          color="#165DFF"
          class="weather-icon"
      ></lay-icon>
      <!-- 切换城市小图标 - 极简适配顶部栏 -->
      <lay-icon
          type="layui-icon-location"
          v-else
          size="12"
          color="#999"
          class="city-edit-icon cursor-pointer ml-1"
          @click="showCityInput = true"
          title="切换城市"
      ></lay-icon>

      <span class="weather-mini-text flex items-center gap-2">
        <span v-if="loading" class="city-name text-sm"> 查询...</span>
        <span v-else-if="cityName" class="city-name text-sm">
          {{ cityName }}
        </span>
        <span v-else class="city-name text-sm text-red-500">{{ errorMsg }}</span>
        <span v-if="weatherData" class="weather-info-text text-xs">
          <img :src="weatherData.icon" alt="天气图标" style="width: 20px; height: 20px;">
          <span style="font-size: 12px">{{ weatherData.tem }}℃</span>
          <!-- {{ weatherData.wea }} | {{ weatherData.tem }}℃ -->
        </span>
      </span>
    </div>
  </div>

  <!-- ✅ size="card" 展示完整卡片样式，带全部天气信息 -->
  <lay-card v-else shadow="hover" class="weather-card-container" style="width: 100%; max-width: 600px; margin: 10px 0;">
    <!-- <template #header> -->
    <div class="flex justify-between items-center">
        <span>
          <lay-icon
              type="layui-icon-location"
              size="12"
              color="#999"
              class="city-edit-icon cursor-pointer ml-1"
              @click="showCityInput = true"
              title="切换城市"
          ></lay-icon>
          <span v-if="loading">定位中...</span>
          <span v-else-if="cityName">{{ cityName }}</span>
          <span v-else class="text-red-500">{{ errorMsg }}</span>
        </span>
      <!-- <lay-button type="primary" size="sm" @click="showCityInput = true">手动切换城市</lay-button> -->
    </div>
    <!-- </template> -->

    <div v-if="loading" class="py-6 text-center">
      <lay-icon type="loading" spin size="20"></lay-icon>
      <p class="mt-2 text-gray-500">正在获取天气信息...</p>
    </div>

    <div v-else-if="weatherData" class="weather-info">
      <div class="flex items-center justify-center gap-4 mb-4">
        <img :src="weatherData.icon" alt="天气图标" style="width: 60px; height: 60px;">
        <div>
          <h3 class="text-xl font-bold">{{ weatherData.wea }}</h3>
          <p class="text-gray-600">{{ weatherData.tem }} ℃</p>
        </div>
      </div>
      <div class="grid grid-cols-3 text-center text-sm text-gray-600">
        <div>温度：{{ weatherData.tem2 }} ~ {{ weatherData.tem1 }} ℃</div>
        <div>风力：{{ weatherData.win }} {{ weatherData.win_speed }}</div>
        <div>湿度：{{ weatherData.humidity }}</div>
      </div>
    </div>

    <div v-else class="py-6 text-center text-gray-500">
      暂无天气数据，请稍后重试
    </div>
  </lay-card>

  <!-- layui-vue 官方原生弹窗组件 无任何报错 -->
  <lay-layer v-model="showCityInput" title="城市">
    <lay-input v-model="inputCity" placeholder="城市名称"></lay-input>
    <template #footer>
      <lay-button type="default" size="sm" @click="showCityInput = false">取消</lay-button>
      <lay-button type="primary" size="sm" @click="handleManualCity">确定查询</lay-button>
    </template>
  </lay-layer>
</template>

<script setup>
import {ref, reactive, onMounted, getCurrentInstance} from 'vue'
import {requestProxyGet} from '@/api/common/external/base'
import {requestGet60sApi} from "@/api/common/external/60sApi";

// ✅ 1. 定义可控制的参数 mini 【核心】父组件传则极简top栏样式，不传则完整样式
const props = defineProps({
  size: {
    type: String,
    default: "mini"
  }
})

// 响应式数据
const loading = ref(true) // 加载状态
const cityName = ref('') // 当前定位城市
const errorMsg = ref('') // 错误提示信息
const weatherData = ref(null) // 天气数据
const showCityInput = ref(false) // 是否显示手动选城市弹窗
const inputCity = ref('') // 手动输入的城市名

// 页面挂载完成自动执行定位+获取天气
onMounted(() => {
  initLocationAndWeather()
})

// 核心入口：初始化定位 + 获取天气
const initLocationAndWeather = async () => {
  loading.value = true
  try {
    // 优先获取定位城市
    const targetCity = await getTargetCity()
    console.log('定位城市：', targetCity)
    if (targetCity && targetCity !== '未知城市') {
      cityName.value = targetCity
      // 根据城市获取天气
      console.log('城市：', cityName.value)
      await getWeatherByCity(targetCity)
    } else {
      errorMsg.value = '定位失败，可手动选择城市'
    }
  } catch (err) {
    errorMsg.value = '获取位置失败，请手动选择城市'
    console.log('定位异常：', err)
  } finally {
    loading.value = false
  }
}

// 核心方法：双方案获取城市【优先原生定位，失败降级IP定位】
const getTargetCity = () => {
  return new Promise(async (resolve) => {
    // 判断浏览器是否支持原生定位API
    if (navigator.geolocation) {
      try {
        if (1 === 1) {
          throw new Error('异常,不用了,浏览器支持原生定位');
        }
        // 方案1：浏览器原生高精度定位
        await new Promise((success, fail) => {
          navigator.geolocation.getCurrentPosition(
              async (position) => {
                const lng = position.coords.longitude // 经度
                const lat = position.coords.latitude  // 纬度
                const city = await getCityByGeo(lng, lat)
                resolve(city)
              },
              (err) => fail(err), // 定位失败则执行降级逻辑
              {enableHighAccuracy: true, timeout: 500, maximumAge: 0}
          )
        })
      } catch (err) {
        // 原生定位失败【用户拒绝/超时/无权限】，自动降级方案2：IP定位
        console.log('原生定位失败，降级IP定位：', err)
        const ipCity = await getCityByIP()
        resolve(ipCity)
      }
    } else {
      // 浏览器不支持定位，直接走IP定位
      const ipCity = await getCityByIP()
      resolve(ipCity)
    }
  })
}

// ✅ 【Axios】高德逆地理编码：经纬度转城市名称（无key、无跨域、纯前端）
const getCityByGeo = async (lng, lat) => {
  const url = 'https://assets.msn.cn/service/weather/locations/search';
  const params = {
    apikey: '0QfOX3Vn51YCzitbLaRkTTBadtWpgTN8NZLW0C1SEM',
    cm: 'zh-cn',
    lat: lat,
    lng: lng
  }
  let city = '未知城市';
  await requestProxyGet(url, params).then(res => {
    console.log('Geo定位：', res)
    city = res.city
  }).catch(err => {
    console.log('Geo定位异常：', err)
  })
  return city;
}

// ✅ 【Axios】IP定位获取城市（无需授权、无HTTPS限制，降级兜底方案）
const getCityByIP = async () => {
  const url = 'https://whois.pconline.com.cn/ipJson.jsp?json=true&ip=';
  let city = '未知城市';
  await requestProxyGet(url).then(res => {
    console.log('IP定位：', res)
    city = res.city
  }).catch(err => {
    console.log('IP定位异常：', err)
  })
  return city;
}

// ✅ 【Axios】根据城市名称获取天气数据（免费接口、无跨域、适配layui-vue）
const getWeatherByCity = async (city) => {
  try {
    // 60s天气查询接口
    const url = '/v2/weather';
    const params = {query: city}
    await requestGet60sApi(url, params).then(res => {
      const weather = res.data.weather
      weatherData.value = {
        wea: weather.condition, // 天气状况
        tem: weather.temperature, // 当前温度
        tem1: weather.temperature, // 最高温
        tem2: weather.temperature, // 最低温
        win: weather.wind_direction, // 风向
        win_speed: weather.wind_power, // 风速
        humidity: weather.humidity, // 湿度
        icon: weather.weather_icon // 天气图标
      }
    });
  } catch (err) {
    weatherData.value = null
    errorMsg.value = '获取天气信息失败'
    console.log('天气接口异常：', err)
  }
}

// ✅ 手动切换城市的回调方法
const handleManualCity = async () => {
  if (!inputCity.value) return
  loading.value = true
  cityName.value = inputCity.value
  errorMsg.value = ''
  await getWeatherByCity(inputCity.value)
  showCityInput.value = false
  loading.value = false
}
</script>

<style scoped>
/* -------------------- 顶部栏mini样式 (默认) 核心适配 -------------------- */
.weather-mini-container {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 8px;
  box-sizing: border-box;
  white-space: nowrap; /* 永不换行 一行展示 适配顶部栏核心 */
}

.weather-mini-content {
  height: 100%;
  align-items: center;
  cursor: default;
}

.weather-icon {
  flex-shrink: 0;
}

.weather-mini-text {
  font-size: 13px;
  flex-shrink: 0;
}

.city-edit-icon {
  flex-shrink: 0;
  transition: all 0.2s;
}

.city-edit-icon:hover {
  color: #165DFF !important;
}

/* -------------------- 完整卡片样式 (size="card") -------------------- */
.weather-card-container {
  border-radius: 8px;
}

.weather-info {
  padding: 10px 0;
}

/* -------------------- 公共样式兼容 -------------------- */
:deep(.text-red-500) {
  color: #F53F3F;
}

:deep(.lay-modal-body) {
  padding: 15px;
}

:deep(.lay-input) {
  margin: 0;
}

:deep(.lay-modal-footer) {
  padding: 10px 15px;
}
</style>