# Forge Skill 内容模块

Forge Skill 是 Forge AI 的技能定义和管理模块，提供 Skill 评测体系的核心配置。

## 目录结构

```
forge-skill/
├── config/           # 配置文件
├── data/            # 种子数据
├── scripts/         # 管理脚本
├── validators/      # 数据校验
├── docs/            # 文档
└── test/            # 测试
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 验证数据

```bash
npm run validate
# 或
node validators/skill-validator.js
```

### 安装 Skills 到云数据库

```bash
npm run install
# 或
node scripts/install.js
```

### 同步首页板块

```bash
npm run sync
# 或
node scripts/sync.js
```

### 导出/导入数据

```bash
# 导出
node scripts/export.js

# 导入
node scripts/import.js <input-file>
```

## 配置文件说明

- `config/skills.json` - Skill 定义列表
- `config/sections.json` - 首页板块配置

## Scripts

| 命令 | 说明 |
|------|------|
| install | 安装 skills 和 sections 到云数据库 |
| sync | 同步 sections 到首页 |
| export | 导出云端数据到本地 |
| import | 从本地导入数据到云端 |
| validate | 校验配置文件格式 |
| test | 运行测试 |

## 云函数

`cloud/forge-skill/index.js` 是云函数入口，提供统一的技能评测接口。

详情见 [docs/](docs/) 目录。