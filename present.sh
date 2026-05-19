#!/bin/bash
files=($(find notes -name "slides.md"))
PS3="Choose a slide to present: "
select f in "${files[@]}"; do
  if [ -n "$f" ]; then
    out="dist/${f%.md}.html"
    mkdir -p "$(dirname "$out")"
    marp --html --allow-local-files --output "$out" --preview "$f"
  fi
  break
done
