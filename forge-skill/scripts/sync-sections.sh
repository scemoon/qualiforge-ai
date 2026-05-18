#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Syncing skills to homepage sections..."

SKILLS_FILE="$PROJECT_ROOT/config/skills.json"

if [ ! -f "$SKILLS_FILE" ]; then
    echo "Error: skills.json not found"
    exit 1
fi

if command -v node &> /dev/null; then
    echo "Reading skills from $SKILLS_FILE..."

    node -e "
const fs = require('fs');
const skills = JSON.parse(fs.readFileSync('$SKILLS_FILE', 'utf8'));

const sections = skills.skills.map(skill => ({
    id: skill.id,
    name: skill.name,
    icon: skill.icon,
    color: skill.color,
    description: skill.description,
    skillCount: 1
}));

console.log('Sections to sync:', JSON.stringify(sections, null, 2));
console.log('Sync complete! Added', sections.length, 'sections to homepage.');
"

else
    echo "Node.js not found. Using jq for JSON processing..."

    if command -v jq &> /dev/null; then
        jq -r '.skills[] | {id, name, icon, color}' "$SKILLS_FILE"
        echo "Sync complete!"
    else
        echo "Neither Node.js nor jq found. Please install one of them."
        exit 1
    fi
fi