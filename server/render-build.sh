#!/usr/bin/env bash

# Exit on first error
set -o errexit

# Install deps
npm install --omit=optional

# Build TypeScript
npm run build
