# Skill 创建指南

## 创建新技能

### 1. 定义技能基础信息

在 `config/skills.json` 中添加新的技能对象：

```json
{
  "id": "my-new-skill",
  "name": "新技能名称",
  "icon": "🎯",
  "color": "#XXXXXX",
  "description": "技能描述",
  "dimensions": [...],
  "languages": [...],
  "tags": [...]
}
```

### 2. 添加评测维度

每个技能需要定义评测维度：

```json
"dimensions": [
  {
    "name": "正确性",
    "weight": 0.4,
    "description": "结果正确程度"
  },
  {
    "name": "效率",
    "weight": 0.3,
    "description": "处理速度"
  },
  {
    "name": "可维护性",
    "weight": 0.3,
    "description": "代码可读性"
  }
]
```

**权重规则**：
- 所有维度权重之和必须等于 1.0
- 主要维度权重应较高

### 3. 配置支持语言

```json
"languages": ["python", "javascript", "go"]
```

### 4. 添加标签

```json
"tags": ["AI", "编程", "质量"]
```

## 更新维度定义

在 `config/dimensions.json` 中维护所有可用维度：

```json
{
  "id": "my-dimension",
  "name": "维度名称",
  "color": "#XXXXXX",
  "description": "维度描述",
  "metrics": ["metric1", "metric2"]
}
```

## 验证技能数据

运行导入脚本以验证数据格式：

```bash
npm run import -- --file config/skills.json
```

## 最佳实践

1. **ID 命名**：使用 kebab-case（如 `code-generation`）
2. **图标**：使用与技能功能相关的 emoji
3. **颜色**：选择符合技能特性的主题色
4. **权重分配**：
   - 核心维度权重 0.3-0.5
   - 次要维度权重 0.1-0.2

## 示例：创建代码审查技能

```json
{
  "id": "code-review",
  "name": "代码审查",
  "icon": "🔍",
  "color": "#F59E0B",
  "description": "评估 AI 模型审查代码的能力",
  "dimensions": [
    { "name": "问题发现", "weight": 0.4, "description": "发现问题的能力" },
    { "name": "建议质量", "weight": 0.35, "description": "建议的实用性" },
    { "name": "覆盖率", "weight": 0.25, "description": "代码覆盖程度" }
  ],
  "languages": ["python", "javascript", "java", "go", "rust"],
  "tags": ["AI", "代码审查", "质量"]
}
```