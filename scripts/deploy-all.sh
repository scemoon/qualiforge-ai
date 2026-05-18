#!/bin/bash
# Deploy all forge-* cloud functions to CloudBase

set -e

ENV_ID="cloud1-2gavd8kj8a1ce021"
CLOUD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../cloud"

echo "=== Deploying all Cloud Functions to $ENV_ID ==="
echo ""

# List of all cloud functions to deploy
FUNCTIONS=(
  "forge-auth"
  "forge-user-crud"
  "forge-article-crud"
  "forge-skill-crud"
  "forge-evaluation-crud"
  "forge-section-crud"
  "forge-notification-crud"
  "forge-search"
  "forge-file-upload"
  "forge-wechat-sync"
  "forge-skill"
)

for FUNC in "${FUNCTIONS[@]}"; do
  FUNC_DIR="$CLOUD_DIR/$FUNC"

  if [ -d "$FUNC_DIR" ]; then
    echo "--- Deploying $FUNC ---"
    cd "$FUNC_DIR"

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
      npm install 2>/dev/null || true
    fi

    # Deploy
    tcb fn deploy $FUNC --env-id $ENV_ID --force || echo "Failed to deploy $FUNC"
    echo ""
  else
    echo "Skipping $FUNC (directory not found)"
  fi
done

echo ""
echo "=== All functions deployed ==="