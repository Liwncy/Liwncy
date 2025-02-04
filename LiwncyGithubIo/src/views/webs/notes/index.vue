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
            <router-link to="/zh-CN/index"> {{ row.title }}</router-link>
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
import {getSideMenus, getWeTabSidMenus} from "@/api/webs/bookMark/index";
import axios from "axios";
import testDev from "../../../../../data/webs/betterRead/index.json"

export default {
  components: {LayBody},
  setup() {

    const loading = ref(false);
    const selectedKeys = ref([]);
    const page = reactive({current: 1, limit: 10, total: 100});
    const columns = ref(
        [
          {title: "序号", width: "55px", type: "number", fixed: "left"},
          {title: "📑", width: "80px", key: "title", customSlot:"title"},
          {title: "作者", width: "80px", key: "author",},
          // {title: "📑", width: "80px", key: "content"},
          {title: "🌟", width: "80px", key: "tags"},
          {title: "🐛", width: "80px", key: "source"},
          {title: "📅", width: "80px", key: "date"},
      // { title:"链接地址", width: "80px", key:"linksUrl" },

      // { title:"编号", width: "80px", key:"id", fixed: "left", sort: "desc" },
      // { title:"标题", width: "80px", key:"title", sort: "desc" },
      // { title:"状态", width: "180px", key:"status", customSlot: "status"},
      // { title:"📅", width: "120px", key:"email" },
      // { title:"📑", width: "80px", key:"sex" },
      // { title:"年龄", width: "80px", key:"age", totalRow: true},
      // { title:"城市", width: "120px", key:"city" },
      // { title:"签名", width: "260px", key:"remark" },
      // { title:"隐藏", width: "260px", key:"hide", hide: true, totalRow: "自定义" },
      // { title:"时间", width: "120px", key:"joinTime"},
      // { title:"操作", width: "150px", customSlot:"operator", key:"operator", fixed: "right", ignoreExport: true }
    ]);

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


    const initPage = async function () {
      // dataSource.value = await getWeTabSidMenus();
      dataSource.value = testDev;
      page.total = dataSource.value.length;
      dataShow.value = loadDataSource(page.current, page.limit);
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
      change
    }
  }
}
</script>
<style>
</style>
