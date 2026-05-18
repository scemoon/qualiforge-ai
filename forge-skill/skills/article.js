/**
 * Article Skill - 文章管理技能
 */
const cloudbase = require('@cloudbase/node-sdk')

const db = () => cloudbase.init({ env: 'cloud1-2gavd8kj8a1ce021' }).database()

module.exports = {
  actions: {
    create: async (params) => {
      const { title, content, authorId, tags } = params
      if (!title || !content || !authorId) {
        return { code: 400, message: '缺少必填字段' }
      }

      const articleId = `article_${Date.now()}`
      await db().collection('articles').add({
        data: {
          _id: articleId,
          title,
          content,
          authorId,
          tags: tags || [],
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      return { code: 0, message: '文章创建成功', data: { articleId } }
    },

    read: async (params) => {
      const { articleId } = params
      if (!articleId) {
        return { code: 400, message: '缺少 articleId' }
      }

      const result = await db().collection('articles').doc(articleId).get()
      if (!result.data || result.data.length === 0) {
        return { code: 404, message: '文章不存在' }
      }

      return { code: 0, message: '获取成功', data: result.data[0] }
    },

    update: async (params) => {
      const { articleId, title, content, tags } = params
      if (!articleId) {
        return { code: 400, message: '缺少 articleId' }
      }

      const updateData = { updatedAt: new Date() }
      if (title) updateData.title = title
      if (content) updateData.content = content
      if (tags) updateData.tags = tags

      await db().collection('articles').doc(articleId).update({ data: updateData })
      return { code: 0, message: '文章更新成功' }
    },

    delete: async (params) => {
      const { articleId } = params
      if (!articleId) {
        return { code: 400, message: '缺少 articleId' }
      }

      await db().collection('articles').doc(articleId).remove()
      return { code: 0, message: '文章删除成功' }
    },

    list: async (params) => {
      const { page = 1, pageSize = 10, authorId, status } = params
      const query = db().collection('articles')

      if (authorId) query.where({ authorId })
      if (status) query.where({ status })

      const skip = (page - 1) * pageSize
      const result = await query.skip(skip).limit(pageSize).get()

      return { code: 0, message: '获取成功', data: { list: result.data, total: result.data.length, page, pageSize } }
    },

    publish: async (params) => {
      const { articleId } = params
      if (!articleId) {
        return { code: 400, message: '缺少 articleId' }
      }

      await db().collection('articles').doc(articleId).update({
        data: { status: 'published', publishedAt: new Date() }
      })

      return { code: 0, message: '文章发布成功' }
    }
  }
}