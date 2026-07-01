<script setup lang="ts">
import '@/assets/styles/site-docs.css'
import { useNotes } from './useNotes'

const { loading, columns, dataShow, page, change, openArticle } = useNotes()
</script>

<template>
  <lay-layout class="example site-docs-layout" style="--sidebar-width: 200px">
    <lay-side class="layui-menu-ref-2 no-scrollbar">
      <lay-container :fluid="true" style="padding: 0" />
    </lay-side>
    <lay-body id="notesContent">
      <lay-container :fluid="true" class="site-docs-page">
        <header class="read-header">
          <h1>📑 文章列表</h1>
          <p class="read-meta">浏览笔记与文章，点击标题进入阅读</p>
        </header>
        <lay-table
          :page="page"
          :resize="true"
          height="100%"
          :columns="columns"
          :loading="loading"
          :default-toolbar="true"
          :data-source="dataShow"
          @change="change"
        >
          <template #title="{ row }">
            <a class="site-docs-link" href="javascript:void(0)" @click="openArticle(row)">
              {{ row.title }}
            </a>
          </template>
          <template #toolbar>文章列表</template>
        </lay-table>
      </lay-container>
    </lay-body>
    <lay-backtop target="#notesContent" :showHeight="100" :bottom="30" position="absolute" />
  </lay-layout>
</template>
