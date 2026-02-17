# StoryRealm 网页端 UI 设计风格文档

本文档从现有代码中提炼，供重构时沿用同一套 UI 风格。

---

## 1. 技术栈与设计系统

| 项目 | 说明 |
|------|------|
| **样式** | Tailwind CSS + Shadcn/UI（Radix UI 基座） |
| **主题** | CSS 变量（HSL），支持 `:root` 亮色与 `.dark` 暗色 |
| **动效** | Framer Motion（landing 入场/滚动）、tailwindcss-animate（弹窗等） |
| **图标** | Lucide React |
| **工具** | `class-variance-authority`（Button 变体）、`cn()` 合并 class |

---

## 2. 色彩体系

### 2.1 语义化 Token（`app/globals.css` + `tailwind.config.ts`）

所有主色通过 CSS 变量定义，Tailwind 用 `hsl(var(--xxx))` 引用：

- **background / foreground**：页面背景与正文
- **card / card-foreground**：卡片背景与文字
- **primary / primary-foreground**：主按钮、强调链接
- **secondary / secondary-foreground**：次要按钮
- **muted / muted-foreground**：弱化文字、说明
- **accent / accent-foreground**：悬停、选中态
- **destructive / destructive-foreground**：危险操作
- **border / input / ring**：边框、输入框、焦点环

### 2.2 场景化配色

| 场景 | 用法 | 说明 |
|------|------|------|
| **Landing 首页（深色）** | `bg-slate-950`、`slate-900/50`、`slate-800`、`slate-700` | 深色背景 + 半透明层；`.bg-slate-950` 会覆盖 `--background` 为 `222 47% 4%` |
| **品牌/CTA** | `amber-400`、`amber-500`、`text-amber-400`、`bg-amber-500 text-slate-950` | 主 CTA、Logo、评分星、强调标签 |
| **Landing 辅助** | `purple-400`、`purple-500/10` | 分类标签、章节号等 |
| **Reader/后台** | 以 `bg-background`、`text-foreground`、`text-muted-foreground` 为主 | 跟随系统亮/暗主题 |
| **阅读器背景** | 白 / 护眼 / 深色：`bg-white`、`bg-amber-50/95 text-amber-950`、`bg-neutral-900 text-neutral-100` | 见 `ReadingSettingsContext` |

### 2.3 边框与分割

- 通用：`border-border`（来自变量）
- Landing 深色区：`border-slate-800`、`border-slate-800/50`、`border-slate-700`
- 浮层/下拉：`border-slate-700`、`bg-slate-900`

---

## 3. 字体与排版

### 3.1 字体族（`app/layout.tsx` + `tailwind.config.ts`）

| 用途 | Tailwind | 变量/字体 |
|------|----------|-----------|
| 正文/UI | `font-sans` | `--font-inter` (Inter) |
| 标题/品牌（Landing） | `font-display` | `--font-cinzel` (Cinzel) |
| 阿拉伯语 / RTL | 见下 | `--font-cairo` (Cairo)、Amiri |

### 3.2 RTL 与阿语（`app/globals.css`）

```css
[dir='rtl'] { font-family: 'Amiri', serif; }
[dir='rtl'] body { font-family: 'Amiri', serif; }
```

阅读页正文在 `ar` 时：`dir="rtl"` 且 `style={{ fontFamily: 'Amiri, serif' }}`。

### 3.3 标题层级

- 首页 Hero：`font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white`
- Section 标题（Landing）：`font-display text-xl md:text-2xl font-bold text-white`
- 书籍页/阅读页标题：`text-2xl font-bold` 或 `text-xl font-semibold`
- 卡片标题：`font-semibold`、`line-clamp-1` / `line-clamp-2`

### 3.4 阅读器正文

- 字号：`text-base` / `text-lg` / `text-xl`（small / medium / large）
- 正文容器：`prose prose-neutral dark:prose-invert max-w-none`，段落 `[&_p]:mb-4`

---

## 4. 布局与间距

### 4.1 容器

- 统一：`container mx-auto px-4`
- 阅读/表单窄版：`container mx-auto max-w-3xl px-4` 或 `max-w-md`（ChapterGate）
- 后台：`container mx-auto px-4 py-8`

### 4.2 常用间距

- 区块：`py-6`、`py-8`、`gap-6`、`gap-8`
- 卡片内：`p-3`、`p-4`、`p-6`
- 组件间：`gap-2`、`gap-3`、`gap-4`、`mt-2`、`mt-4`、`mt-6`

### 4.3 导航栏高度

- 固定顶栏：`h-14`，内容 `flex h-14 items-center justify-between`

---

## 5. 组件规范

### 5.1 Button（`components/ui/button.tsx`）

- 基础：`rounded-md text-sm font-medium`，focus 使用 `ring-2 ring-ring`
- **变体**：`default` | `destructive` | `outline` | `secondary` | `ghost` | `link`
- **尺寸**：`default` (h-10 px-4) | `sm` (h-9 px-3) | `lg` (h-11 px-8) | `icon` (h-10 w-10)

Landing 主 CTA 覆盖样式示例：

