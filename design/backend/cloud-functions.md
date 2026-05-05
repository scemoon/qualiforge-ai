# QualiForge AI — 云函数清单

> **文档版本**: v1.0  
> **最后更新**: 2026-04-30

---

## 云函数总览

| 云函数 | 类型 | 职责 | 调用频率 |
|--------|------|------|---------|
| `auth` | HTTP | 用户认证（注册/登录/密码重置） | 高 |
| `article-crud` | HTTP | 文章 CRUD + 审核 + 标签 + 收藏 | 高 |
| `skill-crud` | HTTP | Skill CRUD | 中 |
| `evaluation-crud` | HTTP | 评测列表项 CRUD | 中 |
| `section-crud` | HTTP | 首页板块 CRUD | 低 |
| `user-crud` | HTTP | 用户管理（管理员） | 低 |
| `wechat-sync` | HTTP | 公众号文章同步 | 低 |
| `file-upload` | HTTP | 文件上传（封面图等） | 中 |
| `search` | HTTP | 全局搜索 | 中 |
| `notification-crud` | HTTP | 通知管理 | 中 |

---

## auth

**路径**: `cloud/auth/`

### Actions

| Action | 权限 | 说明 |
|--------|------|------|
| `register` | 公开 | 专家注册 |
| `login` | 公开 | 邮箱密码登录 |
| `logout` | 需登录 | 登出 |
| `getUserInfo` | 需登录 | 获取当前用户信息 |
| `updateProfile` | 需登录 | 更新个人资料 |
| `resetPasswordSend` | 公开 | 发送重置密码邮件 |
| `resetPasswordConfirm` | 公开 | 确认新密码（带 token） |
| `verifyEmail` | 公开 | 邮箱验证激活账号 |
| `refreshToken` | 需登录 | 刷新登录态 |

### 目录结构

```
cloud/auth/
├── index.js         # 入口，路由分发
├── register.js      # 注册逻辑
├── login.js         # 登录逻辑
├── password.js      # 密码重置
└── utils.js         # 共享工具（密码哈希、token 生成）
```

---

## article-crud

**路径**: `cloud/article-crud/`

### Actions

| Action | 权限 | 说明 |
|--------|------|------|
| `list` | 公开 | 文章列表（分页+标签筛选） |
| `get` | 公开 | 文章详情（含阅读量+1） |
| `create` | expert+ | 创建文章 |
| `update` | 作者/admin | 更新文章 |
| `delete` | 作者/admin | 删除文章 |
| `approve` | admin | 审核通过 |
| `reject` | admin | 审核驳回（带原因） |
| `listPending` | admin | 待审核列表 |
| `listMyArticles` | expert+ | 我的文章列表 |
| `collect` | expert+ | 收藏文章 |
| `uncollect` | expert+ | 取消收藏 |
| `myCollections` | expert+ | 我的收藏列表 |

### 目录结构

```
cloud/article-crud/
├── index.js           # 入口，路由分发
├── article.js         # 文章 CRUD
├── review.js          # 审核流程
├── tag.js             # 标签 CRUD
├── collection.js      # 收藏
└── utils.js           # Markdown 处理工具
```

---

## skill-crud

**路径**: `cloud/skill-crud/`

### Actions

| Action | 权限 | 说明 |
|--------|------|------|
| `list` | 公开 | Skill 列表 |
| `get` | 公开 | Skill 详情 |
| `create` | admin | 创建 Skill |
| `update` | admin | 更新 Skill |
| `delete` | admin | 删除 Skill（有评测关联则拒绝） |

### 目录结构

```
cloud/skill-crud/
├── index.js    # 入口
└── skill.js    # Skill CRUD
```

---

## evaluation-crud

**路径**: `cloud/evaluation-crud/`

### Actions

| Action | 权限 | 说明 |
|--------|------|------|
| `list` | 公开 | 评测列表（可按 Skill 过滤） |
| `get` | 公开 | 评测详情 |
| `create` | admin | 创建评测项 |
| `update` | admin | 更新评测项 |
| `delete` | admin | 删除评测项 |

### 目录结构

