# QualiForge AI — 数据模型设计

> **文档版本**: v1.0  
> **最后更新**: 2026-04-30

---

## 1. 集合总览

| 集合名 | 用途 | 主要索引 |
|--------|------|---------|
| `users` | 用户表（专家+管理员） | email(唯一), role, enabled |
| `articles` | 文章表 | authorId, status, type, isOfficial, createdAt |
| `article_tags` | 文章-标签关联表 | articleId, tagId |
| `skills` | Skill 定义表 | name(唯一) |
| `evaluations` | 评测列表项 | skillId, overallScore, visible |
| `tags` | 标签表 | name(唯一) |
| `sections` | 首页板块配置 | enabled, weight |
| `collections` | 收藏表 | userId, articleId |
| `notifications` | 通知表 | userId, read, createdAt |
| `sync_logs` | 公众号同步日志 | articleId, status, createdAt |
| `wechat_config` | 公众号配置 | singleton |
| `password_reset_tokens` | 密码重置 Token | token(唯一), expiresAt |
| `email_verify_tokens` | 邮箱验证 Token | token(唯一), expiresAt |

---

## 2. users 集合

### Schema

| 字段 | 类型 | 必填 | 索引 | 说明 |
|------|------|------|------|------|
| `_id` | string | 自动 | 主键 | CloudBase 自动生成 |
| `email` | string | 是 | 唯一索引 | 邮箱，登录账号 |
| `nickname` | string | 是 | — | 昵称 |
| `password` | string | 是 | — | bcrypt 加密后的密码 |
| `role` | string | 是 | 是 | `expert` / `admin` |
| `avatar` | string | 否 | — | CloudBase Storage URL |
| `company` | string | 否 | — | 公司/组织 |
| `techFields` | string[] | 否 | — | 技术领域标签数组 |
| `emailVerified` | boolean | 是 | — | 邮箱是否已验证 |
| `enabled` | boolean | 是 | 是 | 账号是否启用 |
| `createdAt` | Date | 是 | 是(降序) | 注册时间 |
| `updatedAt` | Date | 是 | — | 更新时间 |

### 安全规则

```json
{
  "users": {
    "read": "doc._openid == auth.openid || auth.uid != null",
    "write": "doc._openid == auth.openid || role == 'admin'"
  }
}
```

---

## 3. articles 集合

### Schema

| 字段 | 类型 | 必填 | 索引 | 说明 |
|------|------|------|------|------|
| `_id` | string | 自动 | 主键 | CloudBase 自动生成 |
| `title` | string | 是 | 是 | 文章标题 |
| `content` | string | 是 | — | Markdown 正文 |
| `coverImage` | string | 否 | — | 封面图 Storage URL |
| `authorId` | string | 是 | 是 | 作者 user._id |
| `type` | string | 是 | 是 | `normal` / `evaluation` / `official` |
| `status` | string | 是 | 是 | `draft` / `pending` / `approved` / `rejected` |
| `isOfficial` | boolean | 是 | — | 是否官方出品 |
| `rejectReason` | string | 否 | — | 审核驳回原因 |
| `wechatArticleId` | string | 否 | — | 公众号文章 ID（同步后填充） |
| `wechatSynced` | boolean | 是 | — | 是否已同步到公众号 |
| `readCount` | number | 是 | — | 阅读量 |
| `createdAt` | Date | 是 | 是(降序) | 创建时间 |
| `publishedAt` | Date | 否 | — | 发布时间（审核通过时） |
| `updatedAt` | Date | 是 | — | 更新时间 |

### 索引

```javascript
// 公开文章列表查询
db.collection('articles').where({
  status: 'approved'
}).orderBy('publishedAt', 'desc').skip(offset).limit(20)

// 按标签查询
db.collection('article_tags').where({ tagId: 'xxx' })
  .get()
  .then(tags => tags.map(t => t.articleId))
  .then(ids => db.collection('articles').where({
    _id: db.command.in(ids),
    status: 'approved'
  }).get())

// 按作者查询
db.collection('articles').where({
  authorId: 'userId',
  status: 'approved'
}).orderBy('publishedAt', 'desc').get()
```