- 主按钮：`bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/25`
- 次要：`variant="outline" border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white`

### 5.2 卡片

- **BookCard（站点列表）**：`rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md`，封面 `aspect-[2/3]`，内容区 `p-3`
- **Carousel 卡片**：`rounded-lg`，封面 `aspect-[2/3]`，`ring-2 ring-amber-500/0 hover:ring-amber-500/50`，标题 `text-white`，标签 `bg-slate-700/80 text-slate-300`
- **UpdatesGrid 项**：`rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:border-amber-500/30 hover:bg-slate-800/50`

### 5.3 封面图

- 比例：统一 `aspect-[2/3]`
- 占位：无图时 `bg-muted` 或 `bg-slate-800`，居中显示书名前两字，Landing 用 `text-amber-500/50` 或 `text-amber-500/40`
- 使用 `CoverImage` 组件，`fill` + `object-cover`，按场景设 `sizes`

### 5.4 弹层与下拉

- **Dialog**：`border border-slate-700 bg-slate-900`、`rounded-lg text-slate-100`、遮罩 `bg-black/60`，动画 zoom + fade
- **DropdownMenu**：`border-slate-700 bg-slate-900 p-1 text-slate-100`、`rounded-md`、动画 zoom + fade
- 浮层在 Landing 深色背景下与 `slate-900/slate-700` 保持一致

### 5.5 阅读器工具栏

- 字体/背景切换：小按钮组，选中 `variant="default"`，未选 `variant="outline"`，`size="sm"`、`h-8 px-2 text-xs`
- 书架按钮：`variant="outline" size="sm"`，带 `Bookmark` / `BookmarkCheck` 图标

---

## 6. 页面级布局与风格

### 6.1 Landing 首页

- 整页：`min-h-screen bg-slate-950`
- Hero：`min-h-[80vh]`，背景为多层渐变（`from-slate-900 via-slate-950`、`from-amber-500/10`、`from-slate-950/70`）
- 导航：固定顶部，滚动后 `backgroundColor: rgba(2,6,23,0.85)` + `backdropFilter: blur(12px)`，`border-b border-slate-800/50`
- Logo：`font-display text-lg font-bold text-amber-400`
- Footer：`border-t border-slate-800/50 py-8`，`text-sm text-slate-500`

### 6.2 阅读器与书籍详情

- 背景：`min-h-screen bg-background`
- 顶栏：`sticky top-0 z-10 border-b bg-background/95 backdrop-blur`
- 正文区：`max-w-3xl`，内容包在 `ReadingContentWrap` 内，根据设置应用 `readingContentClassName`（白/护眼/深色 + 字号）
- 章节导航：`border-t border-current/20 pt-6`，链接 `text-primary hover:underline` 与 `text-muted-foreground hover:underline`

### 6.3 后台 Admin

- 布局：`min-h-screen bg-background`
- 顶栏：`border-b`，`h-14`，链接 `text-sm text-muted-foreground hover:text-foreground`
- 主内容：`container mx-auto px-4 py-8`
- 登录页：`max-w-sm py-16`，标题 `text-xl font-semibold`

---

## 7. 动效与交互

- **Landing 入场**：Framer Motion，`initial={{ opacity: 0, y: 24 }}` / `y: 16`，`animate={{ opacity: 1, y: 0 }}`，错开 `delay: 0.2 ~ 0.5`
- **Carousel 卡片**：`initial={{ opacity: 0, x: 20 }}`，`transition={{ delay: index * 0.05 }}`
- **导航背景**：`animate` 控制 `backgroundColor` 与 `backdropFilter`，`transition={{ duration: 0.2 }}`
- **悬停**：`transition`、`transition-colors`、`hover:scale-105`（卡片）、`hover:brightness-110`（封面）
- **焦点**：Button 等使用 `focus-visible:ring-2 focus-visible:ring-ring`

---

## 8. 无障碍与通用

- `body`：`min-h-screen antialiased font-sans`
- 全局：`* { @apply border-border; }`
- 按钮禁用：`disabled:pointer-events-none disabled:opacity-50`
- 关闭按钮等需带 `aria-label` 或 `sr-only` 文案

---

## 9. 重构时检查清单

- [ ] 继续使用 `background/foreground/primary/muted` 等语义化 token，不硬编码 hex
- [ ] Landing 深色区统一用 slate-950/900/800/700 与 amber 强调
- [ ] 阅读/后台用 theme token，支持亮暗切换
- [ ] 字体：sans = Inter，display = Cinzel，RTL/阿语 = Amiri + Cairo
- [ ] 容器：`container mx-auto px-4`，阅读 `max-w-3xl`
- [ ] Button 优先用 `buttonVariants`，Landing CTA 再覆盖 amber
- [ ] 卡片与浮层与现有圆角、边框、阴影一致（rounded-lg、border-slate-*、shadow-xl）
- [ ] 封面统一 `aspect-[2/3]` 与 `CoverImage`
- [ ] 动效：Landing 用 Framer Motion，弹层用 tailwindcss-animate

---

*文档版本：基于当前代码整理，随项目迭代可增补。*
