const cloudbase = require('@cloudbase/node-sdk')
const HEADERS = { 'Content-Type': 'application/json' }

exports.main = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' }
  }
  try {
    const app = cloudbase.init({ env: 'cloud1-2gavd8kj8a1ce021' })
    const db = app.database()
    const now = new Date()
    const results = []

    // 1. 创建评测维度
    const skills = [
      { _id: 'skill_multiturn', name: '多轮对话', description: '多轮对话能力', icon: '💬', color: '#06B6D4', enabled: true, createdAt: now },
      { _id: 'skill_inflection', name: '需求理解', description: '需求理解能力', icon: '🧠', color: '#8B5CF6', enabled: true, createdAt: now },
      { _id: 'skill_test_gen', name: '测试生成', description: '测试生成能力', icon: '🧪', color: '#EC4899', enabled: true, createdAt: now },
      { _id: 'skill_doc', name: '文档生成', description: '文档生成能力', icon: '📝', color: '#14B8A6', enabled: true, createdAt: now },
      { _id: 'skill_explain', name: '代码解释', description: '代码解释能力', icon: '💡', color: '#84CC16', enabled: true, createdAt: now },
    ]
    for (const s of skills) {
      try {
        const ex = await db.collection('skills').where({ _id: s._id }).get()
        if (!ex.data || ex.data.length === 0) {
          await db.collection('skills').add(s)
          results.push('+skill:' + s.name)
        }
      } catch(e) { results.push('err:' + e.message.substr(0, 50)) }
    }

    // 2. 获取管理员 ID
    let adminId = 'admin_qualiforge'
    try {
      const adminUser = await db.collection('users').where({ role: 'admin' }).limit(1).get()
      if (adminUser.data && adminUser.data[0]) adminId = adminUser.data[0]._id
    } catch(e) {}

    // 3. 创建官方文章
    const articles = [
      { _id: 'official_001', title: 'QualiForge 评测方法论 v2.0', type: 'official', content: '# QualiForge 评测方法论 v2.0\n\n十大核心评测维度...', coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80', authorId: adminId, status: 'approved', tags: ['tag_theory'], publishedAt: new Date('2026-04-15'), createdAt: new Date('2026-04-15'), readCount: 1280 },
      { _id: 'official_002', title: 'Claude 3.5 vs GPT-4o 深度对比', type: 'official', content: '# Claude 3.5 vs GPT-4o', coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80', authorId: adminId, status: 'approved', tags: ['tag_ai', 'tag_code'], publishedAt: new Date('2026-04-20'), createdAt: new Date('2026-04-20'), readCount: 890 },
      { _id: 'official_003', title: 'AI 代码审查实战', type: 'official', content: '# AI 代码审查实战', coverImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&q=80', authorId: adminId, status: 'approved', tags: ['tag_code', 'tag_review'], publishedAt: new Date('2026-04-25'), createdAt: new Date('2026-04-25'), readCount: 567 },
      { _id: 'official_004', title: '多模型协作编程指北', type: 'official', content: '# 多模型协作编程', coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80', authorId: adminId, status: 'approved', tags: ['tag_ai', 'tag_practice'], publishedAt: new Date('2026-04-28'), createdAt: new Date('2026-04-28'), readCount: 423 },
    ]
    for (const a of articles) {
      try {
        const ex = await db.collection('articles').where({ _id: a._id }).get()
        if (!ex.data || ex.data.length === 0) {
          await db.collection('articles').add(a)
          results.push('+article:' + a.title)
        }
      } catch(e) { results.push('err:' + e.message.substr(0, 50)) }
    }

    const allOfficial = await db.collection('articles').where({ type: 'official', status: 'approved' }).get()
    const officialIds = allOfficial.data.map(a => a._id)
    results.push('official_count:' + officialIds.length)

    // 4. 创建评测记录
    const models = [
      { name: 'GPT-4o', skillId: 'skill_code_gen', score: 92 }, { name: 'GPT-4o', skillId: 'skill_code_review', score: 88 },
      { name: 'Claude 3.5 Sonnet', skillId: 'skill_code_gen', score: 90 }, { name: 'Claude 3.5 Sonnet', skillId: 'skill_refactor', score: 93 },
      { name: 'Gemini 2.0 Pro', skillId: 'skill_code_gen', score: 88 }, { name: 'Gemini 2.0 Pro', skillId: 'skill_inflection', score: 90 },
      { name: 'Claude 3.7 Sonnet', skillId: 'skill_code_gen', score: 94 }, { name: 'Claude 3.7 Sonnet', skillId: 'skill_debug', score: 91 },
      { name: 'GPT-4.5', skillId: 'skill_doc', score: 89 }, { name: 'Gemini 2.5', skillId: 'skill_test_gen', score: 87 },
    ]
    for (const m of models) {
      try {
        const evId = 'ev_' + m.name.replace(/[^a-zA-Z0-9]/g, '') + '_' + m.skillId
        const ex = await db.collection('evaluations').where({ _id: evId }).get()
        if (!ex.data || ex.data.length === 0) {
          await db.collection('evaluations').add({ _id: evId, modelName: m.name, skillId: m.skillId, overallScore: m.score, enabled: true, createdAt: now })
          results.push('+ev:' + m.name)
        }
      } catch(e) { results.push('err:' + e.message.substr(0, 50)) }
    }

    // 5. 调整板块顺序
    await db.collection('sections').where({ _id: 'sec_003' }).update({ data: { order: 1 } })
    await db.collection('sections').where({ _id: 'sec_002' }).update({ data: { order: 2 } })
    await db.collection('sections').where({ _id: 'sec_001' }).update({ data: { order: 3 } })
    results.push('sections_reordered')

    if (officialIds.length > 0) {
      await db.collection('sections').where({ _id: 'sec_003' }).update({
        data: { config: { articleIds: officialIds, limit: officialIds.length } }
      })
    }

    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ code: 0, message: 'ok', data: { success: true, results } }) }
  } catch (err) {
    console.error('Error:', err)
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ code: 500, message: err.message }) }
  }
}
