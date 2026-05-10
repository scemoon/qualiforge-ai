# QualiForge AI - Phase 1 任务分解

> **Phase**: 1/4
> **周期**: 第 1–2 周
> **目标**: 用户系统 + 基础文章 + 标签系统
> **对应需求**: FR-U01~U06, FR-C01~C08, FR-M01~M03
> **状态**: 🔶 进行中（主体完成，Phase 1.1 TipTap编辑器已完成）

---

## 阶段目标

完成专家注册/登录/认证、标签系统 CRUD、基础文章发布与审核流程、前台文章列表和详情展示。

---

## 任务列表

### P0 遗留（阻塞 Phase 2 启动）

#### T1-23: Admin 官方出品页面
- [ ] 开发 `/admin/official` 页面 — 复用 `ArticleNew` 组件，新建时设置 `type: 'official'`
- [ ] 路由已在 App.tsx 中注册（`/admin/official` → `ArticleNew`）
- [ ] _需求: FR-O01_

### P0 新增 — 评测榜单前台

#### T1-24: 评测榜单页面
- [ ] 开发 `/leaderboard` 页面（评测列表前台）
- [ ] 按 Skill 分组，显示模型得分、四个维度评分
- [ ] 支持排序（overallScore, correctness, security, maintainability, robustness）
- [ ] `Leaderboard` 组件不存在于 `src/web/src/pages/`
- [ ] _需求: FR-E04, FR-E05_

> **说明**：用户管理（`/admin/users`）已从产品规划中移除。
> 官方出品文章创建入口为 `/admin/official`，复用餐布局。

#### T1-01: CloudBase 环境初始化
- [x] 创建 CloudBase 环境，获取 envId
- [x] 初始化数据库集合（users, articles, article_tags, tags, sections, collections, notifications, sync_logs, wechat_config）
- [x] 配置 CloudBase Auth（邮箱密码登录）
- [x] 配置 CloudBase Storage（文件上传）
- [x] 在 `.harness/config.json` 填入 envId（cloud1-2gavd8kj8a1ce021）
- [x] 前台已部署到 `/forgeai/` 子路径，Path Passthrough 已启用
- [ ] _需求: FR-U02, FR-U03_

#### T1-02: Web 项目脚手架
- [x] 初始化 Vite + React + TypeScript 项目
- [x] 配置 Tailwind CSS + TDesign React
- [x] 配置 CloudBase JS SDK
- [x] 配置路由（React Router 6）
- [x] 配置环境变量（.env）
- [ ] _需求: FR-U01_

#### T1-03: 认证云函数开发
- [x] 开发 `cloud/auth/` 云函数（register, login, logout, getUserInfo, updateProfile）
- [x] 实现密码 bcrypt 加密（cost=10）
- [x] 实现邮箱验证 token 机制
- [x] 实现登录态校验中间件
- [ ] _需求: FR-U02, FR-U03, FR-U04_（注：邮件发送渠道未配置）

#### T1-04: 前台登录/注册页面
- [x] 开发 `/login` 登录页
- [x] 开发 `/register` 注册页（邮箱/昵称/密码）
- [x] 开发专家个人资料编辑 `/my/profile`（⚠️ 组件待验证）
- [x] 开发 Header 组件（登录状态切换）
- [ ] _需求: FR-U02, FR-U03, FR-U05_

#### T1-05: 文章云函数开发
- [x] 开发 `cloud/article-crud/` 云函数（list, get, create, update, delete）
- [x] 实现文章列表分页（page, pageSize）
- [x] 实现文章阅读量 +1（防抖）— **注意：防抖逻辑已实现但未完整测试**
- [x] 实现 Markdown 内容存储
- [x] article-crud create 已修复 data 包装问题（2026-05-10）
- [x] Vite base 配置已修正为 `/forgeai/`（与 CloudBase 静态托管子路径一致）
- [ ] _需求: FR-C01, FR-C02_

#### T1-06: 前台文章列表/详情页
- [x] 开发 `/article/search` 文章列表页（分页+标签筛选）
- [x] 开发 `/article/:id` 文章详情页（Markdown 渲染+代码高亮）
- [x] 开发 `ArticleCard` 文章卡片组件
- [x] 开发 `MarkdownRenderer` 组件（react-markdown + syntax highlighter）
- [x] 开发 `TagBadge` 标签徽章组件
- [ ] _需求: FR-C02, FR-C03_

#### T1-07: 文章审核云函数
- [x] 开发 `cloud/article-crud/` 的 approve/reject action
- [x] 实现审核通过/驳回 + 通知创建
- [x] 实现待审核列表查询
- [ ] _需求: FR-C08_

#### T1-08: 后台文章审核页面
- [x] 开发 `/admin/articles` 文章管理页（列表+状态筛选）
- [⚠] 开发 `/admin/articles/review` 审核详情页 — **未注册路由，审核逻辑合并在 AdminArticleList 弹窗中**
- [ ] _需求: FR-C08_

#### T1-09: 标签云函数 + 管理
- [x] 开发 `cloud/article-crud/` 的标签 CRUD action（list, create, update, delete）
- [x] 开发 `/admin/tags` 标签管理页
- [ ] _需求: FR-C06, FR-C07_

#### T1-10: 前台标签筛选 + 标签导航页
- [x] 文章列表页标签筛选功能（点击 TagBadge 跳转带 tag 参数）
- [x] 开发 `/tags` 标签导航页（展示所有标签 + 文章数量）
- [ ] _需求: FR-C03, FR-C07_

