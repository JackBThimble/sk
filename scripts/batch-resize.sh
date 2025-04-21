#!/bin/bash

MAX_SIZE=$((100 * 1024))

find ./src/games -type f -path '*/assets/img/*-thumbnail.png' | while read -r img; do
  original_size=$(stat --format=%s "$img")

  if ((original_size <= MAX_SIZE)); then
    echo "✅ $img is already under 100 KB (${original_size} bytes)"
    continue
  fi

  echo "🔍 $img is $((original_size / 1024)) KB — trying lossless compression..."

  # Try lossless compression first
  optipng -o7 "$img" >/dev/null 2>&1
  size_after_optipng=$(stat --format=%s "$img")

  if ((size_after_optipng <= MAX_SIZE)); then
    echo "✅ Lossless compression succeeded ($((size_after_optipng / 1024)) KB)"
    continue
  fi

  echo "❗ Still too big after lossless ($((size_after_optipng / 1024)) KB) -- trying lossy..."

  # Try lossy compression iteratively with decreasing quality
  for quality in 80 70 60 50 40; do
    pngquant --quality=$quality-$quality --ext .png --force "$img" >/dev/null 2>&1
    new_size=$(stat --format=%s "$img")

    if ((new_size <= MAX_SIZE)); then
      echo "✅ Lossy compression succeeded at quality $quality ($((new_size / 1024)) KB)"
      break
    else
      echo "⚠️ Still too big at quality $quality ($((new_size / 1024)) KB)"
    fi
  done

  final_size=$(stat --format=%s "$img")
  if ((final_size > MAX_SIZE)); then
    echo "❌ Could not shrink $img below 100 KB (final: $((final_size / 1024)) KB)"
  fi
done
