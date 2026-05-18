/**
 * import.js - 从文件导入 skill 数据到云数据库
 * 使用: node scripts/import.js <input-file>
 */
const cloudbase = require('@cloudbase/node-sdk');
const fs = require('fs');

const ENV_ID = 'cloud1-2gavd8kj8a1ce021';

async function importData(inputFile = '../data/seed-skills.json') {
  const app = cloudbase.init({ env: ENV_ID });
  const db = app.database();
  
  const inputPath = require('path').resolve(__dirname, inputFile);
  
  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  
  console.log(`Importing from: ${inputPath}\n`);
  
  if (data.skills) {
    console.log(`Importing ${data.skills.length} skills...`);
    for (const skill of data.skills) {
      const existing = await db.collection('skills').where({ id: skill.id }).get();
      if (existing.data && existing.data.length > 0) {
        await db.collection('skills').where({ id: skill.id }).update({
          data: { ...skill, updatedAt: new Date() }
        });
      } else {
        await db.collection('skills').add({
          data: { ...skill, createdAt: new Date(), updatedAt: new Date() }
        });
      }
    }
    console.log('Skills imported successfully');
  }
  
  if (data.sections) {
    console.log(`\nImporting ${data.sections.length} sections...`);
    for (const section of data.sections) {
      const existing = await db.collection('sections').where({ title: section.title }).get();
      if (existing.data && existing.data.length > 0) {
        await db.collection('sections').where({ title: section.title }).update({
          data: { ...section, updatedAt: new Date() }
        });
      } else {
        await db.collection('sections').add({
          data: { ...section, createdAt: new Date(), updatedAt: new Date() }
        });
      }
    }
    console.log('Sections imported successfully');
  }
  
  console.log('\nImport complete!');
}

const args = process.argv.slice(2);
importData(args[0]).catch(console.error);