```
cloud/evaluation-crud/
├── index.js        # 入口
├── evaluation.js   # 评测 CRUD
└── utils.js        # 得分计算工具
```

---

## section-crud

**路径**: `cloud/section-crud/`

### Actions

| Action | 权限 | 说明 |
|--------|------|------|
| `list` | 公开 | 公开板块列表（按权重+可见性过滤） |
| `getAll` | admin | 所有板块（含仅管理员可见） |
| `create` | admin | 创建板块 |
| `update` | admin | 更新板块 |
| `delete` | admin | 删除板块 |
| `reorder` | admin | 批量更新权重（拖拽排序） |

### 目录结构

```
cloud/section-crud/
├── index.js       # 入口
└── section.js     # 板块 CRUD + 渲染逻辑
```

---

## user-crud

**路径**: `cloud/user-crud/`

### Actions

| Action | 权限 | 说明 |
|--------|------|------|
| `list` | admin | 用户列表（分页+搜索+筛选） |
| `get` | admin | 用户详情 |
| `disable` | admin | 禁用账号 |
| `enable` | admin | 启用账号 |
| `promote` | admin | 提升为管理员 |
| `getStats` | admin | 获取用户统计数据（总注册/活跃/专家数） |

### 目录结构

```
cloud/user-crud/
├── index.js    # 入口
└── user.js     # 用户管理
```

---

## wechat-sync

**路径**: `cloud/wechat-sync/`

### Actions

| Action | 权限 | 说明 |
|--------|------|------|
| `sync` | admin | 同步单篇文章到公众号 |
| `getLogs` | admin | 同步日志列表 |
| `getConfig` | admin | 获取公众号配置 |
| `saveConfig` | admin | 保存公众号配置（AppID/AppSecret） |
| `validateConfig` | admin | 验证公众号配置（获取 access_token 测试） |

### 目录结构

```
cloud/wechat-sync/
├── index.js          # 入口
├── sync.js           # 文章同步核心逻辑
├── markdown2html.js  # Markdown → 微信 HTML 转换器
├── wechat-api.js     # 微信 API 封装（access_token、图文上传）
└── config.js         # 公众号配置管理
```

---

## file-upload

**路径**: `cloud/file-upload/`

### Actions

| Action | 权限 | 说明 |
|--------|------|------|
| `upload` | 需登录 | 上传图片/文件 |
| `delete` | 需登录 | 删除已上传文件（本人上传的） |

### 目录结构

```
cloud/file-upload/
├── index.js    # 入口
└── upload.js   # 文件上传逻辑
```

### 安全约束

- 仅允许：`jpg`, `jpeg`, `png`, `gif`, `webp`, `svg`
- 单文件最大：5MB
- 存储路径：`/uploads/{userId}/{year}/{month}/{filename}`
- 公开读取 URL，自动生成 CDN 链接

---

## search

**路径**: `cloud/search/`

### Actions

| Action | 权限 | 说明 |
|--------|------|------|
| `search` | 公开 | 全局搜索（文章+Skill+评测） |

### 目录结构

```
cloud/search/
├── index.js      # 入口
└── search.js     # 搜索逻辑（NoSQL 正则 + 多集合查询）
```

---

## notification-crud

**路径**: `cloud/notification-crud/`

### Actions

| Action | 权限 | 说明 |
|--------|------|------|
| `list` | expert+ | 我的通知列表 |
| `markRead` | expert+ | 标记已读 |
| `markAllRead` | expert+ | 全部已读 |
| `unreadCount` | expert+ | 未读数量 |
| `create` | system | 系统创建通知（审核结果等） |

### 目录结构

```
cloud/notification-crud/
├── index.js         # 入口
└── notification.js  # 通知管理
```

---

## utils（共享模块）

**路径**: `cloud/utils/`

```
cloud/utils/
├── response.js   # 统一响应格式 { code, message, data }
├── auth.js       # OPENID 获取、登录态校验中间件
├── validator.js  # 参数校验（email, password, etc.）
└── date.js       # 日期格式化工具
```

### 统一响应格式

```javascript
// 成功
{ code: 0, message: 'success', data: {...} }

// 错误
{ code: 400, message: '参数错误: email 不能为空', data: null }
```
