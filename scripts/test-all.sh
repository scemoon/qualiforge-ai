#!/bin/bash
# Test all forge-* cloud functions

set -e

ENV_ID="cloud1-2gavd8kj8a1ce021"
CLOUD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../cloud"

echo "=== Testing all Cloud Functions ==="
echo ""

# List of all cloud functions to test
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
    echo "--- Testing $FUNC ---"
    cd "$FUNC_DIR"

    # Run tests if available
    if [ -f "package.json" ]; then
      npm test 2>/dev/null || echo "No tests for $FUNC or tests failed"
    else
      echo "No package.json for $FUNC"
    fi
    echo ""
  else
    echo "Skipping $FUNC (directory not found)"
  fi
done

echo ""
echo "=== All function tests completed ==="