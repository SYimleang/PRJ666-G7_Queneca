#!/usr/bin/env bash

# Exit on first error
set -o errexit

# Install deps
npm ci

# Build TypeScript
npm run build
