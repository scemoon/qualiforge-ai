/**
 * auth 云函数 - 用户认证
 * Actions: register, login, getUserInfo, updateProfile,
 *          resetPasswordSend, resetPasswordConfirm,
 *          sendRegisterCode, registerWithCode
 */
const cloudbase = require('@cloudbase/node-sdk')
const { getCloudbaseContext } = require('@cloudbase/node-sdk')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
}

function respond(code, message, data = null) {
  return { code, message, data }
}

let dbInstance = null
async function getDatabase() {
  if (!dbInstance) {
    const tcb = cloudbase.init({ env: 'cloud1-2gavd8kj8a1ce021' })
    dbInstance = tcb.database()
  }
  return dbInstance
}

// SMTP Transporter (configured via env vars or CloudBase secret)
// Environment variables needed:
//   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM
let _transporter = null
async function getTransporter() {
  if (_transporter) return _transporter
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const secure = process.env.SMTP_SECURE === 'true'
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || 'QualiForge <noreply@qualiforge.com>'

  if (!host || !user || !pass) {
    console.warn('[Auth] SMTP not configured, falling back to log-only mode')
    return null
  }

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })
  _transporter._from = from
  return _transporter
}

async function sendEmail(to, subject, html) {
  const transporter = await getTransporter()
  if (!transporter) {
    console.log(`[Auth] Email (mock) to ${to}: ${subject}`)
    return
  }
  try {
    await transporter.sendMail({
      from: transporter._from,
      to,
      subject,
      html,
    })
    console.log(`[Auth] Email sent to ${to}`)
  } catch (err) {
    console.error(`[Auth] Failed to send email to ${to}:`, err.message)
  }
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
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
    const rawBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
    const { action, data = {} } = rawBody || event
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

        const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#1a73e8;">QualiForge 密码重置</h2>
          <p>您好，</p>
          <p>您申请了密码重置，请在 1 小时内点击以下链接完成重置：</p>
          <p><a href="https://qualiforge.com/reset-password?token=${token}" style="color:#1a73e8;">点击重置密码</a></p>
          <p style="color:#999;font-size:12px;">如果您没有发起密码重置请求，请忽略此邮件。</p>
        </div>`
        await sendEmail(data.email, 'QualiForge 密码重置', html)

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

      // ========== 验证码注册 ==========

      case 'sendRegisterCode': {
        if (!isValidEmail(data.email)) return respond(400, '无效的邮箱格式')

        const existing = await db.collection('users').where({ email: data.email.toLowerCase().trim() }).get()
        if (existing.data && existing.data.length > 0) return respond(409, '该邮箱已注册')

        // 删除该邮箱已有的旧验证码
        await db.collection('verify_codes').where({
          email: data.email.toLowerCase().trim(),
          type: 'register',
        }).remove()

        const code = generateCode()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10分钟

        // 保存验证码（用于后续 verify 步骤校验）
        await db.collection('verify_codes').add({
          data: {
            _id: `vcode_${generateToken().slice(0, 20)}`,
            email: data.email.toLowerCase().trim(),
            type: 'register',
            code,
            expiresAt,
            used: false,
            createdAt: new Date(),
          }
        })

        // 发送验证邮件
        const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#1a73e8;">欢迎注册 QualiForge</h2>
          <p>您好，</p>
          <p>您的注册验证码为：</p>
          <div style="font-size:28px;font-weight:bold;letter-spacing:4px;color:#333;padding:16px 0;">${code}</div>
          <p style="color:#666;font-size:14px;">验证码有效期 10 分钟，请尽快完成注册。</p>
          <p style="color:#999;font-size:12px;">如果您没有发起注册请求，请忽略此邮件。</p>
        </div>`
        await sendEmail(data.email, 'QualiForge 注册验证码', html)

        return respond(0, '验证码已发送', { email: data.email })
      }

      case 'registerWithCode': {
        if (!isValidEmail(data.email)) return respond(400, '无效的邮箱格式')
        if (!data.code || data.code.length !== 6) return respond(400, '验证码格式错误')
        if (!data.nickname || data.nickname.trim().length === 0) return respond(400, '昵称不能为空')
        if (!isValidPassword(data.password || '')) return respond(400, '密码长度至少 8 位')

        const codes = await db.collection('verify_codes').where({
          email: data.email.toLowerCase().trim(),
          type: 'register',
          code: data.code,
          used: false,
        }).get()

        if (!codes.data || codes.data.length === 0) return respond(400, '验证码错误或已失效')

        const record = codes.data[0]
        if (new Date(record.expiresAt) < new Date()) {
          await db.collection('verify_codes').where({ _id: record._id }).remove()
          return respond(400, '验证码已过期，请重新获取')
        }

        // 标记为已使用
        await db.collection('verify_codes').where({ _id: record._id }).update({
          data: { used: true }
        })

        // 检查是否已注册
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
          emailVerified: true,
          enabled: true,
          createdAt: now,
          updatedAt: now,
        })

        // 自动登录
        const { password: _, ...safeUser } = (await db.collection('users').where({ _id: userId }).get()).data[0]
        return respond(0, '注册成功', {
          user: safeUser,
          token: OPENID || userId,
        })
      }

      default:
        return respond(404, `Unknown action: ${action}`)
    }
  } catch (err) {
    console.error('[Auth] Error:', err)
    return respond(500, `服务器错误: ${err.message}`)
  }
}