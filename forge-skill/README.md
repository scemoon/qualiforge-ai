# forge-skill

Forge AI 技能系统 - 统一调度平台所有技能。

## 概述

forge-skill 是 forge-ai 平台的技能系统，提供了统一的技能调度层，将平台的各项能力（认证、文章、评测、标签等）封装为可调用的技能接口。

## 目录结构

```
forge-skill/
├── index.js              # 主入口 - skill 调度器
├── skills/               # 技能实现
│   ├── auth.js           # 认证技能
│   ├── article.js        # 文章技能
│   ├── evaluation.js     # 评测技能
│   ├── tag.js            # 标签技能
│   └── skill.js          # 技能管理技能
├── config/               # 配置
│   └── capabilities.json # 平台能力定义
├── scripts/              # 脚本
│   └── register.js       # 注册所有 skills
├── docs/                 # 文档
└── test/                 # 测试
```

## 技能列表

| 技能 | 描述 | Actions |
|------|------|---------|
| auth | 用户认证 | login, register, logout, resetPassword |
| article | 文章管理 | create, read, update, delete, list, publish |
| evaluation | 评测管理 | create, list, get, approve |
| tag | 标签管理 | create, list, delete |
| skill | 技能管理 | register, list, invoke |

## 使用方法

```javascript
const forgeSkill = require('./forge-skill')

// 调用技能
forgeSkill.main({
  skill: 'auth',
  action: 'login',
  params: { email: 'xxx', password: 'xxx' }
}, context)
```

## 部署

```bash
npm install
npm run register
```