# QualiForge AI — Web 前端架构设计

> **文档版本**: v1.0  
> **最后更新**: 2026-04-30

---

## 1. 技术选型

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.x | 核心框架 |
| Vite | 5.x | 构建工具（极速 HMR） |
| TypeScript | 5.x | 严格模式，所有源码强类型 |
| TDesign React | 3.x | 腾讯企业级组件库 |
| Tailwind CSS | 3.x | 原子化 CSS，快速样式开发 |
| React Router | 6.x | SPA 路由 |
| Zustand | 4.x | 轻量状态管理（前端全局状态） |
| TanStack Query | 5.x | 服务端状态管理（API 请求缓存） |
| React Hook Form | 7.x | 表单管理 |
| @cloudbase/js-sdk | 2.x | CloudBase Auth + Database SDK |

---

## 2. 项目结构

```
src/web/
├── public/
│   └── index.html
├── src/
│   ├── main.tsx               # 入口
│   ├── App.tsx                # 根组件 + 路由注入
│   ├── api/                   # API 调用层
│   │   ├── auth.ts           # 认证 API
│   │   ├── article.ts         # 文章 API
│   │   ├── skill.ts           # Skill API
│   │   ├── evaluation.ts      # 评测 API
│   │   ├── section.ts         # 板块 API
│   │   ├── search.ts          # 搜索 API
│   │   ├── wechat.ts          # 公众号 API
│   │   ├── notification.ts    # 通知 API
│   │   └── request.ts         # HTTP 请求封装（云函数调用）
│   ├── components/
│   │   ├── common/            # 通用组件
│   │   │   ├── Header/        # 全局顶部导航
│   │   │   ├── Footer/        # 全局页脚
│   │   │   ├── ArticleCard/   # 文章卡片
│   │   │   ├── EvaluationRow/ # 评测表格行
│   │   │   ├── TagBadge/      # 标签徽章
│   │   │   ├── MarkdownRenderer/  # Markdown 渲染器
│   │   │   ├── ScoreRing/     # 评分环形图
│   │   │   ├── SectionBlock/   # 板块容器
│   │   │   ├── SearchBar/      # 全局搜索栏
│   │   │   ├── EmptyState/    # 空状态
│   │   │   └── LoadingSkeleton/ # 骨架屏
│   │   ├── layout/            # 布局组件
│   │   │   ├── PublicLayout/  # 公开页面布局
│   │   │   └── AdminLayout/   # 管理后台布局
│   │   └── business/          # 业务组件
│   │       ├── ArticleEditor/ # Markdown 编辑器
│   │       ├── EvaluationTable/ # 评测表格
│   │       └── SectionEditor/  # 板块配置编辑器
│   ├── pages/
│   │   ├── Home/              # 首页
│   │   ├── Leaderboard/       # 评测榜单页
│   │   ├── ArticleSearch/      # 文章搜索/列表页
│   │   ├── ArticleDetail/      # 文章详情页
│   │   ├── Login/             # 登录页
│   │   ├── Register/          # 注册页
│   │   ├── ExpertProfile/      # 专家主页
│   │   ├── My/                # 专家中心（Layout）
│   │   ├── MyArticleNew/      # 发布文章页
│   │   ├── MyArticleEdit/     # 编辑文章页
│   │   ├── MyCollection/      # 我的收藏页
│   │   ├── MyNotifications/   # 通知中心页
│   │   ├── Tags/              # 标签导航页
│   │   ├── Admin/             # 管理后台（Layout）
│   │   ├── AdminDashboard/    # 控制台
│   │   ├── AdminArticleList/  # 文章管理
│   │   ├── AdminArticleReview/# 文章审核
│   │   ├── AdminSkill/        # Skill 管理
│   │   ├── AdminEvaluation/   # 评测管理
│   │   ├── AdminSection/      # 板块管理
│   │   ├── AdminTag/          # 标签管理
│   │   ├── AdminUser/         # 用户管理
│   │   ├── AdminOfficial/     # 官方出品
│   │   └── AdminWechat/       # 公众号配置
│   ├── store/
│   │   ├── authStore.ts       # 认证状态（Zustand）
│   │   ├── uiStore.ts         # UI 状态（Zustand）
│   │   └── searchStore.ts     # 搜索状态（Zustand）
│   ├── router/
│   │   ├── index.tsx          # 路由配置
│   │   ├── publicRoutes.tsx   # 公开路由
│   │   └── adminRoutes.tsx    # 管理后台路由
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── useAuth.ts          # 认证状态 Hook
│   │   ├── useArticle.ts       # 文章数据 Hook
│   │   ├── useEvaluation.ts    # 评测数据 Hook
│   │   └── useInfiniteScroll.ts # 无限滚动 Hook
│   ├── utils/
│   │   ├── cloud.ts            # CloudBase SDK 初始化
│   │   ├── auth.ts             # Auth 工具函数
│   │   ├── markdown.ts         # Markdown 解析/渲染
│   │   ├── date.ts             # 日期格式化
│   │   └── scroll.ts           # 滚动/懒加载工具
│   └── styles/
│       ├── global.css          # 全局样式
│       └── variables.css       # CSS 变量定义
├── .env.development
├── .env.production
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

---

## 3. 路由设计

### 3.1 路由表

```typescript
// router/index.tsx
const routes = [
  // 公开前台
  { path: '/', component: Home },
  { path: '/leaderboard', component: Leaderboard },
  { path: '/article/search', component: ArticleSearch },
  { path: '/article/:id', component: ArticleDetail },
  { path: '/tags', component: Tags },
  { path: '/expert/:id', component: ExpertProfile },
  
  // 认证
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  
  // 专家中心（需登录）
  { path: '/my', component: MyLayout, children: [
    { index: true, component: MyDashboard },
    { path: 'article/new', component: MyArticleNew },
    { path: 'article/:id/edit', component: MyArticleEdit },
    { path: 'collection', component: MyCollection },
    { path: 'notifications', component: MyNotifications },
  ]},
  
  // 管理后台（需 admin）
  { path: '/admin', component: AdminLayout, children: [
    { index: true, component: AdminDashboard },
    { path: 'articles', component: AdminArticleList },
    { path: 'articles/review', component: AdminArticleReview },
    { path: 'skills', component: AdminSkill },
    { path: 'evaluations', component: AdminEvaluation },
    { path: 'sections', component: AdminSection },
    { path: 'tags', component: AdminTag },
    { path: 'users', component: AdminUser },
    { path: 'official', component: AdminOfficial },
    { path: 'wechat', component: AdminWechat },
  ]},
]
```

### 3.2 路由守卫

```typescript
// 未登录重定向到 /login
<Navigate to="/login" state={{ from: location }} replace />

