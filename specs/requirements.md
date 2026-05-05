# QualiForge AI — 需求文档 (requirements.md)

> **文档版本**: v1.0  
> **产品版本**: PRD v5.0 对应  
> **状态**: 已确认  
> **最后更新**: 2026-04-30

---

## 1. 概述

QualiForge AI 是一个 AI Coding 质量保障社区平台，核心目标是通过 Skill 级别评测结果展示和高质量内容聚合，帮助工程师系统化评估和提升 AI Coding 质量。

**目标用户**：AI 开发者、测试工程师、技术管理者、内容创作者

---

## 2. 用户角色

| 角色 | 标识 | 描述 | 典型场景 |
|------|------|------|---------|
| 普通访客 | visitor | 浏览所有公开内容，无需登录 | 查看评测榜单、阅读文章 |
| 专家 | expert | 注册认证后，可发表文章、参与社区 | 撰写文章、收藏内容 |
| 管理员 | admin | 全权运营社区 | 发布评测、管理用户、配置公众号 |

---

## 3. 功能需求

### 3.1 用户系统

### FR-U01: 访客浏览
**优先级:** P0  
**用户故事:** 作为访客，我希望无需登录即可浏览所有公开内容，以便快速了解社区价值。  

**验收标准:**
1. When the visitor accesses `/`, `/leaderboard`, `/article/:id`, `/article/search`, the system shall display all public content without requiring authentication.
2. The system shall display a login prompt when the visitor attempts to access expert-only pages (`/my`, `/my/article/new`).

### FR-U02: 专家注册
**优先级:** P0  
**用户故事:** 作为访客，我希望注册成为专家，以便参与社区内容建设。  

**验收标准:**
1. When the visitor submits registration form (email, nickname, password), the system shall create an expert account with status `pending`.
2. If email verification mode is enabled (default), the system shall send a verification email and set `emailVerified: false`.
3. If admin approval mode is enabled, the system shall add the account to the admin review queue.
4. After verification/approval, the system shall set the account status to `approved` and allow login.
5. If registration fields are invalid (empty email, weak password < 8 chars, duplicate email), the system shall return error code 400 with specific message.

### FR-U03: 专家登录登出
**优先级:** P0  
**用户故事:** 作为专家，我希望登录登出，以便安全访问个人功能。  

**验收标准:**
1. When the expert submits valid email + password, the system shall create a CloudBase Auth session and return user info.
2. When the expert clicks "logout", the system shall clear the local session and redirect to home.
3. If credentials are invalid, the system shall return error code 401.
4. While the expert is logged in, all requests shall automatically include the CloudBase Auth credential.

### FR-U04: 专家重置密码
**优先级:** P1  
**用户故事:** 作为专家，我希望通过邮件重置密码，以便在忘记密码时恢复账号访问。  

**验收标准:**
1. When the expert submits registered email in "forgot password" form, the system shall send a password reset email with a time-limited token (valid 1 hour).
2. When the expert submits new password + valid token, the system shall update password and invalidate the token.
3. If the token is expired or invalid, the system shall return error code 400.

### FR-U05: 专家资料编辑
**优先级:** P1  
**用户故事:** 作为专家，我希望编辑个人资料，以便展示我的专业背景。  

**验收标准:**
1. When the expert submits profile edit form (nickname, avatar, company, techFields), the system shall update the user's profile in the database.
2. If the expert uploads a new avatar, the system shall upload to CloudBase Storage and update the avatar URL.
3. While editing, the expert shall see their current profile data pre-filled.

### FR-U06: 管理员用户管理
**优先级:** P1  
**用户故事:** 作为管理员，我希望管理用户账号，以便维护社区秩序。  

**验收标准:**
1. When the admin toggles "disable" on a user, the system shall set `enabled: false` and prevent that user from logging in.
2. When the admin promotes a user to admin role, the system shall update `role: 'admin'`.
3. The admin user list shall support pagination (20 per page), search by email/nickname, and filter by role/status.

---

### 3.2 内容管理（文章 + 标签）

### FR-C01: 文章发布（专家）
**优先级:** P0  
**用户故事:** 作为专家，我希望发布文章，以便分享 AI 质量保障的理念和实践。  

