#!/usr/bin/env bash
set -euo pipefail

read -rp "Subject (used as directory name, e.g. 'zk_proofs'): " topic

if [[ -z "$topic" ]]; then
  echo "Subject cannot be empty." >&2
  exit 1
fi

date=$(date +%Y-%m-%d)
dir="notes/${date}_${topic}"

if [[ -d "$dir" ]]; then
  echo "Directory '$dir' already exists." >&2
  exit 1
fi

mkdir -p "$dir"

cat > "$dir/main.md" <<EOF
---
date: $date
---

# $topic
EOF

echo "Created $dir/main.md"
