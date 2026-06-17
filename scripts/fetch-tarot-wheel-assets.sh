#!/usr/bin/env bash
#
# Stage the Tarot Wheel assets into /public/tarot-wheel/.
#
# These files are Chris's work, used with his permission. The script pulls
# them from the live "Tarot Today" wheel. Best of all: ask Chris for the
# originals and drop them into the same folders — higher quality, and no
# scraping. This script is just the quick path if that is not handy.
#
# Run from the repo root:   bash scripts/fetch-tarot-wheel-assets.sh
#
set -euo pipefail

SRC="https://tarot.mystack.co"
DEST="public/tarot-wheel"
SOUNDS="$DEST/sounds"

mkdir -p "$DEST" "$SOUNDS"

echo "Fetching 21 card images…"
for i in $(seq 1 21); do
  curl -fsSL "$SRC/cards/card_${i}.png" -o "$DEST/card_${i}.png"
  echo "  card_${i}.png"
done

echo "Fetching the spin music…"
curl -fsSL "$SRC/sounds/background-full.mp3" -o "$SOUNDS/background-full.mp3"

# Optional extras (the wheel is rebuilt in-app, so these are not required):
echo "Fetching optional extras…"
curl -fsSL "$SRC/sounds/click.wav"        -o "$SOUNDS/click.wav"        || true
curl -fsSL "$SRC/sounds/after_click.wav"  -o "$SOUNDS/after_click.wav"  || true
curl -fsSL "$SRC/wheel_full.png"          -o "$DEST/wheel_full.png"     || true
curl -fsSL "$SRC/spin-button.png"         -o "$DEST/spin-button.png"    || true

echo "Done. Assets are in $DEST/"
