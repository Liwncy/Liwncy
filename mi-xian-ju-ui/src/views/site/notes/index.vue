<script setup lang="ts">
import { useNotes } from './useNotes'

const { loading, columns, dataShow, page, change, openArticle } = useNotes()
</script>

<template>
  <lay-layout class="example" style="--sidebar-width: 200px">
    <lay-side class="layui-menu-ref-2 no-scrollbar">
      <lay-container :fluid="true" style="padding: 0" />
    </lay-side>
    <lay-body id="notesContent">
      <lay-container :fluid="true" class="layui-text notes-container">
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
            <a class="notes-link" href="javascript:void(0)" @click="openArticle(row)">
              {{ row.title }}
            </a>
          </template>
          <template #toolbar>📑 文章列表</template>
        </lay-table>
      </lay-container>
    </lay-body>
    <lay-backtop target="#notesContent" :show-height="100" :bottom="30" position="absolute" />
  </lay-layout>
</template>

<style scoped>
.notes-container {
  padding: 10px;
}

.notes-link {
  color: var(--global-primary-color, #009688);
  cursor: pointer;
}

.notes-link:hover {
  text-decoration: underline;
}
</style>
