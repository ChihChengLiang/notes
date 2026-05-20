#!/bin/bash
files=($(find notes -name "slides.md"))
PS3="Choose a slide to present: "
select f in "${files[@]}"; do
  [ -n "$f" ] && marp --allow-local-files --preview "$f"
  break
done
