# QualiForge AI — API 契约

> **文档版本**: v1.0  
> **最后更新**: 2026-04-30

---

## API 规范

### 基础规范

- **基础 URL**: `https://{env-id}.service.cloudbase.cn/{function-name}`
- **协议**: HTTPS
- **内容类型**: `application/json`
- **认证方式**: CloudBase Auth HTTP 认证 Header
- **字符编码**: UTF-8

### 认证 Header

```http
Authorization: Bearer {CloudBase Auth Token}
```

### 统一响应格式

```typescript
// 成功
{
  code: 0,
  message: "success",
  data: { ... },
  requestId: "req_xxx"
}

// 错误
{
  code: 400 | 401 | 403 | 404 | 500,
  message: "错误描述",
  data: null,
  requestId: "req_xxx"
}
```

### 错误码

| code | 说明 |
|------|------|
| 0 | 成功 |
| 400 | 参数错误 / 参数校验失败 |
| 401 | 未登录 / 登录态过期 |
| 403 | 无权限（角色不足） |
| 404 | 资源不存在 |
| 409 | 资源冲突（如重复注册） |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

---

## auth

### register

**请求**
```json
POST /auth
{
  "action": "register",
  "data": {
    "email": "expert@example.com",
    "nickname": "AI开发者",
    "password": "SecurePass123"
  }
}
```

**响应（成功）**
```json
{
  "code": 0,
  "message": "注册成功，请查收验证邮件",
  "data": {
    "userId": "user_xxx",
    "email": "expert@example.com"
  }
}
```

### login

**请求**
```json
POST /auth
{
  "action": "login",
  "data": {
    "email": "expert@example.com",
    "password": "SecurePass123"
  }
}
```

