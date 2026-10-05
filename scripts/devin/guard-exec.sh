#!/usr/bin/env bash
# Devin CLI PreToolUse hook — hard-blocks exec commands that violate
# AtoEnglish git/production safety rules (AGENTS.md):
#   - no pushing to main
#   - no force-push to any shared remote
#   - no destructive rm -rf of the worktree, $HOME or filesystem roots
#   - no destructive SQL (DROP/TRUNCATE) piped to a database
# Input: JSON event on stdin. Exit 0 = allow, exit 2 = block.

set -euo pipefail
INPUT=$(cat)

if command -v python3 >/dev/null 2>&1; then
  CMD=$(printf '%s' "$INPUT" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("tool_input",{}).get("command",""))' 2>/dev/null || true)
else
  CMD=$INPUT
fi

block() {
  printf '{"decision":"block","reason":"%s"}\n' "$1"
  exit 2
}

case "$CMD" in
  *"push"*" main"*|*"push"*"HEAD:main"*|*"push"*":main "*)
    block "Blocked: pushing to main is forbidden by AGENTS.md (dedicated branches only)." ;;
  *"push --force"*|*"push -f"*|*"push --force-with-lease"*)
    block "Blocked: force-push rewrites shared history; requires explicit owner decision." ;;
  "rm -rf /"|"rm -rf ~"|"rm -rf ."|"rm -rf ~/"*|"rm -rf /"*|*"--no-preserve-root"*)
    block "Blocked: recursive delete of worktree/home/root requires explicit owner confirmation." ;;
  *"drop table"*|*"DROP TABLE"*|*"truncate table"*|*"TRUNCATE TABLE"*)
    block "Blocked: destructive DB operation requires explicit owner confirmation." ;;
esac

exit 0
