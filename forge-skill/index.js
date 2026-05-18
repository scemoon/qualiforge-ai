/**
 * forge-skill - Forge AI 技能系统
 * 统一调度平台所有技能
 */
const authSkill = require('./skills/auth')
const articleSkill = require('./skills/article')
const evaluationSkill = require('./skills/evaluation')
const tagSkill = require('./skills/tag')
const skillSkill = require('./skills/skill')

const skills = {
  auth: authSkill,
  article: articleSkill,
  evaluation: evaluationSkill,
  tag: tagSkill,
  skill: skillSkill
}

exports.main = async (event, context) => {
  const skillName = event.skill || event.path
  const action = event.action
  const params = event.params || event.data || {}

  if (!skillName) {
    return { code: 400, message: '缺少 skill 参数' }
  }

  const skill = skills[skillName]
  if (!skill) {
    return { code: 404, message: `Skill ${skillName} 不存在` }
  }

  if (!action && typeof skill === 'function') {
    return await skill(params, context)
  }

  if (action && skill.actions && typeof skill.actions[action] === 'function') {
    return await skill.actions[action](params, context)
  }

  return { code: 400, message: `Skill ${skillName} 没有 ${action} 方法` }
}