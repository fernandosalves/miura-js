#!/bin/bash

# Miura Build & Deploy Script
# Order: debugger -> render -> element -> router -> framework -> data-flow -> miura

set -e # Exit on error

PACKAGES=(
  "miura-debugger"
  "miura-render"
  "miura-element"
  "miura-router"
  "miura-framework"
  "miura-data-flow"
)

ROOT_DIR=$(pwd)

echo "🚀 Starting Miura Deployment..."

# 1. Bump versions and Build sub-packages
for PKG in "${PACKAGES[@]}"; do
  echo "📦 Processing $PKG..."
  cd "$ROOT_DIR/packages/$PKG"
  
  echo "  - Bumping version..."
  npm version patch --no-git-tag-version
  
  echo "  - Building..."
  npm run build
  
  echo "  - Publishing..."
  npm publish
done

# 2. Handle the main 'miura' package
echo "📦 Processing miura (meta-package)..."
cd "$ROOT_DIR/packages/miura"

# Update dependencies in miura/package.json to match new versions
# This is a bit tricky with sed, but since they are all synced to the same version now:
NEW_VER=$(node -p "require('../miura-debugger/package.json').version")
echo "  - Syncing dependencies to ^$NEW_VER..."

# Update the @miurajs/ internal dependencies to the new version
sed -i '' "s/\"@miurajs\/miura-debugger\": \"^[^\"]*\"/\"@miurajs\/miura-debugger\": \"^$NEW_VER\"/" package.json
sed -i '' "s/\"@miurajs\/miura-render\": \"^[^\"]*\"/\"@miurajs\/miura-render\": \"^$NEW_VER\"/" package.json
sed -i '' "s/\"@miurajs\/miura-element\": \"^[^\"]*\"/\"@miurajs\/miura-element\": \"^$NEW_VER\"/" package.json
sed -i '' "s/\"@miurajs\/miura-router\": \"^[^\"]*\"/\"@miurajs\/miura-router\": \"^$NEW_VER\"/" package.json
sed -i '' "s/\"@miurajs\/miura-framework\": \"^[^\"]*\"/\"@miurajs\/miura-framework\": \"^$NEW_VER\"/" package.json
sed -i '' "s/\"@miurajs\/miura-data-flow\": \"^[^\"]*\"/\"@miurajs\/miura-data-flow\": \"^$NEW_VER\"/" package.json

echo "  - Bumping miura version..."
npm version patch --no-git-tag-version

echo "  - Building miura..."
npm run build

echo "  - Publishing miura..."
npm publish

echo "✅ All packages deployed successfully!"
