<template>
  <lay-layout class="example1">
    <lay-side class="layui-menu-ref-2 no-scrollbar">
      <lay-container fluid="true" style="padding: 0;">
      </lay-container>
    </lay-side>
    <lay-body id="bookMarkContent">
      <lay-container fluid="true" style="padding: 10px;">

      </lay-container>
    </lay-body>
    <lay-backtop target="#bookMarkContent" :showHeight="100" :bottom="30" position="absolute"></lay-backtop>
  </lay-layout>
</template>

<script>
import {onMounted, nextTick, ref, watch} from 'vue';
import {getSideMenus, getWeTabSidMenus} from "@/api/webs/bookMark/index";
import {getParents, getNode, getAllNodeFieldArr} from "@/library/treeUtil";
import {outsideStore} from "@/store/outside";
import axios from "axios";
import linksJson from "../../../../../data/webs/bookMark/links.json"
import linksInJson from "../../../../../data/webs/bookMark/linksin.json"
import testDev from "../../../../../data/webs/bookMark/testdev.json"

export default {
  components: {LayBody},
  setup() {


    const initPage = async function () {

    };
    onMounted(() => {
      initPage()
    })

    return {

    }
  }
}
</script>
<style>
</style>
