#!/bin/bash
# Deploy forge-skill cloud function to CloudBase

set -e

ENV_ID="cloud1-2gavd8kj8a1ce021"
FUNCTION_NAME="forge-skill"

echo "=== Deploying $FUNCTION_NAME to $ENV_ID ==="

# Check if CloudBase CLI is installed
if ! command -v tcb &> /dev/null; then
    echo "Error: CloudBase CLI (tcb) is not installed"
    echo "Install it with: npm install -g @cloudbase/cli"
    exit 1
fi

# Navigate to the skill directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")/cloud/$FUNCTION_NAME"

cd "$SKILL_DIR"

echo "Current directory: $(pwd)"
echo "Files to deploy:"
ls -la

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Deploy the function
echo "Deploying $FUNCTION_NAME..."
tcb fn deploy $FUNCTION_NAME --env-id $ENV_ID --force

echo ""
echo "=== Deployment complete! ==="
echo "You can test the function with:"
echo "curl -X POST https://$ENV_ID.service.cloudbase.cn/$FUNCTION_NAME/main"