// 非 admin 重定向到 /
<Navigate to="/" replace />
```

---

## 4. 状态管理

### 4.1 Zustand Store

```typescript
// store/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

// store/uiStore.ts
interface UIState {
  headerVisible: boolean;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}
```

### 4.2 TanStack Query 缓存策略

```typescript
// 文章列表：缓存 5 分钟，首页重刷
useQuery({
  queryKey: ['articles', { page, tagId }],
  queryFn: () => articleApi.list({ page, pageSize: 20, tagId }),
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
})

// 评测列表：缓存 10 分钟（数据变更不频繁）
useQuery({
  queryKey: ['evaluations', { skillId }],
  staleTime: 10 * 60 * 1000,
})
```

---

## 5. API 请求封装

```typescript
// api/request.ts
const cloudbase = window.__cloudbase__

async function request<T>(functionName: string, action: string, data?: object): Promise<T> {
  const res = await cloudbase.callFunction({
    name: functionName,
    data: { action, data }
  })
  if (res.code !== 0) {
    throw new Error(res.message)
  }
  return res.data as T
}

// api/article.ts
export const articleApi = {
  list: (params: ListParams) => 
    request<ArticleListResponse>('article-crud', 'list', params),
  get: (articleId: string) => 
    request<Article>('article-crud', 'get', { articleId }),
  create: (data: CreateArticleData) => 
    request<Article>('article-crud', 'create', data),
  // ...
}
```

---

## 6. 关键组件设计

### 6.1 MarkdownRenderer

- 使用 `react-markdown` + `remark-gfm` 渲染标准 Markdown
- 代码高亮：`react-syntax-highlighter`（Prism，支持 20+ 语言）
- 数学公式：`remark-math` + `rehype-katex`（可选）
- 目录生成：解析 h2/h3 自动生成侧边目录

### 6.2 EvaluationTable

- 使用 TDesign `Table` 组件
- 可排序列头（点击切换升序/降序/无排序）
- 悬浮行显示四维雷达图（Canvas 绘制）
- 点击"查看详情"跳转文章

### 6.3 SectionBlock

- 根据 `type` 动态渲染：
  - `article_list`: 横向滚动文章卡片
  - `skill_leaderboard`: 迷你榜单
  - `custom_html`: 安全 iframe 渲染
  - `external_link`: 链接卡片

### 6.4 ArticleEditor

- 左侧 Markdown 编辑器（Textarea + 快捷工具栏）
- 右侧实时预览（react-markdown 渲染）
- 快捷工具栏：标题、列表、代码块、表格、图片上传
- 图片上传：调用 `file-upload` 云函数，返回 URL 后插入 `![](url)`

---

## 7. 移动端响应式策略

| 断点 | 布局变化 |
|------|---------|
| ≥ 992px | 三栏布局（侧边栏 + 主内容 + 可选右侧栏） |
| 768–991px | 两栏布局（侧边栏收起为 Drawer） |
| < 768px | 单栏，底部 TabBar 导航，Drawer 侧边菜单 |

### 关键响应式规则

```css
/* 桌面：左侧导航 */
.admin-sidebar { width: 240px; }

/* 平板：折叠导航 */
@media (max-width: 991px) {
  .admin-sidebar { 
    width: 0; 
    overflow: hidden; 
  }
}

/* 移动：底部 TabBar */
@media (max-width: 767px) {
  .tab-bar { display: flex; }
  .admin-sidebar { display: none; }
}
```

---

## 8. 环境变量

```bash
# .env.development
VITE_CLOUDBASE_ENV=dev-env-id
VITE_API_BASE=https://servicewechat.com

# .env.production
VITE_CLOUDBASE_ENV=prod-env-id
VITE_API_BASE=https://servicewechat.com
```
