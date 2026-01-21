<template>
  <div class="site-container">
    <div class="site-layui-main">
      <div class="site-zfj site-zfj-anim">
        <img
          src="../../assets/touxiang.jpg"
          style="width: 172px; border-radius: 20px; border: 5px solid #e2e2e2"
        />
      </div>
      <div class="site-banner-other">
        <a
          href="https://gitee.com/liwncy"
          target="_blank"
          rel="nofollow"
          class="site-fork"
        >
          Gitee
        </a>
        <a
          href="https://github.com/liwncy"
          target="_blank"
          rel="nofollow"
          class="site-fork"
        >
          Github
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { inject, onMounted } from "vue";
import { useI18n } from "@layui/layui-vue";
import { useAppStore } from "@/store/app";
import { layer } from "@layui/layui-vue";

export default {
  name: "Index",
  setup() {
    const { t } = useI18n();
    const appStore = useAppStore();

    const changeTheme = () => {
      if (appStore.theme === "dark") {
        appStore.theme = "light";
      } else {
        appStore.theme = "dark";
      }
    };

    const version = inject("version");

    onMounted(() => {
      // if (appStore.documentVersion != version) {
      //   appStore.documentVersion = version;
      //   layer.notify({
      //     title: "更新公告",
      //     content: `layui - vue ${version} 已发布，请前往 <a style="color:#16baaa;" href="http://www.layui-vue.com/zh-CN/guide/changelog">[ 查看 ]</a>`,
      //     isHtmlFragment: true,
      //     offset: "rb",
      //     time: 10000,
      //     icon: 1,
      //   });
      // }
    });

    return {
      t,
      version,
      appStore,
      changeTheme,
    };
  },
};
</script>
<style>
#app,
html,
body {
  height: 100%;
}

.site-container {
  background: #fff;
  margin-top: 60px;
  height: calc(100vh - 60px);
  width: 100vw;
  background-image: url(../../assets/background.svg);
  background-repeat: no-repeat;
  background-size: 100%;
}

.site-layui-main {
  height: 90%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.site-download {
  margin-top: 72px;
  font-size: 0;
}

.site-download a {
  position: relative;
  padding: 0 20px 0 20px;
  height: 40px;
  line-height: 40px;
  border-radius: 4px;
  background: #f1f1f1;
  border: 1px solid #f1f1f1;
  font-size: 16px;
  color: #476582;
  font-weight: 500;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  transition: all 0.5s;
  -webkit-transition: all 0.5s;
  letter-spacing: 0.2px;
}

.site-download a:hover {
  border-radius: 10px;
}

.site-download a:first-child {
  background: var(--global-primary-color);
  color: white;
}

.site-download a + a {
  margin-left: 20px;
}

.site-zfj {
  height: 220px;
}

.site-zfj-anim i {
  -webkit-animation-name: site-zfj;
  animation-name: site-zfj;
  -webkit-animation-duration: 5s;
  animation-duration: 5s;
  -webkit-animation-timing-function: linear;
  animation-timing-function: linear;
}

.site-zfj i {
  position: absolute;
  left: 50%;
  top: 50px;
  width: 200px;
  height: 200px;
  margin-left: -100px;
  font-size: 180px;
  color: #c2c2c2;
}

.site-desc-anim {
  -webkit-animation-name: site-desc;
  animation-name: site-desc;
}

.site-desc {
  position: relative;
  height: 70px;
  margin-top: 20px;
}

.site-desc .web-font-desc {
  color: #fff;
  color: #213547;
  font-size: 52px;
  opacity: 0.86;
}

.web-font-desc {
  font-size: 76px;
  line-height: 1.25;
  font-weight: 900;
  letter-spacing: -1.5px;
  max-width: 960px;
  margin: 0 auto;
}

.site-desc cite {
  position: absolute;
  bottom: -40px;
  left: 0;
  width: 100%;
  color: rgba(60, 60, 60, 0.7);
  font-style: normal;
}

.site-version {
  position: relative;
  margin-top: 18px;
  color: rgba(60, 60, 60, 0.7);
  font-size: 12px;
}

.site-version span {
  padding: 0 3px;
}

.site-version * {
  font-style: normal;
}

.site-version a {
  color: rgba(60, 60, 60, 0.7);
  text-decoration: none;
  margin-top: -4px;
}

.site-banner-other {
  width: 100%;
  margin-top: 40px;
  text-align: center;
  font-size: 0;
}

.sponsors {
  padding: 0 150px 36px;
}

.sponsors h1 {
  text-align: center;
  margin-bottom: 12px !important;
}

.sponsors-main {
  padding: 20px 20px 20px;
  background-color: #ffffff;
  border-radius: 10px;
}

.sponsors-row {
  display: flex;
  justify-content: center;
}

.sponsors-btn {
  text-align: center;
}

.box-list {
  padding: 50px 250px;
}

.link-list {
  padding: 50px 250px;
  border-top: 1px solid #eeeeee;
}

.link-list .layui-col {
  text-align: center;
}

.box {
  background-color: #f9f9f9;
  border: 1px solid #f9f9f9;
  border-radius: 4px;
  padding: 24px;
  height: 100%;
}

.box .icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  border-radius: 6px;
  background-color: #e5e5e5;
  width: 48px;
  height: 48px;
  font-size: 24px;
}

.box .title {
  line-height: 24px;
  font-size: 16px;
  font-weight: 600;
}

.box .details {
  font-size: 14px;
  padding-top: 8px;
  font-weight: 500;
  line-height: 24px;
  color: rgba(56 56 56 / 70%);
}

.site-container .layui-field-title {
  border-top: 1px solid #d2d2d2;
}

.site-banner-other a {
  display: inline-block;
  vertical-align: middle;
  height: 28px;
  line-height: 28px;
  margin: 0 6px;
  padding: 0 8px;
  border-radius: 4px;
  color: rgba(60, 60, 60, 0.7);
  background: #f2f4f5;
  border: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 14px;
}

.footer {
  width: 100%;
  padding: 30px 0px;
  line-height: 30px;
  text-align: center;
  border-top: 1px solid #eee;
  color: rgba(60, 60, 60, 0.7);
  font-weight: 300;
  font-size: 13.6px;
  background: #f9f9f9;
}
</style>
