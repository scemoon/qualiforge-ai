/**
 * populate-data - Add mock non-official articles for 前沿 section
 */
const cloudbase = require('@cloudbase/node-sdk')
const HEADERS = { 'Content-Type': 'application/json' }

exports.main = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' }
  try {
    const app = cloudbase.init({ env: 'cloud1-2gavd8kj8a1ce021' })
    const db = app.database()
    const results = []

    // Add mock non-official articles
    const mockArticles = [
      { 
        _id: 'art_001', 
        title: 'AI Coding 最佳实践指南', 
        type: 'article', 
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
        authorId: 'community_user_001',
        publishedAt: new Date('2026-05-01'),
        status: 'approved',
        summary: '探讨 AI 辅助编程的最佳实践和方法论'
      },
      { 
        _id: 'art_002', 
        title: '代码审查中的 AI 协作模式', 
        type: 'article', 
        coverImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&q=80',
        authorId: 'community_user_002',
        publishedAt: new Date('2026-04-30'),
        status: 'approved',
        summary: '如何利用 AI 提升代码审查效率'
      },
      { 
        _id: 'art_003', 
        title: 'LLM 在自动化测试中的应用', 
        type: 'article', 
        coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
        authorId: 'community_user_003',
        publishedAt: new Date('2026-04-29'),
        status: 'approved',
        summary: '探索大语言模型生成测试用例的可能性'
      },
    ]

    for (const article of mockArticles) {
      try {
        const result = await db.collection('articles').add({ data: { ...article, createdAt: new Date() } })
        results.push('added: ' + article._id + ' -> ' + JSON.stringify(result.id))
      } catch (e) {
        if (e.message && e.message.includes('duplicate')) {
          results.push('exists: ' + article._id)
        } else {
          results.push('error: ' + e.message)
        }
      }
    }

    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ code: 0, message: 'ok', data: { results } }) }
  } catch (err) {
    console.error('Error:', err)
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ code: 500, message: err.message }) }
  }
}
