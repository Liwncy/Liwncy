<template>
  <lay-layout class="example1">
    <lay-side class="layui-menu-ref-2 no-scrollbar">
      <lay-container fluid="true" style="padding: 0;">
      </lay-container>
    </lay-side>
    <lay-body id="bookMarkContent">
      <lay-container class="layui-text" fluid="true" style="padding: 10px;">
        <lay-table
            :page="page"
            :resize="true"
            :height="'100%'"
            :columns="columns"
            :loading="loading"
            :default-toolbar="true"
            :data-source="dataShow"
            v-model:selected-keys="selectedKeys"
            @change="change"
            @sortChange="sortChange">
          <template #title="{ row }">
            <router-link :to="{ name: 'BetterRead' }" @click="setArticleInfo(dataSource,row)"> {{
                row.title
              }}
            </router-link>
          </template>
          <template v-slot:toolbar>
            📑 文章列表
          </template>
          <template v-slot:operator="{ row }">
            <lay-button size="xs" type="primary">编辑</lay-button>
            <lay-button size="xs">查看</lay-button>
          </template>
        </lay-table>
      </lay-container>
    </lay-body>
    <lay-backtop target="#bookMarkContent" :showHeight="100" :bottom="30" position="absolute"></lay-backtop>
  </lay-layout>
</template>

<script>
import {onMounted, nextTick, ref, watch, reactive} from 'vue';
import {layer} from '@layui/layui-vue';
import {useArticleStore} from '@/store/article'
import axios from "axios";
import {encryptBase64} from "@/utils/crypto";
import testDev from "../../../../../data/webs/betterRead/index.json"
import CryptoJS from "crypto-js";

export default {
  components: {LayBody},
  setup() {
    const articleStore = useArticleStore();
    const loading = ref(false);
    const selectedKeys = ref([]);
    const page = reactive({current: 1, limit: 10, total: 100});
    const columns = ref(
        [
          {title: "序号", width: "55px", type: "number", fixed: "left"},
          {title: "📑", width: "80px", key: "title", customSlot: "title"},
          {title: "作者", width: "80px", key: "author",},
          // {title: "📑", width: "80px", key: "content"},
          {title: "🌟", width: "80px", key: "tags"},
          {title: "🐛", width: "80px", key: "source"},
          {title: "📅", width: "80px", key: "date"},
          // { title:"链接地址", width: "80px", key:"linksUrl" },
        ]);

    const dbapi = "/10tapi/db.php";

    // 查询文章列表
    function getArticleList() {
      loading.value = true;
      document.cookie = "__test=11cada376dc584ca9161fc3e2bcd95a7";
      axios.get(dbapi+"?action=SELECT&sql="+encryptBase64(CryptoJS.enc.Utf8.parse("select * from cms_blog where 1=1"))).then(res => {
        console.log(res.data);
        dataSource.value = res.data;
        loading.value = false;
      }).catch(() => {
        loading.value = false;
      })
    }

    const change = (page) => {
      loading.value = true;
      setTimeout(() => {
        dataSource.value = loadDataSource(page.current, page.limit);
        loading.value = false;
      }, 1);
    }

    const sortChange = (key, sort) => {
      layer.msg(`字段${key} - 排序${sort}, 你可以利用 sort-change 实现服务端排序`)
    }

    // const dataSource = ref([])
    const dataSource = ref([])
    const dataShow = ref([])


    const loadDataSource = (page, pageSize) => {
      let response = [];
      const startIndex = ((page - 1) * pageSize);
      const endIndex = page * pageSize;
      response = dataSource.value.slice(startIndex, endIndex);
      return response;
    }

    const setArticleInfo = (dataList, curData) => {
      articleStore.loadArticleInfo(dataList, curData)
    }


    const initPage = async function () {
      // dataSource.value = await getWeTabSidMenus();
      // dataSource.value = testDev;
      // page.total = dataSource.value.length;
      // dataShow.value = loadDataSource(page.current, page.limit);
      await getArticleList();
    };
    onMounted(() => {
      initPage()
    })

    return {
      columns,
      dataSource,
      dataShow,
      selectedKeys,
      page,
      change,
      setArticleInfo
    }
  }
}
</script>
<style>
</style>