**验收标准:**
1. When the expert submits a new article (title, Markdown content, cover image, tags), the system shall create an article record with status `pending`.
2. If the article requires admin approval (default), the system shall notify admins via the notification system.
3. If the article is exempt from approval (trusted expert), the system shall set status `approved` and make it publicly visible.
4. If any required field is missing (empty title, empty content), the system shall return error code 400.
5. If the expert uploads a cover image, the system shall upload to CloudBase Storage and store the URL.

### FR-C02: 文章详情展示
**优先级:** P0  
**用户故事:** 作为访客/专家，我希望阅读文章详情，以便获取高质量内容。  

**验收标准:**
1. When the visitor accesses `/article/:id`, the system shall render the Markdown content with syntax highlighting (code blocks), display cover image, author info, tags, and read count.
2. The system shall increment `readCount` by 1 on each article detail access (debounced to avoid duplicate increments from same session).
3. While the article contains Markdown code blocks, the system shall apply syntax highlighting for at least: javascript, python, typescript, java, go, bash.
4. If the article status is `pending`, `rejected`, or `draft`, the system shall return 404 (unless the viewer is the author or admin).

### FR-C03: 文章列表 + 标签筛选
**优先级:** P0  
**用户故事:** 作为访客/专家，我希望按标签筛选文章列表，以便找到感兴趣的内容。  

**验收标准:**
1. When the visitor accesses `/article/search`, the system shall display all approved articles in reverse chronological order with pagination (20 per page).
2. When the visitor clicks a tag filter, the system shall display only articles containing that tag.
3. When the visitor enters a keyword search, the system shall search article titles and display matching results.
4. The article list shall display: title, cover thumbnail, author nickname, published date, tag badges.
5. If no articles match the filter, the system shall display an empty state with suggested actions.

### FR-C04: 文章收藏
**优先级:** P2  
**用户故事:** 作为专家，我希望收藏文章，以便日后回顾。  

**验收标准:**
1. When the expert clicks the "收藏" button on an article, the system shall create a collection record linking user and article.
2. When the expert clicks "取消收藏", the system shall delete the collection record.
3. When the expert accesses `/my/collection`, the system shall display all collected articles in reverse chronological order.

### FR-C05: 文章阅读量统计
**优先级:** P2  
**用户故事:** 作为内容运营者，我希望看到文章的阅读量，以便评估内容影响力。  

**验收标准:**
1. When any visitor or logged-in user accesses an article detail page, the system shall increment the article's `readCount` field in the database.
2. The readCount increment shall be debounced (same user same article, max 1 increment per hour).

### FR-C06: 标签系统
**优先级:** P0  
**用户故事:** 作为系统管理员，我希望管理全局标签，以便灵活组织内容。  

**验收标准:**
1. When the admin creates/edits/deletes a tag (name, alias), the system shall update the tag in the database.
2. Each tag shall have a unique name; duplicate names shall be rejected with error code 400.
3. When the admin deletes a tag, the system shall remove the tag from all associated articles and skills.

### FR-C07: 标签导航
**优先级:** P1  
**用户故事:** 作为访客，我希望通过标签云找到相关内容，以便探索社区内容。  

**验收标准:**
1. When the visitor accesses the tag navigation page (`/tags`), the system shall display all tags with article count.
2. When the visitor clicks a tag, the system shall navigate to `/article/search?tag=:tagId` with that tag pre-selected.

### FR-C08: 文章审核（管理员）
**优先级:** P1  
**用户故事:** 作为管理员，我希望审核专家文章，以便确保内容质量。  

**验收标准:**
1. When the admin approves an article, the system shall set status `approved` and `publishedAt` to current timestamp.
2. When the admin rejects an article, the system shall set status `rejected` and store the `rejectReason` provided by admin.
3. The system shall notify the article author via the notification system (approve/reject result).
4. The admin review queue shall display pending articles with author info and submission time.

---

### 3.3 Skill 评测系统

### FR-E01: Skill 管理
**优先级:** P0  
**用户故事:** 作为管理员，我希望管理 Skill 定义，以便维护评测对象的结构化信息。  

**验收标准:**
1. When the admin creates a Skill (name, description, applicable languages, tags), the system shall create a Skill record.
2. When the admin edits/deletes a Skill, the system shall update/delete the record.
3. If a Skill has associated evaluation records, deleting the Skill shall be blocked with error code 400.

