# QualiForge AI — 安全规则设计

> **文档版本**: v1.0  
> **最后更新**: 2026-04-30

---

## 1. CloudBase 安全规则概述

CloudBase 安全规则在数据库层面强制访问控制，前端和云函数均受其约束。

---

## 2. 集合安全规则

### 2.1 users 集合

```json
{
  "users": {
    "read": "doc._openid == auth.openid || role == 'admin'",
    "create": "auth.uid != null && auth.emailVerified == true",
    "update": "doc._openid == auth.openid || role == 'admin'",
    "delete": "role == 'admin'"
  }
}
```

**说明：**
- 所有用户可读取自己的资料
- 管理员可读取所有用户资料
- 任何人可创建已验证邮箱的账号
- 用户可修改自己的资料，管理员可修改任何资料

### 2.2 articles 集合

```json
{
  "articles": {
    "read": "doc.status == 'approved' || doc.authorId == auth.uid || role == 'admin'",
    "create": "auth.uid != null",
    "update": "doc.authorId == auth.uid || role == 'admin'",
    "delete": "doc.authorId == auth.uid || role == 'admin'"
  }
}
```

**说明：**
- 已发布文章对所有人可见
- 作者和管理员可查看未发布/审核中的文章
- 登录用户可创建文章
- 仅作者和管理员可修改/删除文章

### 2.3 skills / evaluations / tags / sections 集合

```json
{
  "skills": {
    "read": "true",
    "create": "role == 'admin'",
    "update": "role == 'admin'",
    "delete": "role == 'admin'"
  }
}
```

**说明：**
- Skill、评测、标签、板块对所有人可读
- 仅管理员可写操作

### 2.4 notifications 集合

```json
{
  "notifications": {
    "read": "doc.userId == auth.uid",
    "create": "role == 'admin' || role == 'system'",
    "update": "doc.userId == auth.uid || role == 'admin'",
    "delete": "doc.userId == auth.uid || role == 'admin'"
  }
}
```

### 2.5 wechat_config / sync_logs 集合

```json
{
  "wechat_config": {
    "read": "role == 'admin'",
    "write": "role == 'admin'"
  },
  "sync_logs": {
    "read": "role == 'admin'",
    "write": "role == 'admin'"
  }
}
```

---

## 3. 云函数访问控制

云函数通过 CloudBase 登录态（Header 中携带）自动获取 `auth.uid`，无需额外校验。

```javascript
// cloud/auth/index.js
exports.main = async (event, context) => {
  const { OPENID } = cloud.cloudbase.getCloudbaseContext(context)
  // OPENID 即为当前登录用户的 openid
}
```

### 角色获取

```javascript
// 从 users 集合查询用户角色
const user = await db.collection('users').where({
  _openid: OPENID
}).get()

const role = user.data[0]?.role || 'visitor'
```

---

## 4. 密码安全

- 加密算法：`bcrypt`，cost factor = 10
- 最小密码长度：8 字符
- 密码重置 Token：64 字节随机字符串，1 小时有效期
- Token 存储：`password_reset_tokens` 集合，TTL 自动清理

---

## 5. XSS / 注入防护

### 5.1 用户输入

- 所有用户输入在存储前转义（HTML special characters）
- Markdown 内容存储原始文本，渲染时由 `react-markdown` 处理
- 文件上传：仅允许指定 MIME 类型（`image/jpeg`, `image/png`, `image/gif`, `image/webp`）

### 5.2 NoSQL 查询

- 所有查询参数使用参数化查询，禁止字符串拼接构造查询条件
- 使用 CloudBase SDK 的 `.where({ field: value })` 而非 `.where('field == ' + value)`

---

## 6. CloudBase Auth 安全配置

- 登录态持久化：`local`（浏览器 localStorage）
- 匿名登录：禁用
- 登录失败锁定：5 次失败后锁定 15 分钟（通过 `users` 集合 `enabled` 字段实现）

---

## 7. 管理员操作日志

所有管理员操作记录到 `admin_operation_logs` 集合：

```json
{
  "_id": "log_xxx",
  "operatorId": "admin_user_id",
  "operatorEmail": "admin@example.com",
  "action": "approve_article | reject_article | delete_user | ...",
  "targetId": "target_resource_id",
  "targetType": "article | user | skill | ...",
  "detail": { ... },
  "ip": "xxx.xxx.xxx.xxx",
  "createdAt": "2026-04-30T10:00:00Z"
}
```
