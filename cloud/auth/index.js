/**
 * auth 云函数 - 用户认证
 * Actions: register, login, getUserInfo, updateProfile,
 *          resetPasswordSend, resetPasswordConfirm
 */
const cloudbase = require('@cloudbase/node-sdk')
const { getCloudbaseContext } = require('@cloudbase/node-sdk')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')

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

let dbInstance = null
async function getDatabase() {
  if (!dbInstance) {
    const tcb = cloudbase.init({ env: 'cloud1-2gavd8kj8a1ce021' })
    dbInstance = tcb.database()
  }
  return dbInstance
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPassword(password) {
  return password && password.length >= 8
}

exports.main = async (event, context) => {
  const headers = { ...HEADERS }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  try {
    const rawBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body; const { action, data = {} } = rawBody || event
    const db = await getDatabase()
    const cloudbaseContext = getCloudbaseContext(context)
    const OPENID = cloudbaseContext.OPENID || cloudbaseContext.userId || ''

    switch (action) {
      case 'register': {
        if (!isValidEmail(data.email)) return respond(400, '无效的邮箱格式')
        if (!isValidPassword(data.password)) return respond(400, '密码长度至少 8 位')
        if (!data.nickname || data.nickname.trim().length === 0) return respond(400, '昵称不能为空')

        const existing = await db.collection('users').where({ email: data.email.toLowerCase().trim() }).get()
        if (existing.data && existing.data.length > 0) return respond(409, '该邮箱已注册')

        const passwordHash = await bcrypt.hash(data.password, 10)
        const userId = `user_${generateToken().slice(0, 16)}`
        const now = new Date()

        await db.collection('users').add({
          _id: userId,
          _openid: OPENID || undefined,
          email: data.email.toLowerCase().trim(),
          nickname: data.nickname.trim(),
          password: passwordHash,
          role: 'expert',
          avatar: '',
          company: '',
          bio: '',
          emailVerified: false,
          enabled: true,
          createdAt: now,
          updatedAt: now,
        })

        return respond(0, '注册成功，请登录', { userId, email: data.email })
      }

      case 'login': {
        if (!isValidEmail(data.email) || !data.password) return respond(400, '请提供邮箱和密码')

        const users = await db.collection('users').where({ email: data.email.toLowerCase().trim() }).get()
        if (!users.data || users.data.length === 0) return respond(401, '邮箱或密码错误')

        const user = users.data[0]
        if (!user.enabled) return respond(403, '账号已被禁用')

        const passwordMatch = await bcrypt.compare(data.password, user.password)
        if (!passwordMatch) return respond(401, '邮箱或密码错误')

        const { password: _, ...safeUser } = user
        return respond(0, 'success', {
          user: safeUser,
          token: OPENID || user._id,
        })
      }

      case 'getUserInfo': {
        if (!OPENID && !data.userId) return respond(401, '未登录')

        let query = OPENID ? { _openid: OPENID } : { _id: data.userId }
        const users = await db.collection('users').where(query).get()
        if (!users.data || users.data.length === 0) return respond(404, '用户不存在')

        const { password: _, ...safeUser } = users.data[0]
        return respond(0, 'success', safeUser)
      }

      case 'updateProfile': {
        if (!OPENID) return respond(401, '请先登录')

        const updateData = { updatedAt: new Date() }
        if (data.nickname) updateData.nickname = data.nickname.trim()
        if (data.avatar !== undefined) updateData.avatar = data.avatar
        if (data.company !== undefined) updateData.company = data.company
        if (data.bio !== undefined) updateData.bio = data.bio

        await db.collection('users').where({ _openid: OPENID }).update({ data: updateData })
        return respond(0, '资料更新成功')
      }

      case 'resetPasswordSend': {
        if (!isValidEmail(data.email)) return respond(400, '无效的邮箱格式')

        const users = await db.collection('users').where({ email: data.email.toLowerCase().trim() }).get()
        if (!users.data || users.data.length === 0) {
          return respond(0, '如果邮箱已注册，将会收到重置邮件')
        }

        const user = users.data[0]
        const token = generateToken()
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

        await db.collection('password_reset_tokens').add({
          data: {
            _id: `prt_${token.slice(0, 24)}`,
            token,
            userId: user._id,
            expiresAt,
            used: false,
            createdAt: new Date(),
          }
        })

        console.log(`[Auth] Password reset for ${data.email}: ${token}`)
        return respond(0, '如果邮箱已注册，将会收到重置邮件')
      }

      case 'resetPasswordConfirm': {
        if (!data.token || !data.newPassword) return respond(400, '缺少 token 或新密码')
        if (!isValidPassword(data.newPassword)) return respond(400, '密码长度至少 8 位')

        const tokens = await db.collection('password_reset_tokens').where({ token: data.token, used: false }).get()
        if (!tokens.data || tokens.data.length === 0) return respond(400, '无效或已过期的重置链接')

        const tokenRecord = tokens.data[0]
        if (new Date(tokenRecord.expiresAt) < new Date()) return respond(400, '重置链接已过期')

        const passwordHash = await bcrypt.hash(data.newPassword, 10)
        await db.collection('users').where({ _id: tokenRecord.userId }).update({
          data: { password: passwordHash, updatedAt: new Date() }
        })
        await db.collection('password_reset_tokens').where({ _id: tokenRecord._id }).update({
          data: { used: true }
        })

        return respond(0, '密码重置成功，请使用新密码登录')
      }

      default:
        return respond(404, `Unknown action: ${action}`)
    }
  } catch (err) {
    console.error('[Auth] Error:', err)
    return respond(500, `服务器错误: ${err.message}`)
  }
}
