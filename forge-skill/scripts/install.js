/**
 * install.js - 将 skill 配置安装到云数据库
 * 使用: node scripts/install.js
 */
const cloudbase = require('@cloudbase/node-sdk');

const ENV_ID = 'cloud1-2gavd8kj8a1ce021';

async function install() {
  const app = cloudbase.init({ env: ENV_ID });
  const db = app.database();
  const { skills } = require('../config/skills.json');
  const { sections } = require('../config/sections.json');
  
  console.log('Installing skills to cloud...');
  
  for (const skill of skills) {
    const existing = await db.collection('skills').where({ id: skill.id }).get();
    
    if (existing.data && existing.data.length > 0) {
      console.log(`Skill ${skill.name} exists, skipping...`);
      continue;
    }
    
    await db.collection('skills').add({
      data: {
        ...skill,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log(`Installed skill: ${skill.name}`);
  }
  
  console.log('\nInstalling sections...');
  for (const section of sections) {
    const existing = await db.collection('sections').where({ title: section.title }).get();
    if (existing.data && existing.data.length > 0) {
      console.log(`Section ${section.title} exists, skipping...`);
      continue;
    }
    
    await db.collection('sections').add({
      data: {
        ...section,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log(`Installed section: ${section.title}`);
  }
  
  console.log('\nInstallation complete!');
}

install().catch(console.error);