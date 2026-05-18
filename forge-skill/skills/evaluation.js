/**
 * Evaluation Skill - 评测管理技能
 */
const cloudbase = require('@cloudbase/node-sdk')

const db = () => cloudbase.init({ env: 'cloud1-2gavd8kj8a1ce021' }).database()

module.exports = {
  actions: {
    create: async (params) => {
      const { title, description, evaluatorId, criteria } = params
      if (!title || !description || !evaluatorId) {
        return { code: 400, message: '缺少必填字段' }
      }

      const evalId = `eval_${Date.now()}`
      await db().collection('evaluations').add({
        data: {
          _id: evalId,
          title,
          description,
          evaluatorId,
          criteria: criteria || [],
          status: 'pending',
          createdAt: new Date()
        }
      })

      return { code: 0, message: '评测创建成功', data: { evalId } }
    },

    list: async (params) => {
      const { page = 1, pageSize = 10, status, evaluatorId } = params
      const query = db().collection('evaluations')

      if (status) query.where({ status })
      if (evaluatorId) query.where({ evaluatorId })

      const skip = (page - 1) * pageSize
      const result = await query.skip(skip).limit(pageSize).get()

      return { code: 0, message: '获取成功', data: { list: result.data, total: result.data.length, page, pageSize } }
    },

    get: async (params) => {
      const { evalId } = params
      if (!evalId) {
        return { code: 400, message: '缺少 evalId' }
      }

      const result = await db().collection('evaluations').doc(evalId).get()
      if (!result.data || result.data.length === 0) {
        return { code: 404, message: '评测不存在' }
      }

      return { code: 0, message: '获取成功', data: result.data[0] }
    },

    approve: async (params) => {
      const { evalId, approved, comment } = params
      if (!evalId) {
        return { code: 400, message: '缺少 evalId' }
      }

      await db().collection('evaluations').doc(evalId).update({
        data: {
          status: approved ? 'approved' : 'rejected',
          comment: comment || '',
          approvedAt: new Date()
        }
      })

      return { code: 0, message: approved ? '评测通过' : '评测拒绝' }
    }
  }
}