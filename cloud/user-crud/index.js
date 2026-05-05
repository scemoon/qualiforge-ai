/**
 * user-crud 云函数 - 用户管理（管理员）
 * Actions: list, get, disable, enable, promote
 */
const cloudbase = require('@cloudbase/node-sdk')
const { getCloudbaseContext } = require('@cloudbase/node-sdk')
const { getCloudbaseContext } = require('@cloudbase/node-sdk')
const HEADERS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Content-Type': 'application/json' }

function respond(code, message, data = null) { return { code, message, data } }
function getDb() { return cloudbase.init({}).database() }
function getCtx(context) { return getCloudbaseContext(context) }

exports.main = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' }
  try {
    const rawBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body; const { action, data = {} } = rawBody || event
    const db = getDb()
    const ctx = getCloudbaseContext(context)
    const OPENID = ctx.OPENID || ctx.userId || ''

    if (!OPENID) return respond(401, '请先登录')
    // TODO: check admin role

    if (action === 'list') {
      const { page = 1, pageSize = 20, role } = data
      const skip = (page - 1) * pageSize
      let query = {}
      if (role) query.role = role

      const countResult = await db.collection('users').where(query).count()
      const list = await db.collection('users')
        .where(query)
        .orderBy('createdAt', 'desc')
        .skip(skip)
        .limit(pageSize)
        .field({ password: false })
        .get()

      return respond(0, 'success', { list: list.data, total: countResult.total })
    }

    if (action === 'get') {
      const { userId } = data
      const users = await db.collection('users').where({ _id: userId }).field({ password: false }).get()
      if (!users.data || users.data.length === 0) return respond(404, '用户不存在')
      return respond(0, 'success', users.data[0])
    }

    if (action === 'disable') {
      const { userId } = data
      await db.collection('users').where({ _id: userId }).update({ data: { enabled: false } })
      return respond(0, '账号已禁用')
    }

    if (action === 'enable') {
      const { userId } = data
      await db.collection('users').where({ _id: userId }).update({ data: { enabled: true } })
      return respond(0, '账号已启用')
    }

    if (action === 'promote') {
      const { userId, role } = data
      await db.collection('users').where({ _id: userId }).update({ data: { role: role || 'admin' } })
      return respond(0, '权限已更新')
    }

    return respond(404, `Unknown action: ${action}`)
  } catch (err) {
    console.error('[User] Error:', err)
    return respond(500, `服务器错误: ${err.message}`)
  }
}