### 安全规则

```json
{
  "articles": {
    "read": "doc.status == 'approved' || auth.uid == doc.authorId || role == 'admin'",
    "write": "auth.uid == doc.authorId || role == 'admin'"
  }
}
```

---

## 4. article_tags 集合

### Schema

| 字段 | 类型 | 必填 | 索引 | 说明 |
|------|------|------|------|------|
| `_id` | string | 自动 | 主键 | |
| `articleId` | string | 是 | 是 | 文章 ID |
| `tagId` | string | 是 | 是 | 标签 ID |
| `createdAt` | Date | 是 | — | 创建时间 |

### 唯一约束

`(articleId, tagId)` 联合唯一索引，防止重复关联。

---

## 5. skills 集合

### Schema

| 字段 | 类型 | 必填 | 索引 | 说明 |
|------|------|------|------|------|
| `_id` | string | 自动 | 主键 | |
| `name` | string | 是 | 唯一索引 | Skill 名称（如：代码生成） |
| `description` | string | 否 | — | 描述 |
| `languages` | string[] | 否 | — | 适用的编程语言 |
| `tagIds` | string[] | 否 | — | 关联的标签 ID |
| `createdAt` | Date | 是 | — | 创建时间 |
| `updatedAt` | Date | 是 | — | 更新时间 |

---

## 6. evaluations 集合

### Schema

| 字段 | 类型 | 必填 | 索引 | 说明 |
|------|------|------|------|------|
| `_id` | string | 自动 | 主键 | |
| `skillId` | string | 是 | 是 | 关联的 Skill._id |
| `modelName` | string | 是 | 是 | AI 模型名称 |
| `modelVersion` | string | 是 | — | 模型版本/日期 |
| `overallScore` | number | 是 | 是(降序) | 综合得分 0-100 |
| `dimensions` | object | 是 | — | 四维得分 |
| `dimensions.correctness` | number | 是 | — | 正确性 0-100 |
| `dimensions.security` | number | 是 | — | 安全性 0-100 |
| `dimensions.maintainability` | number | 是 | — | 可维护性 0-100 |
| `dimensions.robustness` | number | 是 | — | 鲁棒性 0-100 |
| `evaluationDate` | string | 是 | — | 评测日期（YYYY-MM-DD） |
| `datasetVersion` | string | 是 | — | 数据集版本 |
| `articleId` | string | 是 | — | 评测详情文章._id |
| `visible` | boolean | 是 | 是 | 是否公开 |
| `createdAt` | Date | 是 | — | 创建时间 |
| `updatedAt` | Date | 是 | — | 更新时间 |

### 索引

```javascript
// 按 Skill 查评测列表（按综合得分降序）
db.collection('evaluations').where({
  skillId: 'skillId',
  visible: true
}).orderBy('overallScore', 'desc').get()

// 所有 Skill 分组
db.collection('evaluations').where({ visible: true })
  .groupBy('skillId')
  .fields({ skillId: 1 })
```

---

## 7. tags 集合

### Schema

| 字段 | 类型 | 必填 | 索引 | 说明 |
|------|------|------|------|------|
| `_id` | string | 自动 | 主键 | |
| `name` | string | 是 | 唯一索引 | 标签名（如：理念、官方出品） |
| `alias` | string | 否 | — | 别名/搜索词 |
| `createdAt` | Date | 是 | — | 创建时间 |

---

## 8. sections 集合

### Schema

| 字段 | 类型 | 必填 | 索引 | 说明 |
|------|------|------|------|------|
| `_id` | string | 自动 | 主键 | |
| `title` | string | 是 | — | 板块标题 |
| `type` | string | 是 | — | `article_list` / `skill_leaderboard` / `custom_html` / `external_link` |
| `config` | object | 是 | — | 板块配置（见下） |
| `weight` | number | 是 | 是(降序) | 排序权重，越大越靠前 |
| `visibility` | string | 是 | — | `public` / `expert` / `admin` |
| `enabled` | boolean | 是 | 是 | 是否启用 |
| `createdAt` | Date | 是 | — | 创建时间 |
| `updatedAt` | Date | 是 | — | 更新时间 |

