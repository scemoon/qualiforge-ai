/**
 * section-crud - 板块增删改查
 * Storage: CloudBase NoSQL stores all fields under data.data (double-wrapped)
 * Record: { _id: autoGen, data: { _id: 'sec_latest', title: '⚡ 前沿', type: 'article_list', config: {...}, order: 1 } }
 */
const cloudbase = require('@cloudbase/node-sdk')
const { getCloudbaseContext } = require('@cloudbase/node-sdk')

const app = cloudbase.init({ env: 'cloud1-2gavd8kj8a1ce021' })
const db = app.database()
const HEADERS = { 'Content-Type': 'application/json' }

function respond(code, message, data) {
  return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ code, message, data }) }
}

exports.main = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' }
  try {
    const rawBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
    const { action, data: reqData = {} } = rawBody || event

    // Auth context
    const ctx = getCloudbaseContext(context)
    const ctxUserId = ctx.USER_ID || ctx.userId || null
    const USER_ID = reqData.token || ctxUserId
    const assertAuth = () => { if (!USER_ID) throw new Error('请先登录') }

    // ========== list (public) ==========
    if (action === 'list') {
      const list = await db.collection('sections')
        .where({ 'data.visibility': 'public', 'data.enabled': true })
        .orderBy('data.order', 'asc')
        .get()

      const enriched = await Promise.all(list.data.map(async (section) => {
        const sectionData = section.data || {}
        const sectionKey = sectionData._id
        const sectionType = sectionData.type || 'article_list'
        const config = sectionData.config || {}

        if (!['sec_latest', 'sec_skill', 'sec_official'].includes(sectionKey)) return null

        const result = { ...section, _id: sectionKey, type: sectionType, config }

        if (sectionType === 'article_list') {
          if (config.articleIds && config.articleIds.length > 0) {
            // Two storage patterns in CloudBase:
            // - Legacy (art_sample_001, official_xxx): top-level _id + title + type + status
            // - Wrapped mock (art_001/002/003): auto top-level _id, real data in data._id / data.title / etc.
            const [topResult, wrappedResult] = await Promise.all([
              db.collection('articles').where({ _id: db.command.in(config.articleIds), status: 'approved' }).limit(10).get(),
              db.collection('articles').where({ 'data._id': db.command.in(config.articleIds) }).limit(10).get()
            ])

            const seen = new Set(topResult.data.map(a => a._id))
            const articles = [...topResult.data]
            for (const a of wrappedResult.data) {
              const key = a.data?._id || a._id
              if (!seen.has(key)) {
                seen.add(key)
                const flat = { _id: key }
                if (a.title) flat.title = a.title
                else if (a.data?.title) flat.title = a.data.title
                if (a.type) flat.type = a.type
                else if (a.data?.type) flat.type = a.data.type
                if (a.coverImage) flat.coverImage = a.coverImage
                else if (a.data?.coverImage) flat.coverImage = a.data.coverImage
                if (a.publishedAt) flat.publishedAt = a.publishedAt
                else if (a.data?.publishedAt) flat.publishedAt = a.data.publishedAt
                if (a.authorId) flat.authorId = a.authorId
                else if (a.data?.authorId) flat.authorId = a.data.authorId
                articles.push(flat)
              }
            }
            result.articles = articles
          } else if (config.skillId && config.skillId.trim()) {
            const arts = await db.collection('articles')
              .where({ status: 'approved', type: 'evaluation', skillId: config.skillId })
              .orderBy('publishedAt', 'desc')
              .limit(config.limit || 8)
              .field({ _id: true, title: true, coverImage: true, publishedAt: true, authorId: true, type: true })
              .get()
            result.articles = arts.data
          } else {
            const arts = await db.collection('articles')
              .where({ status: 'approved' })
              .orderBy('publishedAt', 'desc')
              .limit(config.limit || 10)
              .field({ _id: true, title: true, coverImage: true, publishedAt: true, authorId: true, type: true })
              .get()
            result.articles = arts.data
          }
        } else if (sectionType === 'skill_leaderboard' && config.skillId) {
          const evs = await db.collection('evaluations')
            .where({ skillId: config.skillId, enabled: true })
            .orderBy('overallScore', 'desc')
            .limit(config.limit || 8)
            .get()
          result.evaluations = evs.data
        }

        return result
      }))

      const seen = new Set()
      const filtered = enriched.filter(s => s && !seen.has(s._id) && (seen.add(s._id), true))

      return respond(0, 'success', { list: filtered })
    }

    // ========== listAll (admin - all sections regardless of enabled) ==========
    if (action === 'listAll') {
      assertAuth()
      const list = await db.collection('sections')
        .where({ 'data.visibility': 'public' })
        .orderBy('data.order', 'asc')
        .get()

      return respond(0, 'success', { list: list.data })
    }

    // ========== get ==========
    if (action === 'get') {
      const { sectionId } = reqData
      if (!sectionId) return respond(400, 'sectionId required')

      let sections = await db.collection('sections').where({ 'data._id': sectionId }).get()
      if (!sections.data.length) {
        sections = await db.collection('sections').where({ _id: sectionId }).get()
      }

      if (!sections.data || sections.data.length === 0) {
        return respond(404, '板块不存在')
      }

      return respond(0, 'success', { section: sections.data[0] })
    }

    // ========== create ==========
    if (action === 'create') {
      assertAuth()
      const { title, type, config, visibility = 'public', order } = reqData
      if (!title || !type) return respond(400, '标题和类型不能为空')

      const count = await db.collection('sections').count()
      const sectionId = `sec_${Date.now()}`

      await db.collection('sections').add({
        data: {
          _id: sectionId,
          title: title.trim(),
          type,
          config: config || {},
          visibility,
          enabled: true,
          order: order !== undefined ? order : count.total,
          createdAt: new Date()
        }
      })

      return respond(0, '创建成功', { sectionId })
    }

    // ========== update ==========
    if (action === 'update') {
      assertAuth()
      const { sectionId, title, type, config, visibility, order, enabled } = reqData
      if (!sectionId) return respond(400, 'sectionId required')

      const updateData = {}
      if (title !== undefined) updateData.title = title.trim()
      if (type !== undefined) updateData.type = type
      if (config !== undefined) updateData.config = config
      if (visibility !== undefined) updateData.visibility = visibility
      if (order !== undefined) updateData.order = order
      if (enabled !== undefined) updateData.enabled = enabled

      await db.collection('sections').where({ _id: sectionId }).update({ data: updateData })
      return respond(0, '更新成功')
    }

    // ========== delete ==========
    if (action === 'delete') {
      assertAuth()
      const { sectionId } = reqData
      if (!sectionId) return respond(400, 'sectionId required')
      await db.collection('sections').where({ _id: sectionId }).remove()
      return respond(0, '删除成功')
    }

    // ========== reorder ==========
    if (action === 'reorder') {
      assertAuth()
      const { orders } = reqData
      for (const { sectionId, order } of orders) {
        await db.collection('sections').where({ _id: sectionId }).update({ data: { order } })
      }
      return respond(0, '排序已更新')
    }

    return respond(404, `Unknown action: ${action}`)
  } catch (err) {
    console.error('[Section] Error:', err)
    return respond(500, `服务器错误: ${err.message}`)
  }
}