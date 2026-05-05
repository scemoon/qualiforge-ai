# QualiForge AI — Phase 1 任务分解

> **Phase**: 1/4  
> **周期**: 第 1–2 周  
> **目标**: 用户系统 + 基础文章 + 标签系统  
> **对应需求**: FR-U01~U06, FR-C01~C08, FR-M01~M03  
> **状态**: 待开始

---

## 阶段目标

完成专家注册/登录/认证、标签系统 CRUD、基础文章发布与审核流程、前台文章列表和详情展示。

---

## 任务列表

### P0 任务（必须完成）

#### T1-01: CloudBase 环境初始化
- [ ] 创建 CloudBase 环境，获取 envId
- [ ] 初始化数据库集合（users, articles, article_tags, tags, sections, collections, notifications, sync_logs, wechat_config）
- [ ] 配置 CloudBase Auth（邮箱密码登录）
- [ ] 配置 CloudBase Storage（文件上传）
- [ ] 在 `.harness/config.json` 填入 envId
- [ ] _需求: FR-U02, FR-U03_

#### T1-02: Web 项目脚手架
- [ ] 初始化 Vite + React + TypeScript 项目
- [ ] 配置 Tailwind CSS + TDesign React
- [ ] 配置 CloudBase JS SDK
- [ ] 配置路由（React Router 6）
- [ ] 配置环境变量（.env）
- [ ] _需求: FR-U01_

#### T1-03: 认证云函数开发
- [ ] 开发 `cloud/auth/` 云函数（register, login, logout, getUserInfo, updateProfile）
- [ ] 实现密码 bcrypt 加密（cost=10）
- [ ] 实现邮箱验证 token 机制
- [ ] 实现登录态校验中间件
- [ ] _需求: FR-U02, FR-U03, FR-U04_

#### T1-04: 前台登录/注册页面
- [ ] 开发 `/login` 登录页
- [ ] 开发 `/register` 注册页（邮箱/昵称/密码）
- [ ] 开发专家个人资料编辑 `/my/profile`
- [ ] 开发 Header 组件（登录状态切换）
- [ ] _需求: FR-U02, FR-U03, FR-U05_

#### T1-05: 文章云函数开发
- [ ] 开发 `cloud/article-crud/` 云函数（list, get, create, update, delete）
- [ ] 实现文章列表分页（page, pageSize）
- [ ] 实现文章阅读量 +1（防抖）
- [ ] 实现 Markdown 内容存储
- [ ] _需求: FR-C01, FR-C02_

#### T1-06: 前台文章列表/详情页
- [ ] 开发 `/article/search` 文章列表页（分页+标签筛选）
- [ ] 开发 `/article/:id` 文章详情页（Markdown 渲染+代码高亮）
- [ ] 开发 `ArticleCard` 文章卡片组件
- [ ] 开发 `MarkdownRenderer` 组件（react-markdown + syntax highlighter）
- [ ] 开发 `TagBadge` 标签徽章组件
- [ ] _需求: FR-C02, FR-C03_

#### T1-07: 文章审核云函数
- [ ] 开发 `cloud/article-crud/` 的 approve/reject action
- [ ] 实现审核通过/驳回 + 通知创建
- [ ] 实现待审核列表查询
- [ ] _需求: FR-C08_

#### T1-08: 后台文章审核页面
- [ ] 开发 `/admin/articles` 文章管理页（列表+状态筛选）
- [ ] 开发 `/admin/articles/review` 审核详情页（通过/驳回）
- [ ] _需求: FR-C08_

#### T1-09: 标签云函数 + 管理
- [ ] 开发 `cloud/article-crud/` 的标签 CRUD action（list, create, update, delete）
- [ ] 开发 `/admin/tags` 标签管理页
- [ ] _需求: FR-C06, FR-C07_

#### T1-10: 前台标签筛选 + 标签导航页
- [ ] 文章列表页标签筛选功能（点击 TagBadge 跳转带 tag 参数）
- [ ] 开发 `/tags` 标签导航页（展示所有标签 + 文章数量）
- [ ] _需求: FR-C03, FR-C07_

#### T1-11: 板块云函数 + 前台渲染
- [ ] 开发 `cloud/section-crud/` 云函数（list, getAll, create, update, delete, reorder）
- [ ] 实现首页公开板块查询（按 visibility 过滤）
- [ ] 实现板块内容动态渲染（article_list / skill_leaderboard）
- [ ] _需求: FR-M01, FR-M02_

#### T1-12: 初始板块自动创建
- [ ] 在数据库初始化脚本中创建三大初始板块
- [ ] 验证首页加载时正确渲染三大板块
- [ ] _需求: FR-M03_

#### T1-13: 前台首页
- [ ] 开发 `/` 首页（动态板块渲染）
- [ ] 开发 `SectionBlock` 板块容器组件
- [ ] 开发 `HomeLayout` 公共布局（Header + Footer）
- [ ] _需求: FR-M02_

#### T1-14: 文章发布/编辑页面（专家）
- [ ] 开发 `/my/article/new` 发布文章页
- [ ] 开发 `ArticleEditor` Markdown 编辑器组件
- [ ] 开发封面图上传功能
- [ ] 支持选择标签
- [ ] _需求: FR-C01_

---

### P1 任务（应完成）

#### T1-15: 管理员用户管理
- [ ] 开发 `cloud/user-crud/` 云函数（list, disable, enable, promote）
- [ ] 开发 `/admin/users` 用户管理页
- [ ] _需求: FR-U06_

#### T1-16: 专家重置密码
- [ ] 开发 `cloud/auth/` 的 resetPasswordSend / resetPasswordConfirm action
- [ ] 前台"忘记密码"页面
- [ ] _需求: FR-U04_

#### T1-17: 专家个人页面
- [ ] 开发 `/expert/:id` 专家主页（公开资料）
- [ ] 展示该专家发布的文章列表
- [ ] _需求: （延伸）_

### P2 任务（尽量完成）

#### T1-18: 专家收藏文章
- [ ] 开发 `cloud/article-crud/` 的 collect/uncollect/myCollections action
- [ ] 开发 `/my/collection` 我的收藏页
- [ ] 文章详情页收藏按钮
- [ ] _需求: FR-C04_

#### T1-19: 专家通知系统
- [ ] 开发 `cloud/notification-crud/` 云函数
- [ ] 开发 `/my/notifications` 通知中心页
- [ ] Header 显示未读通知 Badge
- [ ] _需求: FR-H02_

#### T1-20: 文章阅读量统计
- [ ] 后端实现 readCount 防抖计数（同一用户同一文章 1 小时内最多 +1）
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
