/**
 * init-qualiforge 云函数 - 初始化基础数据
 * 不需要 OPENID，仅供首次部署使用
 */
const cloudbase = require('@cloudbase/node-sdk')
const { getCloudbaseContext } = require('@cloudbase/node-sdk')

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
}

function respond(code, message, data) {
  return { code, message, data: data || null }
}

function getDb() {
  const app = cloudbase.init({ env: 'cloud1-2gavd8kj8a1ce021' })
  return app.database()
}

async function ensureCollection(db, collName) {
  try {
    await db.collection(collName).limit(1).get()
    return true
  } catch (e) {
    return false
  }
}

async function insertIfNotExists(db, collName, field, value, doc) {
  const existing = await db.collection(collName).where({}).get()
  if (existing.data && existing.data.length > 0) {
    return false // already has data
  }
  await db.collection(collName).add(doc)
  return true
}

exports.main = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' }
  }

  try {
    const db = getDb()
    const ctx = getCloudbaseContext(context)
    const OPENID = ctx.OPENID || 'system'
    const now = new Date()
    const results = []

    // Ensure collections exist
    const colls = ['articles', 'article_tags', 'skills', 'evaluations', 'tags', 'sections', 'collections', 'notifications', 'sync_logs', 'wechat_config', 'password_reset_tokens']
    for (let i = 0; i < colls.length; i++) {
      await ensureCollection(db, colls[i])
    }

    // Check if already initialized
    const existingSections = await db.collection('sections').get()
    if (existingSections.data.length === 0) {
      const sections = [
        { _id: 'sec_001', title: '🔥 最新文章', type: 'article_list', config: { articleIds: [], limit: 5 }, visibility: 'public', enabled: true, order: 1, createdAt: now },
        { _id: 'sec_002', title: '📊 Skill 评测榜单', type: 'skill_leaderboard', config: { skillId: '', limit: 8 }, visibility: 'public', enabled: true, order: 2, createdAt: now },
        { _id: 'sec_003', title: '⭐ 官方出品', type: 'article_list', config: { articleIds: [], limit: 5 }, visibility: 'public', enabled: true, order: 3, createdAt: now },
      ]
      for (let i = 0; i < sections.length; i++) {
        await db.collection('sections').add(sections[i])
      }
      results.push('sections: created 3 sections')
    } else {
      results.push('sections: already has ' + existingSections.data.length + ' records')
    }

    // Check skills
    const existingSkills = await db.collection('skills').get()
    if (existingSkills.data.length === 0) {
      const skills = [
        { _id: 'skill_code_gen', name: '代码生成', description: 'AI 生成代码的正确性和完整性', icon: '💻', color: '#6366F1', enabled: true, createdAt: now },
        { _id: 'skill_code_review', name: '代码审查', description: 'AI 对代码的分析和审查能力', icon: '🔍', color: '#10B981', enabled: true, createdAt: now },
        { _id: 'skill_debug', name: 'Bug 修复', description: 'AI 定位和修复 Bug 的能力', icon: '🐛', color: '#EF4444', enabled: true, createdAt: now },
        { _id: 'skill_refactor', name: '代码重构', description: 'AI 重构和优化代码的能力', icon: '♻️', color: '#F59E0B', enabled: true, createdAt: now },
      ]
      for (let i = 0; i < skills.length; i++) {
        await db.collection('skills').add(skills[i])
      }
      results.push('skills: created 4 skills')
    } else {
      results.push('skills: already has ' + existingSkills.data.length + ' records')
    }

    // Check tags
    const existingTags = await db.collection('tags').get()
    if (existingTags.data.length === 0) {
      const tags = [
        { _id: 'tag_ai', name: 'AI', color: '#6366F1', createdAt: now },
        { _id: 'tag_code', name: '代码', color: '#10B981', createdAt: now },
        { _id: 'tag_review', name: '代码审查', color: '#EF4444', createdAt: now },
        { _id: 'tag_debug', name: '调试', color: '#F59E0B', createdAt: now },
        { _id: 'tag_theory', name: '理念', color: '#0EA5E9', createdAt: now },
        { _id: 'tag_practice', name: '实践', color: '#8B5CF6', createdAt: now },
      ]
      for (let i = 0; i < tags.length; i++) {
        await db.collection('tags').add(tags[i])
      }
      results.push('tags: created 6 tags')
    } else {
      results.push('tags: already has ' + existingTags.data.length + ' records')
    }

    return respond(0, '初始化完成', { results: results })
  } catch (err) {
    console.error('[Init] Error:', err)
    return respond(500, '初始化错误: ' + err.message, null)
  }
}
