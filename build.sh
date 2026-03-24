#!/usr/bin/env bash
# build.sh — Reproducible release build script for IzzyOnDroid/F-Droid
# Usage: bash build.sh
set -euo pipefail

# 1. Install JS dependencies
npm ci

# 2. Build per-ABI release APKs
cd android
chmod +x gradlew
./gradlew assembleRelease --no-daemon

echo ""
echo "APKs ready:"
find app/build/outputs/apk/release -name "*.apk" | while read f; do
  echo "  $f ($(du -sh "$f" | cut -f1))"
done