### FR-E02: 评测列表项管理
**优先级:** P0  
**用户故事:** 作为管理员，我希望录入评测数据，以便在社区展示客观的评测结果。  

**验收标准:**
1. When the admin creates an evaluation record (skillId, model name, model version, overallScore, four dimension scores, evaluationDate, datasetVersion, articleId), the system shall validate all fields.
2. The `overallScore` shall be validated as a number between 0 and 100.
3. The `articleId` shall reference an existing article of type `evaluation`.
4. When the admin toggles `visible: false`, the evaluation shall be hidden from public leaderboard.
5. The evaluation list shall support CRUD operations from admin panel.

### FR-E03: 评测详情文章撰写
**优先级:** P0  
**用户故事:** 作为管理员，我希望撰写评测详情文章，以便详细展示评测方法和结果分析。  

**验收标准:**
1. When the admin creates an article and marks `type: 'evaluation'`, the system shall set `isEvaluation: true`.
2. The evaluation article shall support full Markdown including tables, charts (via images), and code blocks.
3. When the admin links an evaluation article to an evaluation record, the system shall create the bidirectional reference.

### FR-E04: 评测列表前台展示
**优先级:** P0  
**用户故事:** 作为访客，我希望查看 Skill 评测榜单，以便了解各 AI 工具的质量表现。  

**验收标准:**
1. When the visitor accesses `/leaderboard`, the system shall display all visible evaluations grouped by Skill.
2. When the visitor selects a specific Skill from the dropdown, the system shall display all models ranked by `overallScore` in a table.
3. Each row shall display: model name + version, overall score, four dimension scores (correctness, security, maintainability, robustness), evaluation date, dataset version, "查看详情" link.
4. When the visitor clicks "查看详情", the system shall navigate to the linked evaluation article.
5. At the top of the leaderboard page, the system shall display a "评测方法论" link pointing to the designated methodology article.

### FR-E05: 评测排序
**优先级:** P1  
**用户故事:** 作为访客，我希望按不同维度排序评测结果，以便深入分析。  

**验收标准:**
1. When the visitor clicks a column header (overall score, correctness, security, maintainability, robustness) in the evaluation table, the system shall sort the rows by that column in descending order.
2. The currently sorted column shall display a sort indicator (↑/↓).

### FR-E06: 评测可见性控制
**优先级:** P1  
**用户故事:** 作为管理员，我希望控制评测的公开状态，以便在发布前预览。  

**验收标准:**
1. When the admin sets `visible: false` on an evaluation, the system shall exclude it from all public leaderboard queries.
2. When the admin accesses the admin evaluation list, the system shall display all evaluations regardless of visibility.

---

### 3.4 自定义板块管理

### FR-M01: 板块 CRUD
**优先级:** P0  
**用户故事:** 作为管理员，我希望自定义首页板块，以便灵活组织首页内容呈现。  

**验收标准:**
1. When the admin creates a section (title, type, config, weight, visibility, enabled), the system shall create a section record.
2. Supported section types: `article_list`, `skill_leaderboard`, `custom_html`, `external_link`.
3. While a section has `enabled: true` and appropriate visibility for the current user role, it shall appear on the home page.
4. The admin section list shall support drag-to-reorder (weight update).

### FR-M02: 首页板块渲染
**优先级:** P0  
**用户故事:** 作为访客/专家，我希望在首页看到精选板块内容，以便快速获取高价值信息。  

**验收标准:**
1. When the visitor accesses `/`, the system shall fetch all sections where `enabled: true` and `visibility: 'public'` (or expert/admin role).
2. The sections shall be rendered in descending order of `weight`.
3. Each section type shall render its content appropriately:
   - `article_list`: displays article cards based on config (tag filter, limit)
   - `skill_leaderboard`: displays top N models for a given Skill
   - `custom_html`: renders the raw HTML in an iframe or sandbox
   - `external_link`: displays a clickable card linking to external URL

### FR-M03: 初始板块配置
**优先级:** P0  
**用户故事:** 作为系统，我希望首次安装自动创建三大板块，以便首页开箱即用。  

**验收标准:**
1. On first deployment, the system shall automatically create three sections:
   - Section 1: title="Harness前沿", type=`article_list`, config=`{tag: "理念", limit: 5}`, weight=100, visibility=`public`
   - Section 2: title="Skill评测", type=`skill_leaderboard`, config=`{skillName: "代码生成", limit: 8}`, weight=90, visibility=`public`
   - Section 3: title="官方出品", type=`article_list`, config=`{tag: "官方出品", limit: 5}`, weight=80, visibility=`public`

