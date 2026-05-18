/**
 * Auth Skill - 认证相关技能
 */
const cloudbase = require('@cloudbase/node-sdk')
const bcrypt = require('bcryptjs')

const db = () => cloudbase.init({ env: 'cloud1-2gavd8kj8a1ce021' }).database()

module.exports = {
  actions: {
    login: async (params) => {
      const { email, password } = params
      if (!email || !password) {
        return { code: 400, message: '缺少邮箱或密码' }
      }

      const users = await db().collection('users').where({ email }).get()
      if (!users.data || users.data.length === 0) {
        return { code: 401, message: '用户不存在' }
      }

      const user = users.data[0]
      if (!user.enabled) {
        return { code: 403, message: '账号已被禁用' }
      }

      const match = await bcrypt.compare(password, user.password)
      if (!match) {
        return { code: 401, message: '密码错误' }
      }

      const { password: _, ...safeUser } = user
      return { code: 0, message: '登录成功', data: { user: safeUser, token: user._id } }
    },

    register: async (params) => {
      const { email, password, nickname } = params
      if (!email || !password || !nickname) {
        return { code: 400, message: '缺少必填字段' }
      }

      const existing = await db().collection('users').where({ email }).get()
      if (existing.data && existing.data.length > 0) {
        return { code: 409, message: '邮箱已注册' }
      }

      const hash = await bcrypt.hash(password, 10)
      const userId = `user_${Date.now()}`

      await db().collection('users').add({
        data: {
          _id: userId,
          email,
          password: hash,
          nickname,
          role: 'expert',
          enabled: true,
          createdAt: new Date()
        }
      })

      return { code: 0, message: '注册成功', data: { userId } }
    },

    logout: async (params) => {
      return { code: 0, message: '登出成功' }
    },

    resetPassword: async (params) => {
      const { email, code, newPassword } = params
      if (!email || !code || !newPassword) {
        return { code: 400, message: '缺少必填字段' }
      }
      return { code: 0, message: '密码重置成功' }
    }
  }
}