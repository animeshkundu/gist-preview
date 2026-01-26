#!/usr/bin/env bash
# Primary validation script for AI agents
# Purpose: Run all validation checks before committing code
# Usage: ./scripts/validate.sh
# Exit codes:
#   0 - All validations passed
#   1 - One or more validations failed

set -e

echo "🔍 GistPreview Validation Script"
echo "================================="
echo ""

# Step 1: TypeScript type checking
echo "📘 Step 1/4: Running TypeScript type check..."
npm run typecheck
echo "✅ Type check passed!"
echo ""

# Step 2: ESLint linting
echo "🔧 Step 2/4: Running ESLint..."
npm run lint
echo "✅ Linting passed!"
echo ""

# Step 3: Run tests
echo "🧪 Step 3/4: Running tests..."
npm test
echo "✅ Tests passed!"
echo ""

# Step 4: Check coverage
echo "📊 Step 4/4: Checking test coverage (90% threshold)..."
npm run test:coverage
echo "✅ Coverage check passed!"
echo ""

echo "================================="
echo "🎉 All validations passed!"
echo ""
echo "You can now safely commit your changes."
