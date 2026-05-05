/**
 * evaluation-crud 云函数 - 评测列表管理
 * Actions: list, get, create, update, delete, reorder
 */
const cloudbase = require('@cloudbase/node-sdk')
const { getCloudbaseContext } = require('@cloudbase/node-sdk')
const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
}

function respond(code, message, data = null) {
  return { code, message, data }
}

function getDb() {
  const app = cloudbase.init({ env: 'cloud1-2gavd8kj8a1ce021' })
  return app.database()
}



exports.main = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' }
  }

  try {
    const rawBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body; const { action, data = {} } = rawBody || event
    const db = getDb()
    const ctx = getCloudbaseContext(context)
    const OPENID = ctx.OPENID || ctx.userId || ''

    // List evaluations (public)
    if (action === 'list') {
      const { skillId, page = 1, pageSize = 50 } = data
      const skip = (page - 1) * pageSize

      let query = {}
      if (skillId) query.skillId = skillId

      const countResult = await db.collection('evaluations').where(query).count()
      const list = await db.collection('evaluations')
        .where(query)
        .orderBy('overallScore', 'desc')
        .skip(skip)
        .limit(pageSize)
        .get()

      // Enrich with skill name and article title
      const skillIds = [...new Set(list.data.map(e => e.skillId).filter(Boolean))]
      const articleIds = list.data.map(e => e.articleId).filter(Boolean)

      let skills = {}, articles = {}
      if (skillIds.length > 0) {
        const sr = await db.collection('skills').where({ _id: db.command.in(skillIds) }).get()
        sr.data.forEach(s => { skills[s._id] = s })
      }
      if (articleIds.length > 0) {
        const ar = await db.collection('articles').where({ _id: db.command.in(articleIds) }).get()
        ar.data.forEach(a => { articles[a._id] = a })
      }

      const enriched = list.data.map(e => ({
        ...e,
        skillName: skills[e.skillId]?.name || '',
        articleTitle: articles[e.articleId]?.title || '',
      }))

      return respond(0, 'success', { list: enriched, total: countResult.total })
    }

    // Get single evaluation
    if (action === 'get') {
      const { evaluationId } = data
      const evs = await db.collection('evaluations').where({ _id: evaluationId }).get()
      if (!evs.data || evs.data.length === 0) return respond(404, '评测不存在')
      return respond(0, 'success', evs.data[0])
    }

    // Create evaluation (admin only)
    if (action === 'create') {
      if (!OPENID) return respond(401, '请先登录')
      // TODO: check admin role

      const { modelName, modelVersion, skillId, overallScore, dimensions, evaluationDate, articleId, remark } = data
      if (!modelName || overallScore === undefined) {
        return respond(400, '模型名称和综合评分不能为空')
      }

      const evId = `ev_${Date.now()}`
      await db.collection('evaluations').add({
        data: {
          _id: evId,
          modelName: modelName.trim(),
          modelVersion: modelVersion || '',
          skillId: skillId || '',
          overallScore: Number(overallScore),
          dimensions: dimensions || {},
          evaluationDate: evaluationDate || new Date().toISOString().split('T')[0],
          articleId: articleId || '',
          remark: remark || '',
          enabled: true,
          createdAt: new Date(),
        }
      })
      return respond(0, '评测创建成功', { evaluationId: evId })
    }

    // Update evaluation
    if (action === 'update') {
      if (!OPENID) return respond(401, '请先登录')
      const { evaluationId, ...updateFields } = data

      const updateData = {}
      if (updateFields.modelName !== undefined) updateData.modelName = updateFields.modelName.trim()
      if (updateFields.overallScore !== undefined) updateData.overallScore = Number(updateFields.overallScore)
      if (updateFields.dimensions !== undefined) updateData.dimensions = updateFields.dimensions
      if (updateFields.enabled !== undefined) updateData.enabled = updateFields.enabled

      await db.collection('evaluations').where({ _id: evaluationId }).update({ data: updateData })
      return respond(0, '更新成功')
    }

    // Delete evaluation
    if (action === 'delete') {
      if (!OPENID) return respond(401, '请先登录')
      const { evaluationId } = data
      await db.collection('evaluations').where({ _id: evaluationId }).remove()
      return respond(0, '删除成功')
    }

    return respond(404, `Unknown action: ${action}`)
  } catch (err) {
    console.error('[Evaluation] Error:', err)
    return respond(500, `服务器错误: ${err.message}`)
  }
}
