/**
 * Tag Skill - 标签管理技能
 */
const cloudbase = require('@cloudbase/node-sdk')

const db = () => cloudbase.init({ env: 'cloud1-2gavd8kj8a1ce021' }).database()

module.exports = {
  actions: {
    create: async (params) => {
      const { name, description, color } = params
      if (!name) {
        return { code: 400, message: '缺少 name' }
      }

      const tagId = `tag_${Date.now()}`
      await db().collection('tags').add({
        data: {
          _id: tagId,
          name,
          description: description || '',
          color: color || '#666666',
          createdAt: new Date()
        }
      })

      return { code: 0, message: '标签创建成功', data: { tagId } }
    },

    list: async (params) => {
      const { page = 1, pageSize = 20 } = params
      const result = await db().collection('tags').skip((page - 1) * pageSize).limit(pageSize).get()

      return { code: 0, message: '获取成功', data: { list: result.data, total: result.data.length } }
    },

    delete: async (params) => {
      const { tagId } = params
      if (!tagId) {
        return { code: 400, message: '缺少 tagId' }
      }

      await db().collection('tags').doc(tagId).remove()
      return { code: 0, message: '标签删除成功' }
    }
  }
}