/**
 * wechat-sync 云函数 - 微信公众号同步
 * Actions: syncArticle, getSyncLogs, setConfig, getConfig
 */
const cloudbase = require('@cloudbase/node-sdk')
const crypto = require('crypto')
const https = require('https')
const HEADERS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Content-Type': 'application/json' }

function respond(code, message, data = null) { return { code, message, data } }
function getDb() { const app = cloudbase.init({ env: 'cloud1-2gavd8kj8a1ce021' }); return app.database() }

function httpPost(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body)
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers },
    }
    const req = https.request(url, options, (res) => {
      let d = ''
      res.on('data', chunk => d += chunk)
      res.on('end', () => resolve(JSON.parse(d)))
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

exports.main = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' }
  try {
    const rawBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body; const { action, data = {} } = rawBody || event
    const db = getDb()
    const ctx = getCloudbaseContext(context)
    const OPENID = ctx.OPENID || ctx.userId || ''

    if (!OPENID) return respond(401, '请先登录')
    // TODO: check admin role for write operations

    // Get WeChat config from wechat_config collection (singleton)
    async function getWechatConfig() {
      const configs = await db.collection('wechat_config').get()
      return configs.data && configs.data.length > 0 ? configs.data[0] : null
    }

    if (action === 'setConfig') {
      const { appId, appSecret, token } = data
      const existing = await db.collection('wechat_config').get()

      const configData = {
        _id: 'wechat_config_main',
        appId,
        appSecret,
        token: token || '',
        updatedAt: new Date(),
      }

      if (existing.data && existing.data.length > 0) {
        await db.collection('wechat_config').where({ _id: 'wechat_config_main' }).update({ data: configData })
      } else {
        await db.collection('wechat_config').add({ data: configData })
      }
      return respond(0, '配置已保存')
    }

    if (action === 'getConfig') {
      const config = await getWechatConfig()
      if (!config) return respond(0, 'success', { appId: '', appSecret: '', token: '' })
      return respond(0, 'success', { appId: config.appId || '', token: config.token || '' })
    }

    // Get access token
    if (action === 'getAccessToken') {
      const config = await getWechatConfig()
      if (!config?.appId || !config?.appSecret) return respond(400, '微信公众号配置不完整')

      const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appId}&secret=${config.appSecret}`
      const res = await httpPost(url, {})

      if (res.access_token) {
        return respond(0, 'success', { accessToken: res.access_token, expiresIn: res.expires_in })
      }
      return respond(500, '获取 access_token 失败')
    }

    // Sync article to WeChat (placeholder - real implementation uses draft API)
    if (action === 'syncArticle') {
      const { articleId } = data
      const articles = await db.collection('articles').where({ _id: articleId }).get()
      if (!articles.data || articles.data.length === 0) return respond(404, '文章不存在')

      const article = articles.data[0]
      const config = await getWechatConfig()
      if (!config?.appId) return respond(400, '微信公众号未配置')

      // Log the sync attempt
      await db.collection('sync_logs').add({
        data: {
          _id: `sync_${Date.now()}`,
          articleId,
          articleTitle: article.title,
          status: 'pending',
          createdAt: new Date(),
        }
      })

      // TODO: Real WeChat draft article API call
      // const accessToken = ... (get from WeChat API)
      // const url = `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${accessToken}`
      // await httpPost(url, { articles: [{ title: article.title, content: article.content, ... }] })

      // Mark as synced
      await db.collection('articles').where({ _id: articleId }).update({
        data: { wechatSynced: true }
      })

      return respond(0, '同步成功（模拟）', { articleId, syncStatus: 'synced' })
    }

    if (action === 'getSyncLogs') {
      if (!OPENID) return respond(401, '请先登录')
      const { page = 1, pageSize = 20 } = data
      const skip = (page - 1) * pageSize
      const list = await db.collection('sync_logs')
        .orderBy('createdAt', 'desc')
        .skip(skip)
        .limit(pageSize)
        .get()
      return respond(0, 'success', { list: list.data })
    }

    return respond(404, `Unknown action: ${action}`)
  } catch (err) {
    console.error('[WechatSync] Error:', err)
    return respond(500, `服务器错误: ${err.message}`)
  }
}