---

### 3.5 官方出品

### FR-O01: 官方出品发布
**优先级:** P0  
**用户故事:** 作为管理员，我希望发布官方出品文章，以便展示社区官方推荐的工具和最佳实践。  

**验收标准:**
1. When the admin creates an article and marks `isOfficial: true`, the system shall set `type: 'official'`.
2. The official article shall not require approval (immediate publication).
3. The official article shall be automatically tagged with the "官方出品" tag.

### FR-O02: 官方出品前台展示
**优先级:** P0  
**用户故事:** 作为访客，我希望查看官方出品板块，以便获取社区官方推荐内容。  

**验收标准:**
1. The official articles shall appear in the "官方出品" section on the home page (Section 3).
2. When the visitor accesses `/article/search` with the "官方出品" tag filter, the system shall display all official articles.
3. Official articles shall display an "官方出品" badge in the article card and detail page.

### FR-O03: 官方出品文章详情
**优先级:** P0  
**用户故事:** 作为访客，我希望阅读官方出品文章详情，以便了解官方推荐的详细内容。  

**验收标准:**
1. When the visitor accesses an official article detail page (`/article/:id`), the system shall render the full Markdown content identically to a normal article.
2. The article detail page shall display an "官方出品" badge and the official account QR code at the bottom.

---

### 3.6 公众号投放

### FR-W01: 公众号配置管理
**优先级:** P0  
**用户故事:** 作为管理员，我希望配置微信公众号，以便后续同步文章内容。  

**验收标准:**
1. When the admin saves the official account configuration (AppID, AppSecret), the system shall store it in the `wechat_config` collection.
2. The system shall validate the AppID/AppSecret by attempting to obtain an access token from WeChat API.
3. If validation fails, the system shall return error code 400 with the specific API error message.
4. Only one `wechat_config` record shall exist (singleton).

### FR-W02: 文章同步到公众号
**优先级:** P0  
**用户故事:** 作为管理员，我希望一键将文章同步到公众号，以便扩大内容影响力。  

**验收标准:**
1. When the admin publishes an article and toggles "同步到公众号", the system shall call `wechat-sync/sync` after successful publication.
2. The system shall convert the Markdown article to WeChat article format (HTML):
   - Code blocks shall be converted to images or preserved with WeChat code plugin
   - Images shall be uploaded to WeChat permanent media library
3. After successful sync, the system shall store `wechatArticleId` and `wechatSynced: true` on the article, and log the result to `sync_logs`.
4. If sync fails, the system shall store the error in `sync_logs` and display the error message to the admin.
5. The article detail page shall display "本文已同步至公众号" with a QR code if `wechatSynced: true`.

### FR-W03: 同步日志查看
**优先级:** P1  
**用户故事:** 作为管理员，我希望查看同步历史，以便排查同步问题。  

**验收标准:**
1. When the admin accesses `/admin/wechat/logs`, the system shall display a paginated list of sync records from `sync_logs`.
2. Each record shall display: article title, sync time, status (success/fail), error message (if any).

---

### 3.7 搜索与通知

### FR-H01: 全局搜索
**优先级:** P1  
**用户故事:** 作为访客/专家，我希望通过关键词搜索，以便快速找到内容。  

**验收标准:**
1. When the visitor enters a keyword in the global search bar, the system shall search across: article titles, article content (full-text), tag names, Skill names, model names.
2. The search results shall be categorized into tabs: 全部 / 文章 / Skill / 评测.
3. Each search result shall display a title, snippet, and category badge.

### FR-H02: 专家通知
**优先级:** P2  
**用户故事:** 作为专家，我希望收到系统通知，以便及时了解文章审核结果。  

**验收标准:**
1. When the admin approves or rejects an article, the system shall create a notification record for the article author.
2. When the expert accesses `/my/notifications`, the system shall display all unread notifications with a badge count on the top navigation.
3. When the expert clicks a notification, the system shall mark it as read and navigate to the relevant article.

---

## 4. 非功能需求

