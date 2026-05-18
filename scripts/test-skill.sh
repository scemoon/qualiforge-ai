#!/bin/bash
# Test forge-skill cloud function

ENV_ID="cloud1-2gavd8kj8a1ce021"
FUNCTION_NAME="forge-skill"
BASE_URL="https://$ENV_ID.service.cloudbase.cn/$FUNCTION_NAME/main"

echo "=== Testing $FUNCTION_NAME ==="
echo ""

# Test 1: Login
echo "1. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"action":"login","data":{"email":"admin@qualiforge.ai","password":"admin123456"}}')

echo "Response: $LOGIN_RESPONSE"
echo ""

# Extract token (you may need to modify based on actual response format)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "Login successful! Token: $TOKEN"
    echo ""

    # Test 2: Get stats
    echo "2. Testing getStats..."
    curl -s -X POST "$BASE_URL" \
      -H "Content-Type: application/json" \
      -d '{"action":"getStats"}' | jq .
    echo ""

    # Test 3: List tags
    echo "3. Testing listTags..."
    curl -s -X POST "$BASE_URL" \
      -H "Content-Type: application/json" \
      -d '{"action":"listTags"}' | jq .
    echo ""

    # Test 4: List skills
    echo "4. Testing listSkills..."
    curl -s -X POST "$BASE_URL" \
      -H "Content-Type: application/json" \
      -d '{"action":"listSkills"}' | jq .
    echo ""
else
    echo "Login failed. Please check credentials."
fi

echo ""
echo "=== Tests complete ==="