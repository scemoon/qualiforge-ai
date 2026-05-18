# Forge Skill Module

This module contains skill definitions, data, and management scripts for Forge AI evaluation platform.

## Directory Structure

```
forge-skill/
├── README.md                    # This file
├── package.json                 # npm entry point
├── scripts/
│   ├── deploy-to-cloud.sh       # Deploy skill configs to cloud
│   ├── sync-sections.sh         # Sync skills to homepage sections
│   ├── export-skills.js         # Export skill data from cloud
│   └── import-skills.js         # Import skill data to cloud
├── config/
│   ├── skills.json              # Skill list definitions
│   └── dimensions.json          # Evaluation dimensions
├── data/
│   └── seed-skills.json         # Initial seed data
└── docs/
    ├── README.md                # Usage documentation
    └── skill-guide.md           # Skill creation guide
```

## Purpose

This module is for **skill definitions and data management only** - NOT cloud function code.

Cloud functions are located in the `/cloud` directory.

## Quick Start

1. Import skills to cloud:
   ```bash
   npm run import
   ```

2. Deploy skills to cloud:
   ```bash
   npm run deploy
   ```

3. Sync skills to homepage:
   ```bash
   npm run sync
   ```