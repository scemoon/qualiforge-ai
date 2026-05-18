/**
 * forge-skill 云函数 - 统一技能接口
 * 整合登录、文章管理、标签、评测等功能
 */
const cloudbase = require('@cloudbase/node-sdk')
const { getCloudbaseContext } = require('@cloudbase/node-sdk')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Auth-Token',
  'Content-Type': 'application/json',
}

function respond(code, message, data = null) {
  return { code, message, data }
}

function getDb() {
  const app = cloudbase.init({ env: 'cloud1-2gavd8kj8a1ce021' })
  return app.database()
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

// 获取当前用户信息（从 token 或 openid）
async function getCurrentUser(db, token, ctx) {
  if (!token && !ctx.OPENID) return null
  
  if (token) {
    // 尝试作为 userId 查找
    const users = await db.collection('users').where({ _id: token }).get()
    if (users.data && users.data.length > 0) return users.data[0]
    // 尝试作为 openid 查找
    const byOpenid = await db.collection('users').where({ _openid: token }).get()
    if (byOpenid.data && byOpenid.data.length > 0) return byOpenid.data[0]
  }
  
  if (ctx.OPENID) {
    const byOpenid = await db.collection('users').where({ _openid: ctx.OPENID }).get()
    if (byOpenid.data && byOpenid.data.length > 0) return byOpenid.data[0]
  }
  
  return null
}

// 检查是否为管理员
async function isAdmin(db, user) {
  if (!user) return false
  return user.role === 'admin'
}

exports.main = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' }
  }

  try {
    const rawBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
    const { action, data = {} } = rawBody || event
    const db = getDb()
    const ctx = getCloudbaseContext(context)
    
    // 从 header 或 data 中获取 token
    const token = event.headers?.['x-auth-token'] || event.headers?.['authorization']?.replace('Bearer ', '') || data.token || ''
    const currentUser = await getCurrentUser(db, token, ctx)
    const isAdminUser = await isAdmin(db, currentUser)

    // ========== 1. 登录并保存 token ==========
    if (action === 'login') {
      const { email, password } = data
      
      if (!email || !password) {
        return respond(400, '请提供邮箱和密码')
      }
      
      if (!isValidEmail(email)) {
        return respond(400, '无效的邮箱格式')
      }
      
      const users = await db.collection('users').where({ email: email.toLowerCase().trim() }).get()
      
      if (!users.data || users.data.length === 0) {
        return respond(401, '邮箱或密码错误')
      }
      
      const user = users.data[0]
      
      if (!user.enabled) {
        return respond(403, '账号已被禁用')
      }
      
      const passwordMatch = await bcrypt.compare(password, user.password)
      if (!passwordMatch) {
        return respond(401, '邮箱或密码错误')
      }
      
      // 生成会话 token（使用 user._id）
      const sessionToken = user._id
      
      // 返回用户信息（不含密码）和 token
      const { password: _, ...safeUser } = user
      
      return respond(0, '登录成功', {
        user: safeUser,
        token: sessionToken
      })
    }

    // ========== 2. 获取当前用户信息 ==========
    if (action === 'getCurrentUser') {
      const user = currentUser || { role: 'guest' }
      return respond(0, 'success', user)
    }

    // ========== 3. 创建文章（专家或管理员）==========
    if (action === 'createArticle') {
      if (!currentUser) return respond(401, '请先登录')
      
      const { title, content, coverImage, tags, type = 'normal' } = data
      
      if (!title || !title.trim()) {
        return respond(400, '文章标题不能为空')
      }
      
      if (!content || !content.trim()) {
        return respond(400, '文章内容不能为空')
      }
      
      const articleId = `article_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
      const now = new Date()
      
      // 专家创建需要审核，管理员创建直接发布
      const status = currentUser.role === 'admin' ? 'approved' : 'pending'
      const publishedAt = status === 'approved' ? now : null
      
      await db.collection('articles').add({
        data: {
          _id: articleId,
          title: title.trim(),
          content: content.trim(),
          coverImage: coverImage || '',
          authorId: currentUser._id,
          author: {
            _id: currentUser._id,
            nickname: currentUser.nickname,
            avatar: currentUser.avatar || ''
          },
          type: type,
          status: status,
          isOfficial: type === 'official',
          tags: tags || [],
          readCount: 0,
          createdAt: now,
          publishedAt: publishedAt,
          updatedAt: now
        }
      })
      
      // 创建标签关联
      if (tags && tags.length > 0) {
        for (const tagId of tags) {
          await db.collection('article_tags').add({
            data: {
              articleId: articleId,
              tagId: tagId
            }
          })
        }
      }
      
      return respond(0, status === 'approved' ? '发布成功' : '提交成功，等待审核', {
        articleId,
        status
      })
    }

    // ========== 4. 更新文章 ==========
    if (action === 'updateArticle') {
      if (!currentUser) return respond(401, '请先登录')
      
      const { articleId, title, content, coverImage, tags } = data
      
      if (!articleId) {
        return respond(400, '文章ID不能为空')
      }
      
      // 检查文章是否存在
      const articles = await db.collection('articles').where({ _id: articleId }).get()
      if (!articles.data || articles.data.length === 0) {
        return respond(404, '文章不存在')
      }
      
      const article = articles.data[0]
      
      // 检查权限：作者或管理员才能修改
      if (article.authorId !== currentUser._id && currentUser.role !== 'admin') {
        return respond(403, '无权修改此文章')
      }
      
      const updateData = {
        updatedAt: new Date()
      }
      
      if (title) updateData.title = title.trim()
      if (content) updateData.content = content.trim()
      if (coverImage !== undefined) updateData.coverImage = coverImage
      
      // 如果文章状态是 approved，修改后需要重新审核
      if (article.status === 'approved' && currentUser.role !== 'admin') {
        updateData.status = 'pending'
        updateData.publishedAt = null
      }
      
      await db.collection('articles').where({ _id: articleId }).update({
        data: updateData
      })
      
      // 更新标签关联
      if (tags) {
        // 删除旧的关联
        await db.collection('article_tags').where({ articleId }).remove()
        
        // 创建新的关联
        for (const tagId of tags) {
          await db.collection('article_tags').add({
            data: {
              articleId: articleId,
              tagId: tagId
            }
          })
        }
      }
      
      return respond(0, '更新成功')
    }

    // ========== 5. 获取文章列表 ==========
    if (action === 'listArticles') {
      const { page = 1, pageSize = 20, tagId, status, type } = data
      
      let query = {}
      
      // 公开列表只显示 approved
      if (status === 'approved' || !status) {
        query['data.status'] = status || 'approved'
      } else if (currentUser && currentUser.role === 'admin') {
        query['data.status'] = status
      }
      
      if (type) {
        query['data.type'] = type
      }
      
      const skip = (page - 1) * pageSize
      
      // 如果按标签筛选
      if (tagId) {
        const tagRefs = await db.collection('article_tags').where({ tagId }).field({ articleId: true }).get()
        const articleIds = tagRefs.data.map(r => r.articleId)
        
        if (articleIds.length === 0) {
          return respond(0, 'success', { list: [], total: 0 })
        }
        
        query['_id'] = db.command.in(articleIds)
      }
      
      const countResult = await db.collection('articles').where(query).count()
      const listResult = await db.collection('articles')
        .where(query)
        .orderBy('data.createdAt', 'desc')
        .skip(skip)
        .limit(pageSize)
        .get()
      
      return respond(0, 'success', {
        list: listResult.data || [],
        total: countResult.total || 0
      })
    }

    // ========== 6. 获取单篇文章 ==========
    if (action === 'getArticle') {
      const { articleId } = data
      
      if (!articleId) {
        return respond(400, '文章ID不能为空')
      }
      
      const articles = await db.collection('articles').where({ _id: articleId }).get()
      
      if (!articles.data || articles.data.length === 0) {
        return respond(404, '文章不存在')
      }
      
      const article = articles.data[0]
      
      // 如果是 pending/rejected/draft，非作者或非管理员不能查看
      if (article.data?.status !== 'approved' && article.status !== 'approved') {
        if (!currentUser || (currentUser._id !== article.authorId && currentUser.role !== 'admin')) {
          return respond(404, '文章不存在')
        }
      }
      
      return respond(0, 'success', article)
    }

    // ========== 7. 审核文章（管理员）==========
    if (action === 'reviewArticle') {
      if (!currentUser) return respond(401, '请先登录')
      if (!isAdminUser) return respond(403, '需要管理员权限')
      
      const { articleId, action: reviewAction, rejectReason } = data
      
      if (!articleId) {
        return respond(400, '文章ID不能为空')
      }
      
      if (!reviewAction || !['approve', 'reject'].includes(reviewAction)) {
        return respond(400, '无效的审核操作')
      }
      
      const articles = await db.collection('articles').where({ _id: articleId }).get()
      if (!articles.data || articles.data.length === 0) {
        return respond(404, '文章不存在')
      }
      
      const now = new Date()
      const updateData = {
        updatedAt: now
      }
      
      if (reviewAction === 'approve') {
        updateData.status = 'approved'
        updateData.publishedAt = now
      } else {
        updateData.status = 'rejected'
        updateData.rejectReason = rejectReason || ''
      }
      
      await db.collection('articles').where({ _id: articleId }).update({
        data: updateData
      })
      
      // 发送通知给作者
      const article = articles.data[0]
      await db.collection('notifications').add({
        data: {
          userId: article.authorId,
          type: reviewAction === 'approve' ? 'article_approved' : 'article_rejected',
          title: reviewAction === 'approve' ? '文章审核通过' : '文章审核被驳回',
          content: `您的文章"${article.title}"已${reviewAction === 'approve' ? '审核通过' : '被驳回'}${rejectReason ? '，原因：' + rejectReason : ''}`,
          articleId: articleId,
          read: false,
          createdAt: now
        }
      })
      
      return respond(0, reviewAction === 'approve' ? '审核通过' : '已驳回')
    }

    // ========== 8. 获取待审核文章列表（管理员）==========
    if (action === 'listPendingArticles') {
      if (!currentUser) return respond(401, '请先登录')
      if (!isAdminUser) return respond(403, '需要管理员权限')
      
      const { page = 1, pageSize = 20 } = data
      const skip = (page - 1) * pageSize
      
      const countResult = await db.collection('articles').where({ 'data.status': 'pending' }).count()
      const listResult = await db.collection('articles')
        .where({ 'data.status': 'pending' })
        .orderBy('data.createdAt', 'desc')
        .skip(skip)
        .limit(pageSize)
        .get()
      
      return respond(0, 'success', {
        list: listResult.data || [],
        total: countResult.total || 0
      })
    }

    // ========== 9. 获取标签列表 ==========
    if (action === 'listTags') {
      const { page = 1, pageSize = 50 } = data
      const skip = (page - 1) * pageSize
      
      const countResult = await db.collection('tags').count()
      const listResult = await db.collection('tags')
        .orderBy('createdAt', 'desc')
        .skip(skip)
        .limit(pageSize)
        .get()
      
      // 获取每个标签的文章数量
      const enrichedTags = await Promise.all((listResult.data || []).map(async (tag) => {
        const countResult = await db.collection('article_tags').where({ tagId: tag._id }).count()
        return {
          ...tag,
          articleCount: countResult.total || 0
        }
      }))
      
      return respond(0, 'success', {
        list: enrichedTags,
        total: countResult.total || 0
      })
    }

    // ========== 10. 创建标签（管理员）==========
    if (action === 'createTag') {
      if (!currentUser) return respond(401, '请先登录')
      if (!isAdminUser) return respond(403, '需要管理员权限')
      
      const { name, color, description } = data
      
      if (!name || !name.trim()) {
        return respond(400, '标签名称不能为空')
      }
      
      // 检查是否已存在同名标签
      const existing = await db.collection('tags').where({ name: name.trim() }).get()
      if (existing.data && existing.data.length > 0) {
        return respond(409, '标签已存在')
      }
      
      const tagId = `tag_${Date.now()}`
      const now = new Date()
      
      await db.collection('tags').add({
        data: {
          _id: tagId,
          name: name.trim(),
          color: color || '#6366F1',
          description: description || '',
          createdAt: now,
          updatedAt: now
        }
      })
      
      return respond(0, '创建成功', { tagId })
    }

    // ========== 11. 删除标签（管理员）==========
    if (action === 'deleteTag') {
      if (!currentUser) return respond(401, '请先登录')
      if (!isAdminUser) return respond(403, '需要管理员权限')
      
      const { tagId } = data
      
      if (!tagId) {
        return respond(400, '标签ID不能为空')
      }
      
      // 检查标签是否被文章使用
      const usages = await db.collection('article_tags').where({ tagId }).count()
      if (usages.total > 0) {
        return respond(400, '该标签已被使用，无法删除')
      }
      
      await db.collection('tags').where({ _id: tagId }).remove()
      
      return respond(0, '删除成功')
    }

    // ========== 12. 创建评测（管理员）==========
    if (action === 'createEvaluation') {
      if (!currentUser) return respond(401, '请先登录')
      if (!isAdminUser) return respond(403, '需要管理员权限')
      
      const { modelName, modelVersion, skillName, skillIcon, skillColor, overallScore, dimensions, evaluationDate, articleId, tags, remark, coverImage } = data
      
      if (!modelName) {
        return respond(400, '模型名称不能为空')
      }
      
      if (overallScore === undefined || overallScore === null) {
        return respond(400, '综合评分不能为空')
      }
      
      const evalId = `eval_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
      const now = new Date()
      
      // 如果提供了 skillName，先查找或创建 Skill
      let skillId = null
      if (skillName) {
        const existingSkills = await db.collection('skills').where({ name: skillName }).get()
        if (existingSkills.data && existingSkills.data.length > 0) {
          skillId = existingSkills.data[0]._id
        } else {
          skillId = `skill_${Date.now()}`
          await db.collection('skills').add({
            data: {
              _id: skillId,
              name: skillName,
              icon: skillIcon || '📊',
              color: skillColor || '#6366F1',
              description: '',
              createdAt: now,
              updatedAt: now
            }
          })
        }
      }
      
      // 创建评测记录
      await db.collection('evaluations').add({
        data: {
          _id: evalId,
          modelName: modelName.trim(),
          modelVersion: modelVersion || '',
          skillId: skillId,
          skillName: skillName || '',
          skillIcon: skillIcon || '📊',
          skillColor: skillColor || '#6366F1',
          overallScore: parseFloat(overallScore),
          dimensions: dimensions || {},
          evaluationDate: evaluationDate || now.toISOString().split('T')[0],
          articleId: articleId || '',
          remark: remark || '',
          tags: tags || [],
          coverImage: coverImage || '',
          visible: true,
          createdAt: now,
          updatedAt: now
        }
      })
      
      // 如果提供了 articleId，关联评测文章
      if (articleId) {
        const articles = await db.collection('articles').where({ _id: articleId }).get()
        if (articles.data && articles.data.length > 0) {
          await db.collection('articles').where({ _id: articleId }).update({
            data: {
              type: 'evaluation',
              isEvaluation: true,
              updatedAt: now
            }
          })
        }
      }
      
      return respond(0, '创建成功', { evaluationId: evalId })
    }

    // ========== 13. 获取评测列表 ==========
    if (action === 'listEvaluations') {
      const { skillName, page = 1, pageSize = 50 } = data
      const skip = (page - 1) * pageSize
      
      let query = { visible: true }
      if (skillName) {
        query.skillName = skillName
      }
      
      const countResult = await db.collection('evaluations').where(query).count()
      const listResult = await db.collection('evaluations')
        .where(query)
        .orderBy('overallScore', 'desc')
        .skip(skip)
        .limit(pageSize)
        .get()
      
      return respond(0, 'success', {
        list: listResult.data || [],
        total: countResult.total || 0
      })
    }

    // ========== 14. 获取 Skill 列表 ==========
    if (action === 'listSkills') {
      const { page = 1, pageSize = 50 } = data
      const skip = (page - 1) * pageSize
      
      const countResult = await db.collection('skills').count()
      const listResult = await db.collection('skills')
        .orderBy('createdAt', 'desc')
        .skip(skip)
        .limit(pageSize)
        .get()
      
      return respond(0, 'success', {
        list: listResult.data || [],
        total: countResult.total || 0
      })
    }

    // ========== 15. 获取用户统计 ==========
    if (action === 'getStats') {
      const articleCount = await db.collection('articles').where({ 'data.status': 'approved' }).count()
      const userCount = await db.collection('users').where({ enabled: true }).count()
      const evaluationCount = await db.collection('evaluations').where({ visible: true }).count()
      
      // 获取总浏览量
      const allArticles = await db.collection('articles').where({ 'data.status': 'approved' }).field({ readCount: true }).get()
      const viewCount = (allArticles.data || []).reduce((sum, a) => sum + (a.readCount || 0), 0)
      
      return respond(0, 'success', {
        articleCount: articleCount.total || 0,
        userCount: userCount.total || 0,
        evaluationCount: evaluationCount.total || 0,
        viewCount: viewCount
      })
    }

    // 默认响应未知 action
    return respond(400, '未知操作', { action })

  } catch (err) {
    console.error('[forge-skill] Error:', err)
    return respond(500, '服务器内部错误: ' + err.message)
  }
}
