# 部署文档

## 前置要求

- Node.js >= 14
- Tencent Cloud Base 账号

## 安装 Skill 内容

### 方式一: 使用 npm scripts

```bash
npm install
npm run install
npm run sync
```

### 方式二: 手动运行

```bash
node scripts/install.js
node scripts/sync.js
```

## 部署云函数

```bash
# 进入云函数目录
cd cloud/forge-skill

# 部署 (需要 cloudbase CLI)
cloudbase functions:deploy forge-skill
```

## 数据校验

部署前建议校验数据格式:

```bash
npm run validate
```

## 环境变量

云函数使用环境 ID: `cloud1-2gavd8kj8a1ce021`

如需修改，编辑 `scripts/*.js` 文件中的 `ENV_ID` 常量。

## 数据导出/导入

```bash
# 导出云端数据
node scripts/export.js

# 从文件导入
node scripts/import.js data/seed-skills.json
```