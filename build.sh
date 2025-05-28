#!/bin/bash
set -e

# Go to project root
ROOT_DIR=$(pwd)

echo "📦 Installing frontend dependencies"
cd "$ROOT_DIR/ui"
npm install

echo "🌐 Exporting Expo web build"
npx expo export:web

echo "📦 Installing backend dependencies"
cd "$ROOT_DIR/server"
npm install
