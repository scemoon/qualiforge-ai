/**
 * data-seeder - 直接写入 config.articleIds 到顶层（不使用 data 嵌套）
 */
const cloudbase = require('@cloudbase/node-sdk')
const HEADERS = { 'Content-Type': 'application/json' }

exports.main = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' }
  try {
    const app = cloudbase.init({ env: 'cloud1-2gavd8kj8a1ce021' })
    const db = app.database()
    const results = []

    // 获取所有官方文章 ID
    const allOfficial = await db.collection('articles').where({ type: 'official', status: 'approved' }).get()
    const officialIds = allOfficial.data.map(a => a._id)
    results.push('official_count:' + officialIds.length + ' => ' + JSON.stringify(officialIds))

    // 直接写 config.articleIds 到顶层（不经过 data 嵌套）
    await db.collection('sections').where({ _id: 'sec_official' }).update({
      data: { config: { articleIds: officialIds, limit: officialIds.length } }
    })
    results.push('sec_official config.articleIds updated to: ' + officialIds.length)

    // 获取前沿文章（type=article）作为 mock
    const frontierArticles = await db.collection('articles')
      .where({ status: 'approved' })
      .orderBy('publishedAt', 'desc')
      .limit(6)
      .get()
    const frontierIds = frontierArticles.data.map(a => a._id)
    results.push('frontier articles: ' + frontierIds.length + ' => ' + JSON.stringify(frontierIds))

    if (frontierIds.length > 0) {
      // Use set to ensure config.articleIds is properly persisted
      await db.collection('sections').doc('sec_latest').set({
        data: { title: '⚡ 前沿', config: { articleIds: frontierIds, limit: frontierIds.length }, order: 1 }
      })
      results.push('sec_latest set (title=⚡ 前沿, articleIds=' + frontierIds.length + ')')
    }

    // Update remaining sections
    await db.collection('sections').doc('sec_skill').set({
      data: { title: '🧪 评测', order: 2 }
    })
    await db.collection('sections').doc('sec_official').set({
      data: { title: '⭐ 官方出品', order: 3 }
    })

    // 验证
    const sections = await db.collection('sections').orderBy('order', 'asc').get()
    for (const s of sections.data) {
      const configArticleIds = s.config && s.config.articleIds ? s.config.articleIds : []
      results.push('section:' + s._id + ' | order:' + s.order + ' | config.articleIds:' + JSON.stringify(configArticleIds))
    }

    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ code: 0, message: 'ok', data: { results } }) }
  } catch (err) {
    console.error('Error:', err)
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ code: 500, message: err.message }) }
  }
}