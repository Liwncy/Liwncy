UPDATE api_functions
SET code = 'litevideo',
    name = '轻视频',
    description = '按功能获取轻视频内容，不向前端暴露第三方平台。',
    updated_at = datetime('now')
WHERE code IN ('hot-video', 'random-video', 'video');

UPDATE api_functions
SET code = 'liteimage',
    name = '轻图',
    description = '按功能获取轻图内容。',
    updated_at = datetime('now')
WHERE code IN ('random-image', 'image');

UPDATE api_functions
SET code = 'liteword',
    name = '轻文案',
    description = '按功能获取轻文案内容。',
    updated_at = datetime('now')
WHERE code IN ('lite-word', 'random-text', 'text');
