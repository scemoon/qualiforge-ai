#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Deploying skill configurations to cloud..."

if [ -f "$PROJECT_ROOT/config/skills.json" ]; then
    echo "Found skills.json, preparing deployment..."

    if command -v node &> /dev/null; then
        node "$SCRIPT_DIR/export-skills.js" --to-cloud
        echo "Skills deployed successfully!"
    else
        echo "Node.js not found. Please install Node.js to run this script."
        exit 1
    fi
else
    echo "Error: skills.json not found in config directory"
    exit 1
fi