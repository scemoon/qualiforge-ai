const cloudbase = require('@cloudbase/node-sdk')
const app = cloudbase.init({ env: 'cloud1-2gavd8kj8a1ce021' })
const db = app.database()

async function test() {
  console.log('Testing in query with field projection...')
  
  // Test 1: Basic in query
  const r1 = await db.collection('articles').where({ 
    _id: db.command.in(['art_001', 'art_sample_001'])
  }).get()
  console.log('Test1 (no field): count=' + r1.data.length + ' ids=' + r1.data.map(a=>a._id))
  
  // Test 2: With field projection
  const r2 = await db.collection('articles').where({ 
    _id: db.command.in(['art_001', 'art_sample_001'])
  }).field({ _id: true, title: true, status: true }).get()
  console.log('Test2 (with field): count=' + r2.data.length)
  
  // Test 3: Status filter + in
  const r3 = await db.collection('articles').where({ 
    _id: db.command.in(['art_001', 'art_sample_001']),
    status: 'approved'
  }).get()
  console.log('Test3 (with status): count=' + r3.data.length + ' ids=' + r3.data.map(a=>a._id))
  
  // Test 4: Just art_001
  const r4 = await db.collection('articles').where({ _id: 'art_001' }).get()
  console.log('Test4 (just art_001): count=' + r4.data.length + ' data=' + JSON.stringify(r4.data[0] || null))
  
  // Test 5: Check what the first article record looks like with field projection
  const r5 = await db.collection('articles').limit(2).field({ _id: true, title: true }).get()
  console.log('Test5 (limit+field):')
  for (const a of r5.data) {
    console.log('  _id=' + a._id + ' title=' + a.title + ' keys=' + Object.keys(a).join(','))
  }
}
test().catch(console.error)
