/** 将旧 /webs/* 路径映射为新站路由（写入 topMenu KV 时使用） */
export function normalizeNavPath(path: string) {
  return path
    .replace(/^\/webs\/index\/?$/i, '/')
    .replace(/^\/webs\/xysx\/?$/i, '/hot-bans')
    .replace(/^\/webs\/xjbb\/?$/i, '/ai-tools')
    .replace(/^\/webs\/rjyh\/?$/i, '/personality-test')
    .replace(/^\/webs\/lzxy\/?$/i, '/lite-video')
    .replace(/^\/webs\/life\/?$/i, '/hot-bans')
    .replace(/^\/webs\/book_mark\/?$/i, '/bookmark')
    .replace(/^\/webs\/bookMark\/?$/i, '/bookmark')
    .replace(/^\/webs\/hot_bans\/?$/i, '/hot-bans')
    .replace(/^\/webs\/hotBans\/?$/i, '/hot-bans')
    .replace(/^\/webs\/dailyhot\/?$/i, '/daily-hot')
    .replace(/^\/webs\/aiTool\/?$/i, '/ai-tools')
    .replace(/^\/webs\/liteVideo\/?$/i, '/lite-video')
    .replace(/^\/webs\/liteImage\/?$/i, '/lite-image')
    .replace(/^\/webs\/liteWord\/?$/i, '/lite-word')
    .replace(/^\/webs\/personalityTest\/?$/i, '/personality-test')
    .replace(/^\/webs\/notes\/?$/i, '/notes')
    .replace(/^\/webs\//, '/')
    .replace(/_/g, '-')
}
