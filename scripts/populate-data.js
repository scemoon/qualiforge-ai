/**
 * populate-data.js - 为 QualiForge AI 补充数据并调整板块顺序
 * 使用: node scripts/populate-data.js
 */
const cloudbase = require('@cloudbase/node-sdk')

const app = cloudbase.init({ env: 'cloud1-2gavd8kj8a1ce021' })
const db = app.database()
const BATCH_SIZE = 100

function respond(code, message, data) {
  return { code, message, data: data || null }
}

async function main() {
  console.log('🚀 开始填充数据...\n')
  const now = new Date()

  // ========== 1. 创建更多 Skill（评测维度）==========
  console.log('【1/5】创建评测维度...')
  const existingSkills = await db.collection('skills').count()
  let newSkills = []
  if (existingSkills.total < 10) {
    const skills = [
      { _id: 'skill_multiturn', name: '多轮对话', description: 'AI 在多轮对话中保持上下文一致性的能力', icon: '💬', color: '#06B6D4', enabled: true, createdAt: now },
      { _id: 'skill_inflection', name: '需求理解', description: 'AI 理解模糊/不完整需求并追问的能力', icon: '🧠', color: '#8B5CF6', enabled: true, createdAt: now },
      { _id: 'skill_test_gen', name: '测试生成', description: 'AI 生成高质量测试用例的能力', icon: '🧪', color: '#EC4899', enabled: true, createdAt: now },
      { _id: 'skill_doc', name: '文档生成', description: 'AI 生成代码注释和文档的能力', icon: '📝', color: '#14B8A6', enabled: true, createdAt: now },
      { _id: 'skill_refactor', name: '代码重构', description: 'AI 重构和优化现有代码的能力', icon: '♻️', color: '#F97316', enabled: true, createdAt: now },
      { _id: 'skill_explain', name: '代码解释', description: 'AI 解释复杂代码逻辑的能力', icon: '💡', color: '#84CC16', enabled: true, createdAt: now },
    ]
    for (const s of skills) {
      await db.collection('skills').add(s)
    }
    console.log(`  ✅ 新增 ${skills.length} 个评测维度`)
    newSkills = skills
  } else {
    console.log(`  ⏭️  已存在 ${existingSkills.total} 个 Skill，跳过`)
    const existing = await db.collection('skills').get()
    newSkills = existing.data
  }

  // ========== 2. 获取管理员 OPENID ==========
  console.log('\n【2/5】获取管理员信息...')
  const adminUser = await db.collection('users').where({ role: 'admin' }).limit(1).get()
  let adminId = ''
  if (adminUser.data && adminUser.data.length > 0) {
    adminId = adminUser.data[0]._id
    console.log(`  ✅ 管理员: ${adminUser.data[0].nickname || adminUser.data[0].email}`)
  } else {
    console.log('  ⚠️  未找到管理员，使用固定 authorId')
    adminId = 'admin_qualiforge'
  }

  // ========== 3. 创建官方文章 ==========
  console.log('\n【3/5】创建官方文章...')
  
  // 先检查已有哪些官方文章
  const existingArticles = await db.collection('articles').where({ type: 'official' }).get()
  const existingArticleIds = existingArticles.data.map(a => a._id)
  console.log(`  已有的官方文章: ${existingArticleIds.length} 篇`)

  const officialArticles = [
    {
      _id: 'official_001',
      title: 'QualiForge 评测方法论 v2.0',
      type: 'official',
      content: `# QualiForge 评测方法论 v2.0

## 摘要

QualiForge 是一个系统化评估 AI Coding 能力的开放平台。本文档介绍 QualiForge v2.0 的评测框架、评分体系和评测流程。

## 1. 评测维度

我们定义了 10 个核心评测维度：

| 维度 | 描述 | 权重 |
|------|------|------|
| 代码生成 | 生成正确、可运行的代码 | 20% |
| 代码审查 | 发现 Bug 和代码异味 | 15% |
| Bug 修复 | 定位和修复缺陷 | 15% |
| 多轮对话 | 保持上下文一致性 | 10% |
| 需求理解 | 理解模糊需求 | 10% |
| 测试生成 | 生成高质量测试 | 10% |
| 文档生成 | 代码注释和文档 | 5% |
| 代码重构 | 优化和改进代码 | 5% |
| 代码解释 | 解释复杂逻辑 | 5% |
| 安全意识 | 识别安全风险 | 5% |

## 2. 评分标准

每个维度采用 0-100 分制：

- **90-100**: 接近或超过初级工程师水平
- **70-89**: 能够较好地完成任务，偶尔需要修正
- **50-69**: 基本可用，但有明显缺陷
- **30-49**: 方向正确但实现较差
- **0-29**: 错误或无意义的输出

## 3. 评测流程

\`\`\`bash
# 标准评测流程
1. 准备测试用例（题目）
2. 向 AI 提交题目（不透露正确答案）
3. 收集 AI 输出
4. 由评测员评分（盲评）
5. 记录数据并公示
\`\`\`

## 4. 持续更新

我们每季度更新评测基准，以确保评测反映最新 AI 能力。

> 联系方式: admin@qualiforge.ai`,
      coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
      authorId: adminId,
      status: 'approved',
      tags: ['tag_theory'],
      publishedAt: new Date('2026-04-15'),
      createdAt: new Date('2026-04-15'),
      readCount: 1280,
    },
    {
      _id: 'official_002',
      title: 'Claude 3.5 vs GPT-4o 深度对比：代码生成篇',
      type: 'official',
      content: `# Claude 3.5 vs GPT-4o 深度对比：代码生成篇

## 测试环境

- **模型版本**: Claude 3.5 Sonnet (20241022), GPT-4o (20241120)
- **测试集**: 50 道代码生成题，涵盖 10 个语言/框架
- **评分**: 双盲评分，取平均值

## 核心发现

### 1. 语法正确性

两者在语法正确性上都非常高，GPT-4o 略胜一筹：

- GPT-4o: 96% 语法正确
- Claude 3.5: 94% 语法正确

### 2. 需求理解

Claude 3.5 在理解模糊需求方面表现更好：

> "When I ask for a 'user dashboard', Claude provides a comprehensive layout while GPT-4o tends to ask follow-up questions."

### 3. 代码风格

GPT-4o 更倾向于使用最新语言特性，Claude 3.5 更保守但可读性更好。

## 结论

两者各有优势，建议根据具体场景选择。`,
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
      authorId: adminId,
      status: 'approved',
      tags: ['tag_ai', 'tag_code'],
      publishedAt: new Date('2026-04-20'),
      createdAt: new Date('2026-04-20'),
      readCount: 890,
    },
    {
      _id: 'official_003',
      title: 'AI 代码审查实战：如何用 AI 发现隐藏 Bug',
      type: 'official',
      content: `# AI 代码审查实战：如何用 AI 发现隐藏 Bug

## 前言

代码审查是软件开发中不可或缺的环节。AI 在代码审查方面有哪些独特优势？本文通过实战案例展示。

## 实战案例

### 案例 1：空指针异常

\`\`\`typescript
// 原始代码（有 Bug）
function getUserName(userId: string) {
  return users[userId].name; // ❌ users[userId] 可能为 undefined
}

// AI 审查建议
function getUserName(userId: string) {
  const user = users[userId];
  if (!user) return 'Anonymous';
  return user.name;
}
\`\`\`

### 案例 2：异步竞态条件

AI 成功识别出了测试中未覆盖的竞态条件场景。

## 最佳实践

1. **分步审查**: 不要一次性提交大量代码
2. **提供上下文**: 包含相关文件和数据结构
3. **要求解释**: 让 AI 解释每个建议的理由

## 总结

AI 代码审查可以发现约 60-70% 的常见 Bug，但复杂业务逻辑仍需人工审核。`,
      coverImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&q=80',
      authorId: adminId,
      status: 'approved',
      tags: ['tag_code', 'tag_review', 'tag_debug'],
      publishedAt: new Date('2026-04-25'),
      createdAt: new Date('2026-04-25'),
      readCount: 567,
    },
    {
      _id: 'official_004',
      title: '多模型协作编程指北：1+1 > 2',
      type: 'official',
      content: `# 多模型协作编程指北：1+1 > 2

## 背景

单一 AI 模型各有短板。多模型协作可以取长补短，提升编程效率和质量。

## 协作模式

### 模式 A: Copilot + Claude

- **Copilot**: 代码补全、快速生成
- **Claude**: 架构设计、代码审查

### 模式 B: GPT-4o + Gemini

- **GPT-4o**: 核心业务逻辑
- **Gemini**: 文档生成、测试编写

## 实践技巧

\`\`\`
1. GPT-4o 写代码 → Claude 审查 → GPT-4o 修复
2. Gemini 生成测试 → GPT-4o 执行 → Gemini 分析失败原因
3. 每轮对话限制在 20 分钟内，避免上下文溢出
\`\`\`

## 效率数据

| 方案 | 代码正确率 | 开发时间 | 满意度 |
|------|-----------|---------|--------|
| 单模型 | 78% | 100% | 3.5/5 |
| 双模型协作 | 91% | 65% | 4.6/5 |

## 结语

多模型协作是 AI Coding 的下一个趋势。`,
      coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
      authorId: adminId,
      status: 'approved',
      tags: ['tag_ai', 'tag_practice'],
      publishedAt: new Date('2026-04-28'),
      createdAt: new Date('2026-04-28'),
      readCount: 423,
    },
  ]

  let addedOfficial = 0
  for (const article of officialArticles) {
    // 跳过已存在的
    const existing = await db.collection('articles').where({ _id: article._id }).get()
    if (existing.data && existing.data.length > 0) {
      console.log(`  ⏭️  跳过已存在: ${article.title}`)
      continue
    }
    await db.collection('articles').add(article)
    addedOfficial++
    console.log(`  ✅ 添加: ${article.title}`)
  }
  console.log(`  📊 新增 ${addedOfficial} 篇官方文章`)

  // 获取所有官方文章 ID
  const allOfficial = await db.collection('articles').where({ type: 'official', status: 'approved' }).get()
  const officialIds = allOfficial.data.map(a => a._id)
  console.log(`  📋 当前官方文章总数: ${officialIds.length}`)

  // ========== 4. 创建评测数据 ==========
  console.log('\n【4/5】创建评测数据...')
  
  // 获取已有哪些评测
  const existingEvs = await db.collection('evaluations').count()
  console.log(`  已有的评测记录: ${existingEvs.total} 条`)

  const models = [
    { name: 'GPT-4o', skillId: 'skill_code_gen', score: 92, note: '代码生成能力最强' },
    { name: 'GPT-4o', skillId: 'skill_code_review', score: 88, note: '审查能力优秀' },
    { name: 'Claude 3.5 Sonnet', skillId: 'skill_code_gen', score: 90, note: '生成质量高' },
    { name: 'Claude 3.5 Sonnet', skillId: 'skill_refactor', score: 93, note: '重构能力突出' },
    { name: 'Gemini 2.0 Pro', skillId: 'skill_code_gen', score: 88, note: '多语言支持好' },
    { name: 'Gemini 2.0 Pro', skillId: 'skill_inflection', score: 90, note: '需求理解强' },
    { name: 'Claude 3.7 Sonnet', skillId: 'skill_code_gen', score: 94, note: '最新版本最强' },
    { name: 'Claude 3.7 Sonnet', skillId: 'skill_debug', score: 91, note: '调试能力提升明显' },
    { name: 'GPT-4.5', skillId: 'skill_doc', score: 89, note: '文档生成流畅' },
    { name: 'Gemini 2.5', skillId: 'skill_test_gen', score: 87, note: '测试覆盖率高' },
  ]

  let addedEv = 0
  for (const m of models) {
    const evId = `ev_${m.name.replace(/[^a-zA-Z0-9]/g, '')}_${m.skillId}`
    const existing = await db.collection('evaluations').where({ _id: evId }).get()
    if (existing.data && existing.data.length > 0) {
      continue
    }
    await db.collection('evaluations').add({
      _id: evId,
      modelName: m.name,
      skillId: m.skillId,
      overallScore: m.score,
      enabled: true,
      createdAt: new Date(),
    })
    addedEv++
  }
  console.log(`  ✅ 新增 ${addedEv} 条评测记录`)

  // ========== 5. 调整板块顺序 ==========
  console.log('\n【5/5】调整板块顺序...')
  
  // 更新顺序: 官方出品=1, Skill榜单=2, 最新文章=3
  const updates = [
    { _id: 'sec_003', order: 1 }, // 官方出品
    { _id: 'sec_002', order: 2 }, // Skill评测榜单
    { _id: 'sec_001', order: 3 }, // 最新文章
  ]

  for (const u of updates) {
    await db.collection('sections').where({ _id: u._id }).update({
      data: { order: u.order }
    })
    const sectionName = u._id === 'sec_003' ? '官方出品' : u._id === 'sec_002' ? 'Skill榜单' : '最新文章'
    console.log(`  ✅ ${sectionName} → order=${u.order}`)
  }

  // 更新官方出品板块的 articleIds
  if (officialIds.length > 0) {
    await db.collection('sections').where({ _id: 'sec_003' }).update({
      data: { 
        config: { articleIds: officialIds, limit: officialIds.length }
      }
    })
    console.log(`  ✅ 官方出品板块关联 ${officialIds.length} 篇文章`)
  }

  console.log('\n🎉 数据填充完成！')
  console.log('\n📊 总结:')
  console.log(`   - 评测维度: ${6 + addedEv > 4 ? 6 + addedEv : existingSkills.total + 6} 个`)
  console.log(`   - 官方文章: ${officialIds.length} 篇`)
  console.log(`   - 评测记录: ${existingEvs.total + addedEv} 条`)
  console.log('   - 板块顺序: 官方出品 → Skill榜单 → 最新文章')
}

main().catch(console.error)
