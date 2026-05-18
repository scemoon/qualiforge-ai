/**
 * Skills Test Suite
 */
const { skills } = require('../config/skills.json');
const { sections } = require('../config/sections.json');

function assert(condition, message) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function assertValidWeightSum(dimensions) {
  const sum = dimensions.reduce((acc, d) => acc + d.weight, 0);
  assert(
    Math.abs(sum - 1.0) < 0.001,
    `Weights sum to ${sum}, expected 1.0`
  );
}

console.log('Running skill tests...\n');

let passed = 0;
let failed = 0;

skills.forEach((skill, idx) => {
  try {
    assert(skill.id, `Skill[${idx}]: missing id`);
    assert(skill.name, `Skill[${idx}]: missing name`);
    assert(skill.icon, `Skill[${idx}]: missing icon`);
    assert(skill.color && /^#[0-9A-Fa-f]{6}$/.test(skill.color), `Skill[${idx}]: invalid color`);
    assert(Array.isArray(skill.dimensions) && skill.dimensions.length > 0, `Skill[${idx}]: invalid dimensions`);
    assertValidWeightSum(skill.dimensions);
    console.log(`✓ Skill[${idx}] ${skill.name}`);
    passed++;
  } catch (e) {
    console.log(`✗ Skill[${idx}] ${skill.name}: ${e.message}`);
    failed++;
  }
});

sections.forEach((section, idx) => {
  try {
    assert(section.title, `Section[${idx}]: missing title`);
    assert(section.type, `Section[${idx}]: missing type`);
    assert(section.icon, `Section[${idx}]: missing icon`);
    assert(typeof section.weight === 'number', `Section[${idx}]: invalid weight`);
    console.log(`✓ Section[${idx}] ${section.title}`);
    passed++;
  } catch (e) {
    console.log(`✗ Section[${idx}] ${section.title}: ${e.message}`);
    failed++;
  }
});

console.log(`\nTests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);