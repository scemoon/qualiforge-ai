# Skill 使用文档

## 概述

Forge Skill 模块用于定义和管理 AI 技能评估。本模块不包含云函数代码，仅用于技能数据的管理和同步。

## 技能结构

每个技能包含以下字段：

| 字段 | 类型 | 描述 |
|------|------|------|
| id | string | 技能唯一标识符 |
| name | string | 技能显示名称 |
| icon | string | 技能图标（emoji） |
| color | string | 主题颜色（hex） |
| description | string | 技能描述 |
| dimensions | array | 评测维度列表 |
| languages | array | 支持的编程语言 |
| tags | array | 技能标签 |

## 维度定义

维度（dimensions）用于评估技能的具体方面，每个维度包含：

- **name**: 维度名称
- **weight**: 权重（总和应为 1.0）
- **description**: 维度描述

## 使用方法

### 导出技能数据

```bash
npm run export
```

### 导入技能数据

```bash
npm run import
```

### 部署到云端

```bash
npm run deploy
```

### 同步到首页板块

```bash
npm run sync
```

## 配置文件

- `config/skills.json`: 技能列表定义
- `config/dimensions.json`: 评测维度定义
- `data/seed-skills.json`: 初始数据

## 注意事项

- 技能数据存储在本地 `config/` 目录
- 云端同步通过脚本完成
- 所有 JSON 文件应遵循格式规范