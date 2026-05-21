#!/bin/bash
files=($(find notes -name "slides.md"))
PS3="Choose a slide to present: "
select f in "${files[@]}"; do
  if [ -n "$f" ]; then
    topic_dir=$(dirname "$f")
    tmpdir=$(mktemp -d)
    trap "rm -rf '$tmpdir'" EXIT

    cp "$f" "$tmpdir/"

    find "$topic_dir" -type f \( \
      -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \
      -o -name "*.gif" -o -name "*.svg" -o -name "*.webp" -o -name "*.avif" \
    \) | while IFS= read -r img; do
      rel="${img#$topic_dir/}"
      dest="$tmpdir/$rel"
      mkdir -p "$(dirname "$dest")"
      cp "$img" "$dest"
    done

    marp --allow-local-files --config .marprc.yml --preview "$tmpdir/slides.md"
  fi
  break
done
