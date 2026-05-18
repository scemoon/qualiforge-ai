# Capabilities

平台能力定义，定义所有可用技能及其支持的 actions。

## 版本

v1.0

## 平台

forge-ai

## 能力列表

| 名称 | 描述 | Actions |
|------|------|---------|
| auth | 用户认证 | login, register, logout, resetPassword |
| article | 文章管理 | create, read, update, delete, list, publish |
| evaluation | 评测管理 | create, list, get, approve |
| tag | 标签管理 | create, list, delete |
| skill | 技能管理 | register, list, invoke |

## 扩展能力

如需扩展新的技能，需：

1. 在 `skills/` 目录创建新的 skill 文件
2. 在 `config/capabilities.json` 中添加能力定义
3. 在 `index.js` 中引入并注册技能