**响应（成功）**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "cloudbase_token_xxx",
    "user": {
      "_id": "user_xxx",
      "email": "expert@example.com",
      "nickname": "AI开发者",
      "role": "expert",
      "avatar": "https://...",
      "emailVerified": true
    }
  }
}
```

### getUserInfo

**请求**
```json
POST /auth
{
  "action": "getUserInfo"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "_id": "user_xxx",
    "email": "expert@example.com",
    "nickname": "AI开发者",
    "role": "expert",
    "avatar": "https://...",
    "company": "XX科技",
    "techFields": ["JavaScript", "Python"],
    "emailVerified": true,
    "enabled": true
  }
}
```

### updateProfile

**请求**
```json
POST /auth
{
  "action": "updateProfile",
  "data": {
    "nickname": "新昵称",
    "avatar": "https://storage.xxx.com/avatar.png",
    "company": "YY科技",
    "techFields": ["Go", "Rust"]
  }
}
```

---

## article-crud

### list

**请求**
```json
POST /article-crud
{
  "action": "list",
  "data": {
    "page": 1,
    "pageSize": 20,
    "tagId": "tag_xxx",
    "keyword": "AI代码"
  }
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "_id": "article_xxx",
        "title": "AI生成代码的正确性评估",
        "coverImage": "https://...",
        "author": {
          "_id": "user_xxx",
          "nickname": "AI开发者",
          "avatar": "https://..."
        },
        "type": "normal",
        "tags": [
          { "_id": "tag_yyy", "name": "理念" }
        ],
        "readCount": 1234,
        "publishedAt": "2026-04-28T10:00:00Z"
      }
    ],
    "total": 42,
    "page": 1,
    "pageSize": 20
  }
}
```

### get

**请求**
```json
POST /article-crud
{
  "action": "get",
  "data": {
    "articleId": "article_xxx"
  }
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "_id": "article_xxx",
    "title": "AI生成代码的正确性评估",
    "content": "# 标题\n\nMarkdown正文...",
    "coverImage": "https://...",
    "author": {
      "_id": "user_xxx",
      "nickname": "AI开发者",
      "role": "expert"
    },
    "type": "normal",
    "isOfficial": false,
    "tags": [...],
    "readCount": 1235,
    "wechatSynced": false,
    "createdAt": "2026-04-28T10:00:00Z",
    "publishedAt": "2026-04-28T10:00:00Z"
  }
}
```

### create

**请求**
```json
POST /article-crud
{
  "action": "create",
  "data": {
    "title": "AI生成代码的正确性评估",
    "content": "# 标题\n\nMarkdown正文...",
    "coverImage": "https://storage.xxx.com/cover.png",
    "tagIds": ["tag_yyy", "tag_zzz"],
    "isOfficial": false
  }
}
```

### approve / reject

**请求（approve）**
```json
POST /article-crud
{
  "action": "approve",
  "data": {
    "articleId": "article_xxx"
  }
}
```

**请求（reject）**
```json
POST /article-crud
{
  "action": "reject",
  "data": {
    "articleId": "article_xxx",
    "reason": "内容包含不实数据，请修正后重新提交"
  }
}
```

### collect / uncollect

**请求**
```json
POST /article-crud
{
  "action": "collect",
  "data": {
    "articleId": "article_xxx"
  }
}
```

---

## skill-crud

### list

**请求**
```json
POST /skill-crud
{
  "action": "list"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "_id": "skill_xxx",
        "name": "代码生成",
        "description": "AI 根据自然语言描述生成代码的能力",
        "languages": ["JavaScript", "Python", "Go"],
        "tagIds": ["tag_yyy"]
      }
    ]
  }
}
```

### create

**请求**
```json
POST /skill-crud
{
  "action": "create",
  "data": {
    "name": "单元测试生成",
    "description": "AI 根据给定代码生成单元测试的能力",
    "languages": ["JavaScript", "Python", "Java", "Go"],
    "tagIds": ["tag_testing"]
  }
}
```

---

## evaluation-crud

### list

**请求**
```json
POST /evaluation-crud
{
  "action": "list",
  "data": {
    "skillId": "skill_xxx",
    "sortBy": "overallScore",
    "order": "desc",
    "page": 1,
    "pageSize": 20
  }
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "_id": "eval_xxx",
        "skillId": "skill_xxx",
        "skillName": "代码生成",
        "modelName": "GPT-4 Turbo",
        "modelVersion": "2024-04-09",
        "overallScore": 88.5,
        "dimensions": {
          "correctness": 92,
          "security": 85,
          "maintainability": 87,
          "robustness": 90
        },
        "evaluationDate": "2025-02-15",
        "datasetVersion": "v1.2",
        "articleId": "article_eval_xxx"
      }
    ],
    "total": 15
  }
}
```

### create

**请求**
```json
POST /evaluation-crud
{
  "action": "create",
  "data": {
    "skillId": "skill_xxx",
    "modelName": "Claude 3 Sonnet",
    "modelVersion": "2024-03",
    "overallScore": 86.2,
    "dimensions": {
      "correctness": 90,
      "security": 88,
      "maintainability": 82,
      "robustness": 85
    },
    "evaluationDate": "2025-03-20",
    "datasetVersion": "v1.3",
    "articleId": "article_eval_new",
    "visible": true
  }
}
```

---

## section-crud

### list

**请求**
```json
POST /section-crud
{
  "action": "list"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "_id": "section_xxx",
        "title": "Harness前沿",
        "type": "article_list",
        "config": {
          "tagIds": ["tag_idea"],
          "sortBy": "publishedAt",
          "order": "desc",
          "limit": 5
        },
        "weight": 100,
        "visibility": "public",
        "enabled": true,
        "articles": [
          { "_id": "...", "title": "...", "coverImage": "...", "publishedAt": "..." }
        ]
      }
    ]
  }
}
```

### reorder

**请求**
```json
POST /section-crud
{
  "action": "reorder",
  "data": {
    "updates": [
      { "_id": "section_a", "weight": 100 },
      { "_id": "section_b", "weight": 90 },
      { "_id": "section_c", "weight": 80 }
    ]
  }
}
```

---

## search

### search

**请求**
```json
POST /search
{
  "action": "search",
  "data": {
    "keyword": "GPT 代码生成 质量",
    "tabs": ["all", "article", "skill", "evaluation"],
    "page": 1,
    "pageSize": 20
  }
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "articles": {
      "list": [...],
      "total": 12
    },
    "skills": {
      "list": [...],
      "total": 3
    },
    "evaluations": {
      "list": [...],
      "total": 5
    }
  }
}
```

---

## wechat-sync

### sync

**请求**
```json
POST /wechat-sync
{
  "action": "sync",
  "data": {
    "articleId": "article_xxx",
    "coverImage": "https://storage.xxx.com/cover.png",
    "digest": "文章摘要..."
  }
}
```

**响应（成功）**
```json
{
  "code": 0,
  "message": "同步成功",
  "data": {
    "wechatArticleId": "media_id_xxx",
    "url": "https://mp.weixin.qq.com/s/xxx"
  }
}
```

**响应（失败）**
```json
{
  "code": 500,
  "message": "微信 API 错误: invalid credential, access_token has expired",
  "data": null
}
```

### getConfig / saveConfig

**请求（saveConfig）**
```json
POST /wechat-sync
{
  "action": "saveConfig",
  "data": {
    "appId": "wx1234567890abcdef",
    "appSecret": "abcdef1234567890..."
  }
}
```

---

## notification-crud

### list

**请求**
```json
POST /notification-crud
{
  "action": "list",
  "data": {
    "page": 1,
    "pageSize": 20
  }
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "_id": "notif_xxx",
        "type": "article_approved",
        "title": "您的文章已通过审核",
        "content": "您提交的文章《XXX》已审核通过并发布",
        "articleId": "article_xxx",
        "read": false,
        "createdAt": "2026-04-30T10:00:00Z"
      }
    ],
    "total": 5,
    "unreadCount": 2
  }
}
```
