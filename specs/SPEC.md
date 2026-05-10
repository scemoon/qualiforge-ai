# QualiForge AI - 技术规格文档 (SPEC)

> **文档版本**: v1.2
> **产品版本**: PRD v5.0 (对应)
> **状态**: Phase 1 进行中（主体完成）
> **最后更新**: 2026-05-10

---

## 文档导航

本文档为技术规格总览,各细分文档如下:

| 子文档 | 路径 | 内容 |
|--------|------|------|
| **需求文档** | `specs/requirements.md` | EARS 格式功能需求、非功能需求、验收标准 |
| **Phase 1 任务** | `specs/tasks/phase1.md` | 第 1-2 周任务分解(用户系统+文章+标签) |
| **UI 设计系统** | `design/ui/design-system.md` | 设计令牌、组件规范、交互模式 |
| **配色方案** | `design/ui/color-palette.md` | 品牌色、功能色、中性色、评测维度色 |
| **前端架构** | `design/frontend/web/architecture.md` | 技术选型、目录结构、状态管理 |
| **前台路由** | `design/frontend/web/routing.md` | 路由清单、守卫逻辑、URL 规范 |
| **API 契约** | `design/backend/api-contract.md` | 所有云函数接口的请求/响应格式 |
| **数据模型** | `design/backend/data-model.md` | 12 个 NoSQL 集合的 Schema + 索引 |
| **云函数清单** | `design/backend/cloud-functions.md` | 10 个云函数的目录结构和 Action 列表 |
| **安全规则** | `design/backend/security-rules.md` | 数据库安全规则、密码策略、XSS 防护 |

---

## 1. 技术栈总览

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | TDesign React + Vite + TypeScript | 企业级组件 + 极速构建 |
| 状态管理 | Zustand + TanStack Query | 前端状态 + 服务端状态缓存 |
| 后端运行时 | CloudBase 云函数 (Node.js 18) | 无服务器架构 |
| 数据库 | CloudBase NoSQL (MongoDB 协议) | 12 个集合 |
| 文件存储 | CloudBase Storage | 封面图、头像等 |
| 用户认证 | CloudBase Auth (邮箱密码) | bcrypt 加密 |
| 前台 CDN | CloudBase 静态托管 | SPA 部署 |
| 公众号集成 | 微信公众平台 API | 文章同步 |

---

## 2. 数据库集合总览

| # | 集合名 | 主要用途 | 管理者 |
|---|--------|---------|--------|
| 1 | `users` | 专家/管理员账号 | CloudBase Auth |
| 2 | `articles` | 文章(普通/评测详情/官方出品) | article-crud |
| 3 | `article_tags` | 文章-标签多对多关联 | article-crud |
| 4 | `skills` | Skill 定义(评测维度) | skill-crud |
| 5 | `evaluations` | 评测列表项 | evaluation-crud |
| 6 | `tags` | 全局标签 | article-crud |
| 7 | `sections` | 首页板块配置 | section-crud |
| 8 | `collections` | 收藏关系 | article-crud |
| 9 | `notifications` | 站内通知 | notification-crud |
| 10 | `sync_logs` | 公众号同步日志 | wechat-sync |
| 11 | `wechat_config` | 公众号配置(Singleton) | wechat-sync |
| 12 | `password_reset_tokens` | 密码重置 Token(TTL 1h) | auth |

---

## 3. 云函数总览

| 云函数 | Actions 数量 | 依赖集合 |
|--------|-------------|---------|
| `auth` | 8 | users, password_reset_tokens, email_verify_tokens |
| `article-crud` | 14 | articles, article_tags, tags, collections, notifications |
| `skill-crud` | 5 | skills, tags |
| `evaluation-crud` | 5 | evaluations, skills, articles |
| `section-crud` | 6 | sections, articles, evaluations, skills |
| `user-crud` | 6 | users |
| `wechat-sync` | 5 | articles, sync_logs, wechat_config |
| `file-upload` | 2 | CloudBase Storage |
| `search` | 1 | articles, skills, evaluations |
| `notification-crud` | 4 | notifications |

---

## 4. 页面路由总览

**公开前台**：10 个页面（/、/article/search、/article/:id、/tags、/expert/:id、/login、/register）
**专家中心**：5 个页面（/my/*），另有文章编辑页 `/my/articles/:id/edit` 待实现
**管理后台**：8 个页面（/admin/*），`/admin/official` 已注册（新建官方文章），评测榜单前台 `/leaderboard` 缺失

详细路由设计见 `design/frontend/web/routing.md`

---

## 5. 实施计划

| Phase | 周期 | 交付内容 | 核心交付物 |
|-------|------|---------|-----------|
| **Phase 1** | Week 1–2 | 用户系统 + 基础文章 + 标签系统 | 登录注册、文章 CRUD、审核流程、标签筛选、TipTap富文本编辑器 |
| **Phase 2** | Week 3-4 | Skill 评测系统 | Skill 管理、评测列表项、榜单前台 |
| **Phase 3** | Week 5-6 | 板块管理 + 公众号同步 | 动态板块、官方出品、公众号文章同步 |
| **Phase 4** | Week 7-8 | 完善 + 优化 + 上线 | 搜索、收藏、通知、响应式、性能、安全 |

---

## 6. 关键设计决策

| ID | 决策 | 理由 |
|----|------|------|
| LAY-01 | 前台与后台共用同一 CloudBase 环境,不同 URL 路径隔离 | 简化部署,统一认证体系 |
| AUTH-01 | 专家注册默认邮箱验证,可切换管理员审核 | 确保社区内容质量 |
| AUTH-02 | 访客不存储在 users 集合,仅专家和管理员注册 | 减少数据量 |
| ART-01 | 评测详情文章与普通文章共用 articles 集合,用 `type` 区分 | 简化查询,共享审核/发布流程 |
| ART-02 | 读量统计使用防抖(同一用户同一文章 1 小时最多 +1) | 防止刷阅读量 |
| SEC-01 | 密码 bcrypt 加密,cost=10 | 符合安全需求 |
| WX-01 | 代码块同步到公众号时转图片 | 微信代码高亮支持差 |
| DB-01 | article_tags 作为独立集合(多对多关联) | 支持多标签,查询灵活 |

---

## 7. 当前阶段

**Phase 1 — 进行中**
- CloudBase 环境 `cloud1-2gavd8kj8a1ce021` 已配置
- 14 个云函数已部署，article-crud 已修复 data 包装问题
- 前台已部署到 `/forgeai/` 子路径（Path Passthrough 启用）
- TipTap 富文本编辑器已集成（Phase 1.1 完成）
- 缺失：Admin 官方出品页面 `/admin/official`（路由已注册，组件复用 ArticleNew）、评测榜单前台 `/leaderboard`

**Phase 2 — 待启动**
前置依赖：Phase 1 收尾（官方出品页面 + 评测榜单前台）

---

*本文档为 QualiForge AI 开发唯一技术规格依据。设计文档之间的关系:requirements.md 定义需求 → SPEC.md 总览架构 → 各 design/* 子文档详细落地。*