#### T1-11: 板块云函数 + 前台渲染
- [x] 开发 `cloud/section-crud/` 云函数（list, getAll, create, update, delete, reorder）
- [x] 实现首页公开板块查询（按 visibility 过滤）
- [x] 实现板块内容动态渲染（article_list / skill_leaderboard）
- [ ] _需求: FR-M01, FR-M02_

#### T1-12: 初始板块自动创建
- [x] 在数据库初始化脚本中创建三大初始板块
- [x] 验证首页加载时正确渲染三大板块
- [ ] _需求: FR-M03_

#### T1-13: 前台首页
- [x] 开发 `/` 首页（动态板块渲染）
- [x] 开发 `SectionBlock` 板块容器组件
- [x] 开发 `HomeLayout` 公共布局（Header + Footer）
- [ ] _需求: FR-M02_

#### T1-14: 文章发布/编辑页面（专家）
- [x] 开发 `/my/articles/new` 发布文章页
- [x] 开发 `ArticleEditor` Markdown 编辑器组件（⚠️ 原为 react-markdown，2026-05-06 已升级为 TipTap WYSIWYG）
- [x] 开发封面图上传功能
- [x] 支持选择标签
- [ ] **ArticleEdit 编辑页面 `/my/articles/:id/edit` 未实现（路由已注册但组件缺失）**
- [ ] _需求: FR-C01_

---

### P1 任务(应完成)

#### T1-15: 管理员用户管理
- [ ] 开发 `cloud/user-crud/` 云函数(list, disable, enable, promote)
- [ ] 开发 `/admin/users` 用户管理页
- [ ] _需求: FR-U06_

#### T1-16: 专家重置密码
- [ ] 开发 `cloud/auth/` 的 resetPasswordSend / resetPasswordConfirm action
- [ ] 前台"忘记密码"页面
- [ ] _需求: FR-U04_

#### T1-17: 专家个人页面
- [x] 开发 `/expert/:id` 专家主页（公开资料）
- [x] 展示该专家发布的文章列表
- [ ] _需求: （延伸）_

### P2 任务(尽量完成)

#### T1-18: 专家收藏文章
- [x] 开发 `cloud/article-crud/` 的 collect/uncollect/myCollections action
- [x] 开发 `/my/collection` 我的收藏页
- [x] 文章详情页收藏按钮
- [ ] _需求: FR-C04_

#### T1-19: 专家通知系统
- [x] 开发 `cloud/notification-crud/` 云函数
- [x] 开发 `/my/notifications` 通知中心页
- [x] Header 显示未读通知 Badge
- [ ] _需求: FR-H02_

#### T1-20: 文章阅读量统计
- [ ] 后端实现 readCount 防抖计数(同一用户同一文章 1 小时内最多 +1)
- [ ] 文章详情页阅读量展示
- [ ] _需求: FR-C05_

---

## 任务依赖图

```
T1-01 (CloudBase环境)
  └─ T1-03 (认证云函数) → T1-04 (登录注册页) ─────────────────────────┐
                                                               │
T1-02 (Web脚手架) ────────────────────────────────────────────┤
                                                               │
T1-03 (认证云函数) ────────────────────────────────────────────┤
                                                               │
T1-05 (文章云函数) ─────────────────┐                        │
                                       │                        │
T1-06 (文章列表/详情) ─────────────────┤                        │
                                       │                        │
T1-09 (标签云函数) ─────────────────────┤────────────────────────┤
                                        │                        │
T1-10 (标签筛选+导航) ←────────────────┘                        │
                                                               │
T1-11 (板块云函数) ───────────────────────┐                     │
                                          │                     │
T1-13 (前台首页) ←────────────────────────┘                     │
                                                               │
T1-07 (审核云函数) ───────────────────────┐                     │
                                       │                        │
T1-08 (后台审核页) ←─────────────────────┘                      │
                                                               │
T1-14 (文章发布页) ←──────────────────── T1-06 ─────────────────┘

T1-15 (用户管理) ← T1-03
T1-18 (收藏) ← T1-05 + T1-06
T1-19 (通知) ← T1-07
```

---

## 估算

| 任务 | 复杂度 | 预估工时 |
|------|--------|---------|
| T1-01 环境初始化 | 低 | 2h |
| T1-02 Web脚手架 | 中 | 4h |
| T1-03 认证云函数 | 高 | 6h |
| T1-04 登录注册页 | 中 | 4h |
| T1-05 文章云函数 | 高 | 6h |
| T1-06 文章列表/详情 | 高 | 8h |
| T1-07 审核云函数 | 中 | 4h |
| T1-08 后台审核页 | 中 | 4h |
| T1-09 标签云函数+管理 | 中 | 4h |
| T1-10 标签筛选+导航 | 低 | 3h |
| T1-11 板块云函数 | 中 | 4h |
| T1-12 初始板块创建 | 低 | 1h |
| T1-13 前台首页 | 高 | 6h |
| T1-14 文章发布页 | 高 | 6h |
| T1-15 用户管理 | 中 | 4h |
| T1-16 重置密码 | 中 | 3h |
| T1-17 专家主页 | 低 | 2h |
| T1-18 收藏 | 低 | 3h |
| T1-19 通知系统 | 中 | 4h |
| T1-20 阅读量统计 | 低 | 2h |
| **合计 P0** | | **58h** |
| **合计 P1** | | **13h** |
| **合计 P2** | | **9h** |

---

## 交付检查

- [ ] 用户注册 → 收到邮件验证 → 登录成功
- [ ] 专家发布文章 → 进入审核 → 管理员审核通过 → 前台显示
- [ ] 访客浏览文章列表 → 按标签筛选 → 阅读文章详情
- [ ] 首页展示三大初始板块
- [ ] 所有页面移动端布局正常
