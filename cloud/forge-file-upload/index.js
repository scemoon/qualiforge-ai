/**
 * file-upload 云函数 - 文件上传
 * Actions: upload, getUploadSignature
 */
const cloudbase = require('@cloudbase/node-sdk')
const fs = require('fs')
const path = require('path')
const HEADERS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Content-Type': 'application/json' }

function respond(code, message, data = null) { return { code, message, data } }

exports.main = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' }
  try {
    const { action, data: postData = {} } = event.body || event

    // Simple upload: receive base64 file, save to CloudBase Storage
    if (action === 'upload') {
      const { fileContent, fileName, fileType = 'image' } = postData
      if (!fileContent || !fileName) return respond(400, '缺少文件内容或文件名')

      const ext = path.extname(fileName).toLowerCase()
      const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf']
      if (!allowedExts.includes(ext)) return respond(400, '不支持的文件类型')

      const safeName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`
      const cloudPath = `${fileType}/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${safeName}`

      const app = cloudbase.init({})
      const uploadResult = await app.uploadFile({
        cloudPath,
        fileContent: Buffer.from(fileContent, 'base64'),
      })

      const fileUrl = await app.getTempFileURL({ fileList: [uploadResult.fileID] })

      return respond(0, '上传成功', {
        fileId: uploadResult.fileID,
        url: fileUrl.fileList[0]?.tempFileURL || '',
      })
    }

    return respond(404, `Unknown action: ${action}`)
  } catch (err) {
    console.error('[FileUpload] Error:', err)
    return respond(500, `服务器错误: ${err.message}`)
  }
}
