# 免费阅读与登录合并说明

## 用户免费阅读后注册看收费章节，是否合并之前已免费阅读的章节？

### 检查结果

**当前实现：已支持合并。**

1. **阅读进度存储**
   - 未登录：进度存在 `localStorage`（`reader-progress-${bookId}`）
   - 已登录：进度同时存 `localStorage` 和 `user_progress` 表

2. **合并逻辑**（`/api/reader/progress` + 读者页）
   - 读者页加载时：若用户已登录，拉取服务端 `user_progress`
   - 若服务端无记录但 `localStorage` 有：将本地进度同步到服务端（合并）
   - 若两端都有：取 `chapterIndex` 较大者，保证不丢失进度

3. **免费 vs 付费**
   - 前 N 章免费（N 在后台「免费阅读章节」设置）
   - 付费章节需登录后用书豆购买
   - 免费章节在未登录/登录后均可阅读，登录后进度会合并

### 迁移说明

需执行迁移 014、015 以启用：
- `free_chapters_count`（site_settings）
- `reader_profiles`、`chapter_purchases` 表
