#!/usr/bin/env bash
# This bash file will deploy the assets folder to the project gh-page
set -e

# Base directory for this entire project
BASEDIR=$(cd $(dirname $0) && pwd)

# Destination directory for built code
ASSETSDIR="$BASEDIR/assets"

# run the build script
./npm install
./gulp

# Create a new Git repo in assets folder
cd "$ASSETSDIR"
git init

# Set user details
git config user.name "iAyeBot"
git config user.email "iayebot@gmail.com"

# First commit, .. horray!
git add .
git commit -m "Deploy to gh-pages"

# Force push ...
git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1
