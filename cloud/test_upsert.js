const cloudbase = require('@cloudbase/node-sdk')
const app = cloudbase.init({ env: 'cloud1-2gavd8kj8a1ce021' })
const db = app.database()

async function test() {
  // Check what the raw article record looks like
  const arts = await db.collection('articles').limit(1).get()
  console.log('Article structure:', JSON.stringify(arts.data[0], null, 2))
  
  // Try updating just the 'data.title' field using where on _id
  const firstId = arts.data[0]._id
  console.log('Trying to update title for:', firstId)
  
  try {
    const r = await db.collection('articles').where({ _id: firstId }).update({
      'data.title': '测试标题'
    })
    console.log('update result:', JSON.stringify(r))
  } catch(e) {
    console.log('error:', e.message)
  }
}
test().catch(console.error)
