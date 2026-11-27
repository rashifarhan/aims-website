#!/bin/bash
# Installs the MotionSites Claude skill ("motionsites-web-builder") into this repository's .claude/skills, where
# Claude Code picks it up. Directions 2 and 3 were designed from it (its "Laptop Portfolio" and "Smoothie Slider"
# designs). It stays out of git: its licence lets you build sites with it but not redistribute its examples.
# Run from the repository root: bash docs/handoff/install-motionsites.sh
set -e
tmp=$(mktemp -d)
git clone -q --depth 1 https://github.com/Motionsites-AI/claude-skill "$tmp/ms"
mkdir -p .claude/skills
rm -rf .claude/skills/motionsites-web-builder
cp -r "$tmp/ms/plugins/motionsites-web-builder/skills/motionsites-web-builder" .claude/skills/
cp "$tmp/ms/LICENSE" .claude/skills/motionsites-web-builder/LICENSE
grep -qxF ".claude/skills/motionsites-web-builder/" .git/info/exclude || echo ".claude/skills/motionsites-web-builder/" >> .git/info/exclude
rm -rf "$tmp"
echo "Installed .claude/skills/motionsites-web-builder. Start a new message (or session) so Claude Code loads it."
