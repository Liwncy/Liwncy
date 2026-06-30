<template>
  <div class="dashboard">
    <lay-row space="16">
      <lay-col md="8">
        <lay-card title="欢迎">
          <p>这是精简版 Admin 控制台骨架。</p>
          <p>后续可在此管理书签、随记等内容。</p>
        </lay-card>
      </lay-col>
      <lay-col md="8">
        <lay-card title="技术栈">
          <ul class="stack-list">
            <li>Vue 3 + TypeScript + Vite</li>
            <li>Layui Vue 2.21</li>
            <li>mi-xian-ju-api (Cloudflare Workers)</li>
          </ul>
        </lay-card>
      </lay-col>
      <lay-col md="8">
        <lay-card title="迁移进度">
          <lay-progress :percent="85" show-text />
          <p class="progress-tip">主站页面已基本迁移完成，待清理 GithubIo</p>
        </lay-card>
      </lay-col>
    </lay-row>
  </div>
</template>

<style scoped>
.stack-list {
  margin: 0;
  padding-left: 18px;
  line-height: 1.8;
}

.progress-tip {
  margin: 12px 0 0;
  color: #888;
  font-size: 13px;
}
</style>
