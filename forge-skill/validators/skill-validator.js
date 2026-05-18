/**
 * skill-validator.js - 校验 skill 数据格式
 * 使用: node validators/skill-validator.js
 */
const { skills } = require('../config/skills.json');
const { sections } = require('../config/sections.json');

const VALID_WEIGHT_SUM = 1.0;
const VALID_WEIGHT_TOLERANCE = 0.001;

function validateSkill(skill) {
  const errors = [];
  
  if (!skill.id || typeof skill.id !== 'string') {
    errors.push('Missing or invalid id');
  }
  
  if (!skill.name || typeof skill.name !== 'string') {
    errors.push('Missing or invalid name');
  }
  
  if (!skill.icon || typeof skill.icon !== 'string') {
    errors.push('Missing or invalid icon');
  }
  
  if (!skill.color || !/^#[0-9A-Fa-f]{6}$/.test(skill.color)) {
    errors.push('Invalid color format (expected #RRGGBB)');
  }
  
  if (!skill.description || typeof skill.description !== 'string') {
    errors.push('Missing or invalid description');
  }
  
  if (!Array.isArray(skill.dimensions) || skill.dimensions.length === 0) {
    errors.push('dimensions must be a non-empty array');
  } else {
    let totalWeight = 0;
    skill.dimensions.forEach((dim, idx) => {
      if (!dim.name) errors.push(`Dimension ${idx}: missing name`);
      if (typeof dim.weight !== 'number') errors.push(`Dimension ${idx}: missing weight`);
      if (dim.weight < 0 || dim.weight > 1) errors.push(`Dimension ${idx}: weight must be 0-1`);
      if (dim.color && !/^#[0-9A-Fa-f]{6}$/.test(dim.color)) {
        errors.push(`Dimension ${idx}: invalid color`);
      }
      if (typeof dim.weight === 'number') totalWeight += dim.weight;
    });
    
    if (Math.abs(totalWeight - VALID_WEIGHT_SUM) > VALID_WEIGHT_TOLERANCE) {
      errors.push(`Dimensions weights sum to ${totalWeight.toFixed(3)}, expected ${VALID_WEIGHT_SUM}`);
    }
  }
  
  if (skill.enabled !== undefined && typeof skill.enabled !== 'boolean') {
    errors.push('enabled must be boolean');
  }
  
  return errors;
}

function validateSection(section) {
  const errors = [];
  
  if (!section.title || typeof section.title !== 'string') {
    errors.push('Missing or invalid title');
  }
  
  if (!section.type || typeof section.type !== 'string') {
    errors.push('Missing or invalid type');
  }
  
  const validTypes = ['article_list', 'skill_leaderboard', 'banner', 'video_list'];
  if (section.type && !validTypes.includes(section.type)) {
    errors.push(`Invalid type: ${section.type}. Valid: ${validTypes.join(', ')}`);
  }
  
  if (!section.icon || typeof section.icon !== 'string') {
    errors.push('Missing or invalid icon');
  }
  
  if (typeof section.weight !== 'number') {
    errors.push('Missing or invalid weight');
  }
  
  const validVisibilities = ['public', 'private', 'protected'];
  if (section.visibility && !validVisibilities.includes(section.visibility)) {
    errors.push(`Invalid visibility: ${section.visibility}`);
  }
  
  if (section.enabled !== undefined && typeof section.enabled !== 'boolean') {
    errors.push('enabled must be boolean');
  }
  
  return errors;
}

console.log('Validating forge-skill data...\n');

let hasErrors = false;

console.log(`Validating ${skills.length} skills...`);
skills.forEach((skill, idx) => {
  const errors = validateSkill(skill);
  if (errors.length > 0) {
    console.log(`\n✗ Skill[${idx}] ${skill.name || skill.id}:`);
    errors.forEach(e => console.log(`  - ${e}`));
    hasErrors = true;
  } else {
    console.log(`✓ Skill[${idx}] ${skill.name}: OK`);
  }
});

console.log(`\nValidating ${sections.length} sections...`);
sections.forEach((section, idx) => {
  const errors = validateSection(section);
  if (errors.length > 0) {
    console.log(`\n✗ Section[${idx}] ${section.title}:`);
    errors.forEach(e => console.log(`  - ${e}`));
    hasErrors = true;
  } else {
    console.log(`✓ Section[${idx}] ${section.title}: OK`);
  }
});

if (hasErrors) {
  console.log('\n✗ Validation FAILED');
  process.exit(1);
} else {
  console.log('\n✓ All validations passed!');
}