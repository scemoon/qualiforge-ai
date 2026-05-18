# API 文档

## 云函数接口

基础 URL: `cloudbase`

### 认证

通过 `X-Auth-Token` header 传递用户 token

### 登录

```
POST /
Action: login
```

请求:
```json
{
  "action": "login",
  "data": {
    "email": "user@example.com",
    "password": "password123"
  }
}
```

响应:
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "user": { ... },
    "token": "user_id"
  }
}
```

### Skill 操作

#### 获取 Skill 列表

```
POST /
Action: listSkills
```

响应:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [...],
    "total": 5
  }
}
```

### 评测操作

#### 创建评测

```
POST /
Action: createEvaluation
```

需要管理员权限。

#### 获取评测列表

```
POST /
Action: listEvaluations
```

### 板块操作

板块配置存储在 `config/sections.json`，通过 `scripts/sync.js` 同步到云数据库。

板块类型:
- `article_list` - 文章列表
- `skill_leaderboard` - Skill 排行榜
- `banner` - 横幅
- `video_list` - 视频列表