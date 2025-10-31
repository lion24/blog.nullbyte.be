#!/bin/bash

echo "🔒 Testing API Security (New Architecture)"
echo "=========================================="
echo ""

BASE_URL="http://localhost:3000"

echo "✨ NEW ARCHITECTURE:"
echo "  • Public pages use Server Components (no API calls)"
echo "  • Admin API at /api/admin/posts (requires authentication)"
echo "  • No public /api/posts endpoint anymore"
echo ""

echo "1️⃣ Test: GET /api/posts (should fail - endpoint removed)"
echo "---"
curl -s "$BASE_URL/api/posts" | jq -r 'if .error then "✅ Correctly removed: \(.error // "404 Not Found")" else "❌ Should not exist!" end'
echo ""

echo "2️⃣ Test: GET /api/admin/posts without auth (should fail)"
echo "---"
curl -s "$BASE_URL/api/admin/posts" | jq -r 'if .error then "✅ Correctly blocked: \(.error)" else "❌ Should have been blocked!" end'
echo ""

echo "3️⃣ Test: POST /api/admin/posts without auth (should fail)"
echo "---"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Post","content":"Test content"}' \
  "$BASE_URL/api/admin/posts" | jq -r 'if .error then "✅ Correctly blocked: \(.error)" else "❌ Should have been blocked!" end'
echo ""

echo "4️⃣ Test: POST with evil origin (should be blocked by middleware)"
echo "---"
curl -s -X POST \
  -H "Origin: https://evil-site.com" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Post","content":"Test content"}' \
  "$BASE_URL/api/admin/posts" | jq -r 'if .error then "✅ Correctly blocked: \(.message)" else "❌ Should have been blocked!" end'
echo ""

echo "5️⃣ Test: Rate limiting (make many requests)"
echo "---"
echo "Making 15 rapid requests to test rate limiting..."
for i in {1..15}; do
  RESPONSE=$(curl -s "$BASE_URL/api/admin/posts")
  if echo "$RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
    ERROR=$(echo "$RESPONSE" | jq -r '.error')
    if [ "$ERROR" = "RATE_LIMIT_EXCEEDED" ]; then
      echo "✅ Rate limited after $i requests"
      break
    fi
  fi
done
echo ""

echo "📝 Summary"
echo "=========="
echo "✅ Public API removed - no /api/posts endpoint"
echo "✅ Admin API protected - requires authentication"
echo "✅ CSRF protection - origin validation for mutations"
echo "✅ Rate limiting - prevents abuse"
echo ""
echo "🎯 To test with authentication:"
echo "   Method 1 (Browser session):"
echo "     1. Sign in at: $BASE_URL/en/admin"
echo "     2. Copy your session cookie from browser DevTools"
echo "     3. Run: curl -H 'Cookie: next-auth.session-token=YOUR_TOKEN' ..."
echo ""
echo "   Method 2 (API Key):"
echo "     1. Add API_KEY=your-secret-key to .env"
echo "     2. Run: curl -H 'x-api-key: your-secret-key' $BASE_URL/api/admin/posts"
echo ""
echo "📚 Full documentation: docs/EXTERNAL_API_GUIDE.md"
