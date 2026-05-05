/**
 * skill-crud 云函数 - Skill 管理
 * Actions: list, get, create, update, delete
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

    // List all skills (public)
    if (action === 'list') {
      const list = await db.collection('skills')
        .orderBy('createdAt', 'asc')
        .get()
      return respond(0, 'success', { list: list.data })
    }

    // Get single skill
    if (action === 'get') {
      const { skillId } = data
      const skills = await db.collection('skills').where({ _id: skillId }).get()
      if (!skills.data || skills.data.length === 0) return respond(404, 'Skill 不存在')
      return respond(0, 'success', skills.data[0])
    }

    // Create skill (admin only)
    if (action === 'create') {
      if (!OPENID) return respond(401, '请先登录')
      // TODO: check admin role

      const { name, description, icon, color } = data
      if (!name) return respond(400, 'Skill 名称不能为空')

      const skillId = `skill_${Date.now()}`
      await db.collection('skills').add({
        data: {
          _id: skillId,
          name: name.trim(),
          description: description || '',
          icon: icon || '📊',
          color: color || '#6366F1',
          enabled: true,
          createdAt: new Date(),
        }
      })
      return respond(0, 'Skill 创建成功', { skillId })
    }

    // Update skill
    if (action === 'update') {
      if (!OPENID) return respond(401, '请先登录')
      const { skillId, name, description, icon, color, enabled } = data

      const updateData = {}
      if (name !== undefined) updateData.name = name.trim()
      if (description !== undefined) updateData.description = description
      if (icon !== undefined) updateData.icon = icon
      if (color !== undefined) updateData.color = color
      if (enabled !== undefined) updateData.enabled = enabled

      await db.collection('skills').where({ _id: skillId }).update({ data: updateData })
      return respond(0, '更新成功')
    }

    // Delete skill
    if (action === 'delete') {
      if (!OPENID) return respond(401, '请先登录')
      const { skillId } = data
      await db.collection('skills').where({ _id: skillId }).remove()
      return respond(0, '删除成功')
    }

    return respond(404, `Unknown action: ${action}`)
  } catch (err) {
    console.error('[Skill] Error:', err)
    return respond(500, `服务器错误: ${err.message}`)
  }
}
