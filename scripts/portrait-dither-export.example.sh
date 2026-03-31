#!/usr/bin/env bash
#
# Video → looped Bayer-dither GIF for apps/web/public/portrait-dither.gif
# (footer “James Courson” popover).
#
# Full file by default; trim with -ss / -t to keep size sane. UHD @ full length
# will be slow and may produce a very large GIF — trim or lower -fps / -s first.
#
# Usage:
#   ./scripts/portrait-dither-export.example.sh video.mp4
#   ./scripts/portrait-dither-export.example.sh -ss 5 -t 4 video.mp4
#   ./scripts/portrait-dither-export.example.sh -ss 00:01:30 -t 12 -fps 10 -s 320 -colors 4 video.mp4
#
# Requires: ffmpeg

set -euo pipefail

OUT="apps/web/public/portrait-dither.gif"
SS=""
T=""
FPS=12
SIZE=240
COLORS=2
BAYER=4
IN=""

usage() {
  cat <<EOF
Video → Bayer-dither GIF (default: apps/web/public/portrait-dither.gif).

Usage: $0 [options] INPUT

Options:
  -ss SEEK      Start time (seconds or HH:MM:SS); placed before -i for fast seek
  -t DUR        Clip length in seconds (omit = from -ss to end, or whole file)
  -fps N        Output fps (default: $FPS)
  -s PX         Square size in px (default: $SIZE)
  -colors N     Palette: 2 = harsh 1-bit, 4/8/16 = softer, bigger (default: $COLORS)
  -bayer N      paletteuse bayer_scale (default: $BAYER)
  -o PATH       Output file
  -h            This help

Examples:
  $0 clip.mp4
  $0 -ss 5 -t 4 clip.mp4
  $0 -ss 00:01:00 -t 15 -fps 8 -s 280 -colors 4 big-uhd.mp4
EOF
  exit "${1:-0}"
}

while [ $# -gt 0 ]; do
  case "$1" in
    -ss)
      SS="${2:?}"
      shift 2
      ;;
    -t)
      T="${2:?}"
      shift 2
      ;;
    -fps)
      FPS="${2:?}"
      shift 2
      ;;
    -s)
      SIZE="${2:?}"
      shift 2
      ;;
    -colors)
      COLORS="${2:?}"
      shift 2
      ;;
    -bayer)
      BAYER="${2:?}"
      shift 2
      ;;
    -o)
      OUT="${2:?}"
      shift 2
      ;;
    -h | --help)
      usage 0
      ;;
    -*)
      echo "Unknown option: $1" >&2
      usage 1
      ;;
    *)
      if [ -n "$IN" ]; then
        echo "Extra argument: $1 (input already set to $IN)" >&2
        usage 1
      fi
      IN="$1"
      shift
      ;;
  esac
done

[ -n "$IN" ] || { echo "Missing input file." >&2; usage 1; }
[ -f "$IN" ] || { echo "Not a file: $IN" >&2; exit 1; }

mkdir -p "$(dirname "$OUT")"

if [ -z "$T" ]; then
  DUR="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$IN" 2>/dev/null | head -1)"
  DUR="${DUR:-0}"
  if awk -v d="$DUR" 'BEGIN { exit !(d + 0 > 90) }'; then
    echo "Warning: source duration ~${DUR}s — full encode can be slow and yield a huge GIF." >&2
    echo "         Trim: -ss … -t …  or compress: lower -fps, -s, or use -colors 4." >&2
  fi
fi

# palettegen: 2 colors requires no reserved transparency slot (ffmpeg 7+)
PALETTE_GEN="max_colors=${COLORS}"
if [ "$COLORS" -eq 2 ]; then
  PALETTE_GEN="reserve_transparent=0:${PALETTE_GEN}"
fi

VF="fps=${FPS},scale=${SIZE}:-1:flags=lanczos:force_original_aspect_ratio=decrease,pad=${SIZE}:${SIZE}:(ow-iw)/2:(oh-ih)/2"
VF+=",split[s0][s1];[s0]palettegen=${PALETTE_GEN}[p];[s1][p]paletteuse=dither=bayer:bayer_scale=${BAYER}:new=1"

FF=(ffmpeg -y)
[ -n "$SS" ] && FF+=(-ss "$SS")
FF+=(-i "$IN")
[ -n "$T" ] && FF+=(-t "$T")
FF+=(-an -vf "$VF" -loop 0 "$OUT")

"${FF[@]}"

echo "Wrote $OUT ($(wc -c < "$OUT" | tr -d ' ') bytes) — reload the site and click James Courson."
