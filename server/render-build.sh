#!/usr/bin/env bash

# Exit on first error
set -o errexit

# Install deps
npm install

# Build TypeScript
npm run build
