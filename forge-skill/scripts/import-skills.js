const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(__dirname, '..', 'config');
const DATA_DIR = path.join(__dirname, '..', 'data');
const SKILLS_FILE = path.join(CONFIG_DIR, 'skills.json');
const DIMENSIONS_FILE = path.join(CONFIG_DIR, 'dimensions.json');
const SEED_FILE = path.join(DATA_DIR, 'seed-skills.json');

function validateSkillData(data) {
    if (!data.version || !data.skills || !Array.isArray(data.skills)) {
        throw new Error('Invalid skills data format');
    }

    data.skills.forEach(skill => {
        if (!skill.id || !skill.name) {
            throw new Error(`Skill missing required fields: ${JSON.stringify(skill)}`);
        }
    });

    return true;
}

function loadSeedData() {
    if (!fs.existsSync(SEED_FILE)) {
        console.warn('Seed file not found, using config/skills.json instead');
        return null;
    }
    return JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
}

function importSkills(sourceFile = null) {
    console.log('Importing skills to local config...');

    let sourceData;

    if (sourceFile) {
        if (!fs.existsSync(sourceFile)) {
            console.error(`Source file not found: ${sourceFile}`);
            process.exit(1);
        }
        sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
    } else {
        sourceData = loadSeedData() || JSON.parse(fs.readFileSync(SKILLS_FILE, 'utf8'));
    }

    validateSkillData(sourceData);

    console.log(`Importing ${sourceData.skills.length} skills...`);

    return sourceData;
}

function importToCloud(sourceFile = null) {
    const data = importSkills(sourceFile);

    console.log('Import to cloud functionality would be called here.');
    console.log('Data prepared for cloud import.');

    return data;
}

if (require.main === module) {
    const args = process.argv.slice(2);

    let sourceFile = null;
    let toCloud = false;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--to-cloud') {
            toCloud = true;
        } else if (args[i] === '--file' && args[i + 1]) {
            sourceFile = args[i + 1];
            i++;
        }
    }

    if (toCloud) {
        importToCloud(sourceFile);
    } else {
        importSkills(sourceFile);
    }
}

module.exports = { importSkills, importToCloud };