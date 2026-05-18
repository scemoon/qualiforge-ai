/**
 * Skill Skill - 技能管理技能（meta skill）
 */
const fs = require('fs')
const path = require('path')

const skillsMeta = {
  auth: { name: 'auth', description: '用户认证', version: '1.0' },
  article: { name: 'article', description: '文章管理', version: '1.0' },
  evaluation: { name: 'evaluation', description: '评测管理', version: '1.0' },
  tag: { name: 'tag', description: '标签管理', version: '1.0' },
  skill: { name: 'skill', description: '技能管理', version: '1.0' }
}

module.exports = {
  actions: {
    register: async (params) => {
      const { skillName, skillPath } = params
      if (!skillName) {
        return { code: 400, message: '缺少 skillName' }
      }

      skillsMeta[skillName] = {
        name: skillName,
        path: skillPath || `./skills/${skillName}.js`,
        registeredAt: new Date()
      }

      return { code: 0, message: '技能注册成功', data: { skillName } }
    },

    list: async (params) => {
      return { code: 0, message: '获取成功', data: { skills: Object.values(skillsMeta), total: Object.keys(skillsMeta).length } }
    },

    invoke: async (params) => {
      const { skillName, action, params: skillParams } = params
      if (!skillName) {
        return { code: 400, message: '缺少 skillName' }
      }

      const skill = require(`./${skillName}`)
      if (action && skill.actions && typeof skill.actions[action] === 'function') {
        return await skill.actions[action](skillParams || {}, {})
      }

      return { code: 400, message: `Skill ${skillName} 没有 ${action} 方法` }
    }
  }
}