#!/bin/bash
set -e

echo "🔨 Building application..."
npm run build

echo "📦 Checking dist size..."
du -sh dist

echo "🐳 Building Docker image..."
docker build -t telegram-app-shad:latest .

echo "✅ Build complete! Image size:"
docker images telegram-app-shad:latest --format "{{.Size}}"

echo ""
echo "🚀 Ready to deploy! Push to your registry:"
echo "   docker tag telegram-app-shad:latest YOUR_REGISTRY/telegram-app-shad:latest"
echo "   docker push YOUR_REGISTRY/telegram-app-shad:latest"

