#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
APP_DIR="$ROOT/artifacts/signal-soundboard"
ANDROID_DIR="$APP_DIR/android"
SDK_ROOT="${ANDROID_SDK_ROOT:-$ROOT/.android-sdk}"

export ANDROID_HOME="$SDK_ROOT"
export ANDROID_SDK_ROOT="$SDK_ROOT"
export GRADLE_USER_HOME="$ROOT/.android-sdk/gradle-cache"
export PORT="${PORT:-4173}"
export BASE_PATH="/"
export NODE_ENV="production"

cd "$ROOT"
pnpm --filter @workspace/signal-soundboard exec vite build \
  --config vite.config.ts \
  --base ./ \
  --outDir dist/android-web

mkdir -p "$ANDROID_DIR/app/src/main/assets/site"
rm -rf "$ANDROID_DIR/app/src/main/assets/site/"*
cp -a "$APP_DIR/dist/android-web/." "$ANDROID_DIR/app/src/main/assets/site/"

gradle --no-daemon --project-dir "$ANDROID_DIR" :app:exportDebugApk
