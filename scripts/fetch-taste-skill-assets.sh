#!/usr/bin/env sh
# Pulls tasteskill's bundled assets (photos, icons, demo scenes, ~38 MB) into
# .claude/skills/design-taste-frontend/assets. They are gitignored, so run this
# once per checkout if you want the skill's full asset library.
set -eu

root=$(cd "$(dirname "$0")/.." && pwd)
dest="$root/.claude/skills/design-taste-frontend/assets"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

git clone --depth 1 --quiet https://github.com/Leonxlnx/taste-skill "$tmp/taste-skill"
rm -rf "$dest"
cp -R "$tmp/taste-skill/skills/taste-skill/assets" "$dest"
echo "tasteskill assets installed in $dest"
