#!/usr/bin/env bash

# Exit on first error
set -o errexit

echo ">>> Running render-build.sh"

# Install deps
npm install --include=dev

# Build TypeScript
npm run build
