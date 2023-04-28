#!/usr/bin/env bash
# This script copies the extra manual .d.ts files from the root of the project
# to the dist/ directory. This is necessary because some of the .d.ts files are
# not copied by the `vite-plugin-dts` plugin
# (https://github.com/qmhc/vite-plugin-dts/issues/184)
# All of this may be removed if/when the issue is fixed.

set -e # Exit with nonzero exit code if anything fails

# Make sure working directory is the root of the repository
cd "$(dirname "$0")/.."

# Copy the extra .d.ts files to the dist/ directory
cp -r ./src/types ./dist/src/
cp ./src/internalTypes.d.mts ./dist/src/
cp ./src/commonTypes.d.mts ./dist/src/