### NFR-01: 性能
- The leaderboard page shall load the initial screen within 2 seconds (WiFi environment).
- The article list page shall load within 2 seconds (WiFi environment).
- The system shall support 100 concurrent requests without degradation.

### NFR-02: 安全性
- All user input shall be sanitized to prevent XSS/injection attacks.
- User passwords shall be hashed using bcrypt with cost factor 10.
- Admin operations (user disable, content delete) shall be logged.
- CloudBase security rules shall enforce data access control.

### NFR-03: 可用性
- All public pages shall be responsive for mobile (320px–1440px viewport).
- User documentation and admin manual shall be provided.
- All interactive elements shall have appropriate loading and error states.

### NFR-04: 可扩展性
- The evaluation data structure shall support adding new scoring dimensions without schema migration.
- New section types shall be configurable without code changes (via database config).

### NFR-05: 移动端响应式
- All public pages shall render correctly on mobile browsers.
- The touch target size shall be at least 44px for all interactive elements.

---

## 5. 数据需求

| 数据实体 | 来源 | 存储位置 | 访问模式 |
|---------|------|---------|---------|
| 用户 (users) | 专家注册、管理员创建 | CloudBase NoSQL | 读写，需认证 |
| 文章 (articles) | 专家/管理员发布 | CloudBase NoSQL | 公开读，专家/管理员写 |
| Skill (skills) | 管理员录入 | CloudBase NoSQL | 公开读，管理员写 |
| 评测项 (evaluations) | 管理员录入 | CloudBase NoSQL | 公开读（按visible），管理员写 |
| 标签 (tags) | 管理员录入 | CloudBase NoSQL | 公开读，管理员写 |
| 文章-标签关联 (article_tags) | 文章发布时关联 | CloudBase NoSQL | 随文章读取 |
| 首页板块 (sections) | 管理员配置 | CloudBase NoSQL | 公开读（按visibility），管理员写 |
| 收藏 (collections) | 专家收藏 | CloudBase NoSQL | 专家读写 |
| 通知 (notifications) | 系统生成 | CloudBase NoSQL | 专家私有读写 |
| 同步日志 (sync_logs) | 同步操作记录 | CloudBase NoSQL | 管理员读写 |
| 公众号配置 (wechat_config) | 管理员录入 | CloudBase NoSQL | 管理员读写 |

---

## 6. 约束与假设

1. **评测数据来源：** 评测数据由管理员通过外部方式（人工测试或自动化脚本）生成后录入，不在社区内动态执行评测任务。
2. **无用户 API Key 管理：** 官方网站不提供评测任务提交和用户 API Key 管理功能。
3. **专家注册验证方式：** 默认采用邮箱验证，可切换为管理员审核模式（通过配置开关）。
4. **文章审核流程：** 专家文章默认需要管理员审核，可配置为信任专家免审。
5. **公众号同步：** 同步依赖微信官方 API，需管理员提供有效的 AppID + AppSecret。
6. **内容安全：** 所有用户生成内容（UGC）需经过审核或过滤后才能公开展示。

---

## 7. 验收标准核对清单

| ID | 验收项 | 对应需求 |
|----|--------|---------|
| AC-01 | 普通访客可查看评测列表页，按 Skill 筛选，查看各模型得分，点击进入评测详情文章 | FR-E04 |
| AC-02 | 普通访客可使用标签筛选文章列表 | FR-C03 |
| AC-03 | 访客可注册成为专家，并收到验证邮件 | FR-U02 |
| AC-04 | 专家登录后可发表普通文章，文章进入待审核列表 | FR-U03, FR-C01 |
| AC-05 | 管理员可审核专家文章（通过/驳回），通过后的文章在前台显示 | FR-C08 |
| AC-06 | 管理员可创建 Skill、添加评测列表项（选择关联文章或新建文章） | FR-E01, FR-E02 |
| AC-07 | 管理员可发布官方出品文章，该文章出现在"官方出品"板块 | FR-O01, FR-M02 |
| AC-08 | 管理员发布文章时可选择同步到公众号，公众号正常收到图文消息 | FR-W01, FR-W02 |
| AC-09 | 首页三大板块（Harness前沿、Skill评测、官方出品）正常展示内容 | FR-M03 |
| AC-10 | 所有公开页面在移动端布局正常 | NFR-05 |

---

*本文档为 QualiForge AI 开发的唯一需求依据，所有实现需满足上述验收标准。*
