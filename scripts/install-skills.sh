#!/usr/bin/env bash
# Make the docs-ds skills available from other repositories by symlinking them
# into the user's skill directories. Safe to rerun.
#
#   scripts/install-skills.sh            → ~/.claude/skills
#   scripts/install-skills.sh --cortex   → also ~/.snowflake/cortex/skills
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
targets=("$HOME/.claude/skills")
[[ "${1:-}" == "--cortex" ]] && targets+=("$HOME/.snowflake/cortex/skills")

for target in "${targets[@]}"; do
  mkdir -p "$target"
  for skill in "$here"/.claude/skills/*/; do
    name="$(basename "$skill")"
    ln -sfn "$skill" "$target/$name"
    echo "linked $target/$name"
  done
done

echo
echo "Set DS_DOCS_PATH=$here in your shell so the skills find this checkout from other repositories."
