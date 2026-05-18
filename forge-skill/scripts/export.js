/**
 * export.js - 从云数据库导出 skill 数据
 * 使用: node scripts/export.js [output-file]
 */
const cloudbase = require('@cloudbase/node-sdk');
const fs = require('fs');

const ENV_ID = 'cloud1-2gavd8kj8a1ce021';

async function exportData(outputFile = '../data/exported-skills.json') {
  const app = cloudbase.init({ env: ENV_ID });
  const db = app.database();
  
  console.log('Exporting skills from cloud...\n');
  
  const skillsResult = await db.collection('skills').get();
  const sectionsResult = await db.collection('sections').get();
  
  const exportData = {
    exportedAt: new Date().toISOString(),
    skills: skillsResult.data || [],
    sections: sectionsResult.data || []
  };
  
  const outputPath = require('path').resolve(__dirname, outputFile);
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
  
  console.log(`Exported ${exportData.skills.length} skills`);
  console.log(`Exported ${exportData.sections.length} sections`);
  console.log(`\nData saved to: ${outputPath}`);
}

exportData().catch(console.error);