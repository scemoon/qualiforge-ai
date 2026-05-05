/**
 * search 云函数 - 全局搜索
 * Actions: search
 */
const cloudbase = require('@cloudbase/node-sdk')
const { getCloudbaseContext } = require('@cloudbase/node-sdk')
const HEADERS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Content-Type': 'application/json' }

function respond(code, message, data = null) { return { code, message, data } }
function getDb() { return cloudbase.init({}).database() }

exports.main = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' }
  try {
    const rawBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body; const { action, data = {} } = rawBody || event
    const db = getDb()

    if (action === 'search') {
      const { keyword, type, page = 1, pageSize = 10 } = data
      if (!keyword || keyword.trim().length === 0) return respond(400, '关键词不能为空')

      const kw = keyword.trim()
      const regex = new RegExp(kw, 'i')
      const skip = (page - 1) * pageSize
      const result = {}

      // Search articles
      if (!type || type === 'article') {
        const articles = await db.collection('articles')
          .where({ title: regex, status: 'approved' })
          .field({ _id: true, title: true, coverImage: true, type: true, publishedAt: true })
          .limit(pageSize)
          .get()
        result.articles = articles.data
      }

      // Search skills
      if (!type || type === 'skill') {
        const skills = await db.collection('skills')
          .where({ name: regex, enabled: true })
          .limit(pageSize)
          .get()
        result.skills = skills.data
      }

      // Search evaluations
      if (!type || type === 'evaluation') {
        const evs = await db.collection('evaluations')
          .where({ modelName: regex, enabled: true })
          .limit(pageSize)
          .get()
        result.evaluations = evs.data
      }

      return respond(0, 'success', result)
    }

    return respond(404, `Unknown action: ${action}`)
  } catch (err) {
    console.error('[Search] Error:', err)
    return respond(500, `服务器错误: ${err.message}`)
  }
}
