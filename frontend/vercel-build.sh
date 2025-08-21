#!/bin/bash
set -e

echo "Installing pnpm globally..."
npm install -g pnpm@10

echo "Installing dependencies..."
pnpm install --frozen-lockfile

echo "Building project..."
pnpm run build

echo "Build completed successfully!"
