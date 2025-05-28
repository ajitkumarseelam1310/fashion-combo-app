#!/bin/bash
# Root-level build script

echo "▶️ Building frontend"
cd ui
npm install
npx expo export:web

echo "✅ Frontend build complete"

echo "▶️ Building backend"
cd ../server
npm install
