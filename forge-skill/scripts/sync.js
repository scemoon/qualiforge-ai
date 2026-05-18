/**
 * sync.js - 同步 skills 到首页板块
 * 使用: node scripts/sync.js
 */
const cloudbase = require('@cloudbase/node-sdk');

const ENV_ID = 'cloud1-2gavd8kj8a1ce021';

async function sync() {
  const app = cloudbase.init({ env: ENV_ID });
  const db = app.database();
  const { sections } = require('../config/sections.json');
  
  console.log('Syncing sections to homepage...\n');
  
  for (const section of sections) {
    const existing = await db.collection('sections').where({ title: section.title }).get();
    
    if (existing.data && existing.data.length > 0) {
      await db.collection('sections').where({ title: section.title }).update({
        data: {
          ...section,
          updatedAt: new Date()
        }
      });
      console.log(`Updated section: ${section.title}`);
    } else {
      await db.collection('sections').add({
        data: {
          ...section,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log(`Created section: ${section.title}`);
    }
  }
  
  console.log('\nSync complete!');
}

sync().catch(console.error);