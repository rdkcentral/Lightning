#!/usr/bin/env bash
# This script copies the extra manual .d.ts files from the root of the project
# to the dist/ directory. This is necessary because some of the .d.ts files are
# not copied by the `vite-plugin-dts` plugin
# (https://github.com/qmhc/vite-plugin-dts/issues/184)
# All of this may be removed if/when the issue is fixed.

set -e # Exit with nonzero exit code if anything fails

# Make sure working directory is the root of the repository
cd "$(dirname "$0")/.."

# Copy the extra .d.ts files to the core/dist/ directory
cp -r ./packages/core/src/types ./packages/core/dist/src/
cp ./packages/core/src/internalTypes.d.mts ./packages/core/dist/src/
cp ./packages/core/src/commonTypes.d.mts ./packages/core/dist/src/

# Copy core src to the core-es/dist/ directories
mkdir -p ./packages/core-es/dist/core
cp -r ./packages/core/src ./packages/core-es/dist/core/src

# Consolidate core-es types into the core-es/types/ directories
mkdir -p ./packages/core-es/types
rm -rf ./packages/core-es/types/*
mkdir -p ./packages/core-es/types/core/src
mkdir -p ./packages/core-es/types/core-es/src
cp ./packages/core-es/dist/core-es/src/index.d.* ./packages/core-es/types/core-es/src
cp -r ./packages/core/dist/src ./packages/core-es/types/core
rm ./packages/core-es/types/core/src/lightning*
rm -rf ./packages/core-es/types/core/src/types
