/**
 * article-crud 云函数 - 文章 CRUD + 标签
 * Actions: list, get, create, update, delete,
 *          approve, reject, listMyArticles,
 *          listTags, createTag, deleteTag,
 *          collect, uncollect, myCollections
 */
const cloudbase = require('@cloudbase/node-sdk')
const { getCloudbaseContext } = require('@cloudbase/node-sdk')

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
}

function respond(code, message, data) {
  return { code, message, data: data || null }
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
    const rawBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
    const { action, data = {} } = rawBody || event
    const db = getDb()
    const ctx = getCloudbaseContext(context)
    const ctxUserId = ctx.OPENID || ctx.userId || ''
    const USER_ID = data.token || ctxUserId

    // ---------- list articles (public) ----------
    if (action === 'list') {
      const { page = 1, pageSize = 20, tagId, keyword, status = 'approved' } = data
      const skip = (page - 1) * pageSize

      let countObj = { total: 0 }
      let listResult

      if (tagId) {
        const tagRefs = await db.collection('article_tags').where({ tagId }).field({ articleId: true }).get()
        const articleIds = tagRefs.data.map(function (r) { return r.articleId })
        if (articleIds.length === 0) {
          return respond(0, 'success', { list: [], total: 0 })
        }
        const tagQuery = db.command.and(
          db.command.or(
            { _id: db.command.in(articleIds) },
            { 'data._id': db.command.in(articleIds) }
          ),
          db.command.or(
            { status: status },
            { 'data.status': status }
          )
        )
        countObj = await db.collection('articles').where(tagQuery).count()
        listResult = await db.collection('articles')
          .where(tagQuery)
          .orderBy('data.createdAt', 'desc')
          .skip(skip)
          .limit(pageSize)
          .get()
      } else {
        const keywordQuery = keyword
          ? db.command.or(
              { title: new RegExp(keyword, 'i') },
              { 'data.title': new RegExp(keyword, 'i') }
            )
          : {}
        const baseQuery = db.command.and(
          db.command.or(
            { status: status },
            { 'data.status': status }
          ),
          keywordQuery
        )
        countObj = await db.collection('articles').where(baseQuery).count()
        listResult = await db.collection('articles')
          .where(baseQuery)
          .orderBy('data.createdAt', 'desc')
          .skip(skip)
          .limit(pageSize)
          .get()
      }

      // Fetch authors
      const authorIds = []
      listResult.data.forEach(function (a) {
        const d = a.data || a
        if (d.authorId) authorIds.push(d.authorId)
      })
      const authors = {}
      if (authorIds.length > 0) {
        const uniqueIds = [...new Set(authorIds)]
        const userResults = await db.collection('users').where({
          _id: db.command.in(uniqueIds)
        }).field({ _id: true, nickname: true, avatar: true }).get()
        userResults.data.forEach(function (u) { authors[u._id] = u })
      }

      const articles = listResult.data.map(function (a) {
        const d = a.data || a
        return {
          _id: d._id || a._id,
          title: d.title,
          coverImage: d.coverImage,
          type: d.type,
          status: d.status,
          authorId: d.authorId,
          readCount: d.readCount,
          publishedAt: d.publishedAt,
          author: authors[d.authorId] || null
        }
      })

      return respond(0, 'success', { list: articles, total: countObj.total })
    }

    // ---------- get article ----------
    if (action === 'get') {
      const { articleId } = data
      let articles = await db.collection('articles').where(
        db.command.or(
          { _id: articleId },
          { 'data._id': articleId }
        )
      ).get()
      if (!articles.data || articles.data.length === 0) {
        return respond(404, '文章不存在', null)
      }
      const article = articles.data[0].data || articles.data[0]

      // Load tags
      const tagRefs = await db.collection('article_tags').where({ articleId }).get()
      const tagIds = tagRefs.data.map(function (r) { return r.tagId })
      let tags = []
      if (tagIds.length > 0) {
        const tagRes = await db.collection('tags').where({
          'data._id': db.command.in(tagIds)
        }).get()
        tags = tagRes.data.map(function (t) { return t.data || t })
      }

      // Load author
      let author = null
      if (article.authorId) {
        const users = await db.collection('users').where({ _id: article.authorId })
          .field({ _id: true, nickname: true, avatar: true }).get()
        author = users.data[0] || null
      }

      return respond(0, 'success', Object.assign({}, article, { tags: tags, author: author }))
    }

    // ---------- create article ----------
    if (action === 'create') {
      if (!USER_ID) return respond(401, '请先登录', null)

      const { title, content, coverImage, type = 'normal', tags: tagIds = [] } = data
      if (!title || !content) return respond(400, '标题和内容不能为空', null)

      const now = new Date()
      const articleId = 'art_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)

      await db.collection('articles').add({
        _id: articleId,
        data: {
          _id: articleId,
          title: title.trim(),
          content: content,
          coverImage: coverImage || '',
          type: type,
          status: 'pending',
          authorId: USER_ID,
          readCount: 0,
          wechatSynced: false,
          createdAt: now,
          updatedAt: now,
          publishedAt: null
        }
      })

      // Link tags
      for (let i = 0; i < tagIds.length; i++) {
        await db.collection('article_tags').add({
          articleId: articleId,
          tagId: tagIds[i],
          createdAt: now
        })
      }

      return respond(0, '文章已提交，待审核', { articleId: articleId })
    }

    // ---------- update article ----------
    if (action === 'update') {
      if (!USER_ID) return respond(401, '请先登录', null)

      const { articleId, title, content, coverImage, tags: tagIds } = data

      const articles = await db.collection('articles').where(
        db.command.or(
          { _id: articleId },
          { 'data._id': articleId }
        )
      ).get()
      if (!articles.data || articles.data.length === 0) return respond(404, '文章不存在', null)
      const article = articles.data[0].data || articles.data[0]
      const docId = articles.data[0]._id

      if (article.authorId !== USER_ID) {
        return respond(403, '无权限修改', null)
      }

      const updateData = { updatedAt: new Date() }
      if (title !== undefined) updateData.title = title.trim()
      if (content !== undefined) updateData.content = content
      if (coverImage !== undefined) updateData.coverImage = coverImage

      await db.collection('articles').doc(docId).update({ data: updateData })

      if (tagIds !== undefined) {
        await db.collection('article_tags').where({ articleId }).remove()
        for (let i = 0; i < tagIds.length; i++) {
          await db.collection('article_tags').add({
            articleId: articleId,
            tagId: tagIds[i],
            createdAt: new Date()
          })
        }
      }

      return respond(0, '更新成功', null)
    }

    // ---------- delete article ----------
    if (action === 'delete') {
      if (!USER_ID) return respond(401, '请先登录', null)
      const { articleId } = data

      const articles = await db.collection('articles').where(
        db.command.or(
          { _id: articleId },
          { 'data._id': articleId }
        )
      ).get()
      if (!articles.data || articles.data.length === 0) return respond(404, '文章不存在', null)
      const article = articles.data[0].data || articles.data[0]
      const docId = articles.data[0]._id

      if (article.authorId !== USER_ID) {
        return respond(403, '无权限删除', null)
      }

      await db.collection('articles').doc(docId).remove()
      await db.collection('article_tags').where({ articleId }).remove()

      return respond(0, '删除成功', null)
    }

    // ---------- approve article ----------
    if (action === 'approve') {
      if (!USER_ID) return respond(401, '请先登录', null)
      const { articleId } = data

      const articles = await db.collection('articles').where(
        db.command.or(
          { _id: articleId },
          { 'data._id': articleId }
        )
      ).get()
      if (!articles.data || articles.data.length === 0) return respond(404, '文章不存在', null)
      const docId = articles.data[0]._id

      await db.collection('articles').doc(docId).update({
        data: { status: 'approved', publishedAt: new Date(), updatedAt: new Date() }
      })

      return respond(0, '审核通过', null)
    }

    // ---------- reject article ----------
    if (action === 'reject') {
      if (!USER_ID) return respond(401, '请先登录', null)
      const { articleId, reason } = data

      const articles = await db.collection('articles').where(
        db.command.or(
          { _id: articleId },
          { 'data._id': articleId }
        )
      ).get()
      if (!articles.data || articles.data.length === 0) return respond(404, '文章不存在', null)
      const docId = articles.data[0]._id

      await db.collection('articles').doc(docId).update({
        data: { status: 'rejected', rejectReason: reason || '', updatedAt: new Date() }
      })

      return respond(0, '已驳回', null)
    }

    // ---------- list my articles ----------
    if (action === 'listMyArticles') {
      if (!USER_ID) return respond(401, '请先登录', null)
      const { page = 1, pageSize = 20, status } = data
      const skip = (page - 1) * pageSize

      const statusQuery = status
        ? db.command.or(
            { status: status },
            { 'data.status': status }
          )
        : {}

      const list = await db.collection('articles')
        .where(db.command.and(
          db.command.or(
            { authorId: USER_ID },
            { 'data.authorId': USER_ID }
          ),
          statusQuery
        ))
        .orderBy('data.createdAt', 'desc')
        .skip(skip)
        .limit(pageSize)
        .get()

      const countResult = await db.collection('articles')
        .where(db.command.and(
          db.command.or(
            { authorId: USER_ID },
            { 'data.authorId': USER_ID }
          ),
          statusQuery
        ))
        .count()

      const articles = list.data.map(function (a) { return a.data || a })
      return respond(0, 'success', { list: articles, total: countResult.total })
    }

    // ---------- list tags ----------
    if (action === 'listTags') {
      const list = await db.collection('tags').orderBy('name', 'asc').get()
      const tags = list.data.map(function (t) {
        const d = t.data || t
        return { _id: d._id || t._id, name: d.name, color: d.color }
      })
      return respond(0, 'success', { list: tags })
    }

    // ---------- create tag ----------
    if (action === 'createTag') {
      if (!USER_ID) return respond(401, '请先登录', null)
      const { name, color } = data
      if (!name) return respond(400, '标签名不能为空', null)

      const tagId = 'tag_' + Date.now()
      await db.collection('tags').add({
        _id: tagId,
        data: {
          _id: tagId,
          name: name.trim(),
          color: color || '#6366F1',
          createdAt: new Date()
        }
      })

      return respond(0, '标签创建成功', { tagId: tagId })
    }

    // ---------- delete tag ----------
    if (action === 'deleteTag') {
      if (!USER_ID) return respond(401, '请先登录', null)
      const { tagId } = data
      const tags = await db.collection('tags').where(
        db.command.or({ _id: tagId }, { 'data._id': tagId })
      ).get()
      if (tags.data && tags.data.length > 0) {
        await db.collection('tags').doc(tags.data[0]._id).remove()
      }
      await db.collection('article_tags').where({ tagId }).remove()
      return respond(0, '删除成功', null)
    }

    // ---------- collect ----------
    if (action === 'collect') {
      if (!USER_ID) return respond(401, '请先登录', null)
      const { articleId } = data

      const existing = await db.collection('collections').where({
        userId: USER_ID,
        articleId: articleId
      }).get()

      if (existing.data && existing.data.length > 0) {
        return respond(0, '已收藏', null)
      }

      await db.collection('collections').add({
        userId: USER_ID,
        articleId: articleId,
        createdAt: new Date()
      })

      return respond(0, '收藏成功', null)
    }

    // ---------- uncollect ----------
    if (action === 'uncollect') {
      if (!USER_ID) return respond(401, '请先登录', null)
      const { articleId } = data
      await db.collection('collections').where({ userId: USER_ID, articleId: articleId }).remove()
      return respond(0, '已取消收藏', null)
    }

    // ---------- my collections ----------
    if (action === 'myCollections') {
      if (!USER_ID) return respond(401, '请先登录', null)
      const { page = 1, pageSize = 20 } = data
      const skip = (page - 1) * pageSize

      const cols = await db.collection('collections')
        .where({ userId: USER_ID })
        .orderBy('createdAt', 'desc')
        .skip(skip)
        .limit(pageSize)
        .get()

      const articleIds = cols.data.map(function (c) { return c.articleId })
      if (articleIds.length === 0) {
        return respond(0, 'success', { list: [], total: 0 })
      }

      const articles = await db.collection('articles')
        .where(
          db.command.and(
            db.command.or(
              { _id: db.command.in(articleIds) },
              { 'data._id': db.command.in(articleIds) }
            ),
            db.command.or(
              { status: 'approved' },
              { 'data.status': 'approved' }
            )
          )
        )
        .get()

      const articleList = articles.data.map(function (a) { return a.data || a })
      return respond(0, 'success', { list: articleList, total: cols.total })
    }

    // ---------- stats ----------
    if (action === 'stats') {
      const approvedQuery = db.command.or(
        { status: 'approved' },
        { 'data.status': 'approved' }
      )
      const allArticles = await db.collection('articles').where(approvedQuery).field({ _id: true }).get()
      const articleCount = allArticles.data.length

      const users = await db.collection('users').count()
      const userCount = users.total || 0

      let viewCount = 0
      allArticles.data.forEach(function (a) {
        const d = a.data || a
        if (d.readCount) viewCount += d.readCount
      })

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      let todayCount = 0
      allArticles.data.forEach(function (a) {
        const d = a.data || a
        if (d.publishedAt) {
          const pubDate = new Date(d.publishedAt)
          if (pubDate >= today) todayCount++
        }
      })

      return respond(0, 'success', { articleCount, userCount, viewCount, todayCount })
    }

    return respond(404, 'Unknown action: ' + action, null)
  } catch (err) {
    console.error('[Article] Error:', err)
    return respond(500, '服务器错误: ' + err.message, null)
  }
}
