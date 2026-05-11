/**
 * section-reset - Debug CloudBase NoSQL schema + rebuild sections
 */
const cloudbase = require('@cloudbase/node-sdk')
const HEADERS = { 'Content-Type': 'application/json' }

exports.main = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' }
  try {
    const app = cloudbase.init({ env: 'cloud1-2gavd8kj8a1ce021' })
    const db = app.database()
    const results = []

    // Check ALL sections without filter
    const all = await db.collection('sections').limit(20).get()
    results.push('total: ' + all.data.length)
    for (const s of all.data) {
      // Print raw keys and raw data.data structure
      results.push('---')
      results.push('top-level keys: ' + Object.keys(s).join(','))
      if (s.data && typeof s.data === 'object') {
        results.push('  data.data keys: ' + Object.keys(s.data).join(','))
      }
    }

    // Get articles
    const allArticles = await db.collection('articles').where({ status: 'approved' }).get()
    const articleIds = allArticles.data.map(a => a._id)
    const officialIds = allArticles.data.filter(a => a.type === 'official').map(a => a._id)

    // Rebuild using field-level update (no data wrapper)
    const updates = [
      { _id: 'sec_latest', title: '⚡ 前沿', type: 'article_list', config: { articleIds: articleIds.slice(0,6), limit: 6 }, order: 1, visibility: 'public', enabled: true },
      { _id: 'sec_skill', title: '🧪 评测', type: 'skill_leaderboard', config: { skillId: 'skill_code_gen', limit: 8, articleIds: [] }, order: 2, visibility: 'public', enabled: true },
      { _id: 'sec_official', title: '⭐ 官方出品', type: 'article_list', config: { articleIds: officialIds, limit: officialIds.length }, order: 3, visibility: 'public', enabled: true },
    ]

    for (const upd of updates) {
      const { _id, ...fields } = upd
      await db.collection('sections').where({ _id }).update({ data: fields })
      results.push('updated: ' + _id)
    }

    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ code: 0, message: 'ok', data: { results } }) }
  } catch (err) {
    console.error('Error:', err)
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ code: 500, message: err.message }) }
  }
}
