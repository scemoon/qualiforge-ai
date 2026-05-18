const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(__dirname, '..', 'config');
const SKILLS_FILE = path.join(CONFIG_DIR, 'skills.json');
const DIMENSIONS_FILE = path.join(CONFIG_DIR, 'dimensions.json');

function loadJsonFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return null;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function exportSkills() {
    console.log('Exporting skills from local config...');

    const skills = loadJsonFile(SKILLS_FILE);
    const dimensions = loadJsonFile(DIMENSIONS_FILE);

    if (!skills || !dimensions) {
        console.error('Failed to load config files');
        process.exit(1);
    }

    const exportData = {
        exportedAt: new Date().toISOString(),
        version: skills.version,
        skills: skills.skills,
        dimensions: dimensions.dimensions
    };

    console.log('Exported data:');
    console.log(`- Skills count: ${exportData.skills.length}`);
    console.log(`- Dimensions count: ${exportData.dimensions.length}`);

    return exportData;
}

function exportToCloud() {
    const data = exportSkills();
    console.log('Export to cloud functionality would be called here.');
    console.log('Data prepared for cloud deployment.');
    return data;
}

if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.includes('--to-cloud')) {
        exportToCloud();
    } else {
        const data = exportSkills();
        console.log('\nExport complete. Data:', JSON.stringify(data, null, 2));
    }
}

module.exports = { exportSkills, exportToCloud };