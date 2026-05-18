/**
 * Register all skills to cloud
 */
const cloudbase = require('@cloudbase/node-sdk')
const fs = require('fs')
const path = require('path')

const env = cloudbase.init({ env: 'cloud1-2gavd8kj8a1ce021' })
const db = env.database()

const skillsDir = path.join(__dirname, '../skills')
const capabilityConfig = require('../config/capabilities.json')

async function registerSkills() {
  console.log('开始注册技能...')

  const functions = []

  for (const skill of capabilityConfig.capabilities) {
    const skillFile = path.join(skillsDir, `${skill.name}.js`)

    if (fs.existsSync(skillFile)) {
      console.log(`注册技能: ${skill.name}`)
      functions.push({
        name: `forge-skill-${skill.name}`,
        handler: `forge-skill/skills/${skill.name}.main`,
        description: skill.description
      })
    }
  }

  console.log(`共注册 ${functions.length} 个技能`)
  return functions
}

if (require.main === module) {
  registerSkills().then(() => {
    console.log('技能注册完成')
  }).catch(err => {
    console.error('注册失败:', err)
    process.exit(1)
  })
}

module.exports = { registerSkills }