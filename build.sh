#!/bin/bash
set -e

echo "📦 Installing frontend dependencies"
cd UI
npm install

echo "🌐 Exporting Expo web build"
npx expo export:web

echo "📦 Installing backend dependencies"
cd ../server
npm install
