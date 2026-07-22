#!/usr/bin/env bash
set -euo pipefail

# Rebuild the day-side cube faces used by EarthGlobe. NASA Eyes publishes the
# surface and cloud products in the same native cube projection, so this is a
# straight alpha composite: no latitude clipping, fallback color, polar
# stretching, or equirectangular reprojection is involved.

for dependency in curl magick sha256sum; do
  command -v "$dependency" >/dev/null || {
    echo "Missing required command: $dependency" >&2
    exit 1
  }
done

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_dir="$(cd "$script_dir/.." && pwd)"
output_dir="$project_dir/public/assets/earth/nasa-eyes"
source_root="https://eyes.nasa.gov/assets/static/maps/earth"
work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT

mkdir -p "$output_dir"

for face in 0 1 2 3 4 5; do
  curl -fL --retry 3 --output "$work_dir/color_2048_${face}.png" \
    "$source_root/color_2048_${face}.png"
  curl -fL --retry 3 --output "$work_dir/cloud_2048_${face}.png" \
    "$source_root/cloud_2048_${face}.png"
done

cat >"$work_dir/SHA256SUMS" <<'EOF'
aa9de9d85518fec0e3729b9a6c234692b5fd036e9caca17b0c1db8413a6853b2  color_2048_0.png
81f2a26c89ae2ead71fe2b554698798fd02e169e37941b321592235f788c16e4  color_2048_1.png
6b1fee89b6e3f6f7663fde03c103a579485010b1a1ce65f23900c0050eee3701  color_2048_2.png
0e44a61d3269b6d397a4c0ff249ee811901709fd9dc26971699d13da07034786  color_2048_3.png
d40d556030eea901226d5aecb65e0a19b9d8d5bab2ea0c53faf69da11ed9ede3  color_2048_4.png
9f6ca8c2d49e0760d4885695ff5e6228e5af17d50b6737f511fca0767dff0ee8  color_2048_5.png
dec5cd7c07d01a558ceca1e2889d6a4442c9e64ee405f34bd087cd0e66406a59  cloud_2048_0.png
54ea465596f3082c57fbfe08e90cad8d1934779a65b9793f51377ef04b316591  cloud_2048_1.png
27c4b147a9d6a93c4edd26cfaca9583a9346d600aa848eb7ae563f54aa42dd73  cloud_2048_2.png
06a5d93a2956f46df464eebb3a6a7fcde711850c32a0cbc113df0827ec6a4d26  cloud_2048_3.png
a99656706a6ce1675a829a1a09d47b2153bb78fcaf32a3ab90fca5030509901a  cloud_2048_4.png
adb0feda23d18d35b3b4698853f3e6a80f971968c9ac33c231f9e21b64ee9187  cloud_2048_5.png
EOF

(cd "$work_dir" && sha256sum --check SHA256SUMS)

for face in 0 1 2 3 4 5; do
  magick \
    "$work_dir/color_2048_${face}.png" \
    "$work_dir/cloud_2048_${face}.png" \
    -compose over -composite -strip -quality 92 -define webp:method=6 \
    "$output_dir/day_2048_${face}.webp"

  magick "$output_dir/day_2048_${face}.webp" \
    -filter Lanczos -resize 512x512 -strip -quality 90 -define webp:method=6 \
    "$output_dir/day_512_${face}.webp"
done

echo "Wrote NASA Eyes day faces to $output_dir"