### config 类型定义

```typescript
// article_list 类型
interface ArticleListConfig {
  tagIds?: string[];      // 标签筛选（为空则不限）
  sortBy?: 'createdAt' | 'publishedAt' | 'readCount';
  order?: 'asc' | 'desc';
  limit?: number;         // 默认 10
}

// skill_leaderboard 类型
interface SkillLeaderboardConfig {
  skillId?: string;       // 为空则展示所有 Skill
  limit?: number;         // 默认 8
  sortBy?: 'overallScore' | 'evaluationDate';
}

// custom_html 类型
interface CustomHtmlConfig {
  html: string;           // 自定义 HTML 内容
}

// external_link 类型
interface ExternalLinkConfig {
  url: string;            // 链接地址
  target?: '_blank' | '_self';
}
```

---

## 9. collections 集合

### Schema

| 字段 | 类型 | 必填 | 索引 | 说明 |
|------|------|------|------|------|
| `_id` | string | 自动 | 主键 | |
| `userId` | string | 是 | 是 | 用户._id |
| `articleId` | string | 是 | 是 | 文章._id |
| `createdAt` | Date | 是 | — | 收藏时间 |

### 唯一约束

`(userId, articleId)` 联合唯一索引，防止重复收藏。

---

## 10. notifications 集合

### Schema

| 字段 | 类型 | 必填 | 索引 | 说明 |
|------|------|------|------|------|
| `_id` | string | 自动 | 主键 | |
| `userId` | string | 是 | 是 | 接收通知的用户._id |
| `type` | string | 是 | — | `article_approved` / `article_rejected` / `system` |
| `title` | string | 是 | — | 通知标题 |
| `content` | string | 是 | — | 通知内容 |
| `articleId` | string | 否 | — | 关联文章 ID |
| `read` | boolean | 是 | — | 是否已读 |
| `createdAt` | Date | 是 | 是(降序) | 创建时间 |

---

## 11. sync_logs 集合

### Schema

| 字段 | 类型 | 必填 | 索引 | 说明 |
|------|------|------|------|------|
| `_id` | string | 自动 | 主键 | |
| `articleId` | string | 是 | 是 | 文章._id |
| `status` | string | 是 | 是 | `success` / `failed` |
| `errorCode` | string | 否 | — | 微信 API 错误码 |
| `errorMessage` | string | 否 | — | 错误描述 |
| `wechatArticleId` | string | 否 | — | 同步后公众号文章 ID |
| `operatorId` | string | 是 | — | 操作人（管理员）._id |
| `createdAt` | Date | 是 | 是(降序) | 同步时间 |

---

## 12. wechat_config 集合

### Schema

| 字段 | 类型 | 必填 | 索引 | 说明 |
|------|------|------|------|------|
| `_id` | string | 自动 | 主键 | 固定值：`official_account_config` |
| `appId` | string | 是 | — | 微信公众号 AppID |
| `appSecret` | string | 是 | — | 微信公众号 AppSecret（加密存储） |
| `accessToken` | string | 否 | — | 缓存的 access_token |
| `accessTokenExpiresAt` | Date | 否 | — | access_token 过期时间 |
| `updatedAt` | Date | 是 | — | 更新时间 |

### 访问模式

Singleton 模式，全表只有一条记录。

---

## 13. password_reset_tokens / email_verify_tokens 集合

### Schema

| 字段 | 类型 | 必填 | 索引 | 说明 |
|------|------|------|------|------|
| `_id` | string | 自动 | 主键 | |
| `token` | string | 是 | 唯一索引 | 随机字符串（64字节） |
| `userId` | string | 是 | 是 | 关联用户._id |
| `expiresAt` | Date | 是 | 是 | 过期时间 |
| `used` | boolean | 是 | — | 是否已使用 |
| `createdAt` | Date | 是 | — | 创建时间 |

### TTL 索引

在 `expiresAt` 字段上创建 TTL 索引（TTL = 1小时），自动清理过期 token。
