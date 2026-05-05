/**
 * notification-crud 云函数 - 通知管理
 * Actions: list, get, markRead, delete
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

    if (action === 'list') {
      const { page = 1, pageSize = 20, unreadOnly } = data
      const skip = (page - 1) * pageSize
      let query = { userId: OPENID }
      if (unreadOnly) query.read = false

      const countResult = await db.collection('notifications').where(query).count()
      const list = await db.collection('notifications')
        .where(query)
        .orderBy('createdAt', 'desc')
        .skip(skip)
        .limit(pageSize)
        .get()

      return respond(0, 'success', { list: list.data, total: countResult.total })
    }

    if (action === 'markRead') {
      const { notificationId } = data
      if (notificationId) {
        await db.collection('notifications').where({ _id: notificationId, userId: OPENID }).update({
          data: { read: true }
        })
      } else {
        // Mark all as read
        await db.collection('notifications').where({ userId: OPENID, read: false }).update({
          data: { read: true }
        })
      }
      return respond(0, '已标记为已读')
    }

    if (action === 'delete') {
      const { notificationId } = data
      await db.collection('notifications').where({ _id: notificationId, userId: OPENID }).remove()
      return respond(0, '删除成功')
    }

    if (action === 'create') {
      // System or admin creates notification
      const { userId, title, content, type = 'system' } = data
      if (!userId || !title) return respond(400, '缺少参数')
      await db.collection('notifications').add({
        data: {
          _id: `notif_${Date.now()}`,
          userId,
          title: title.trim(),
          content: content || '',
          type,
          read: false,
          createdAt: new Date(),
        }
      })
      return respond(0, '通知已发送')
    }

    return respond(404, `Unknown action: ${action}`)
  } catch (err) {
    console.error('[Notification] Error:', err)
    return respond(500, `服务器错误: ${err.message}`)
  }
}
