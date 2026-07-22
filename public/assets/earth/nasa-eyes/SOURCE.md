# NASA Eyes Earth cube faces

These day-side textures are reproducible composites of NASA Eyes on the
Earth's matched surface-color and RGBA-cloud cube faces:

- `https://eyes.nasa.gov/assets/static/maps/earth/color_2048_0.png` through
  `color_2048_5.png`
- `https://eyes.nasa.gov/assets/static/maps/earth/cloud_2048_0.png` through
  `cloud_2048_5.png`

Projection: native cube faces. No equirectangular or polar-stereographic image
is sampled. No latitude mask, polar cutoff, fill color, or blend ring is used.
The cloud image is alpha-composited over the matching color image across every
face, then encoded as WebP. The 512-pixel tier is downsampled from the corrected
2048-pixel composite so initial loading cannot flash the former broken pole.
The resulting runtime faces are opaque sRGB images: transparent cloud pixels
reveal their matched color face, and no invalid or ocean-fallback pixels are
introduced by this build.

Face convention used by NASA Eyes and `EarthGlobe.tsx`:

| Face | Direction | Region |
| --- | --- | --- |
| 0 | +Z | Greenwich / Africa |
| 1 | +X | Asia |
| 2 | -Z | Pacific |
| 3 | -X | Americas |
| 4 | +Y | North Pole |
| 5 | -Y | South Pole |

In the runtime mapping, the center of face 4 is the normalized direction
`[0, 1, 0]` (latitude +90 degrees). Its four edges meet faces 0, 1, 2, and 3;
the source pairs already use those same edge orientations.

Run `bash scripts/build-nasa-eyes-earth-textures.sh` from the project root to
rebuild both tiers. The script verifies the downloaded source hashes before
writing any output.

Credit: Earth surface and cloud textures courtesy NASA/JPL-Caltech, via NASA
Eyes on the Earth.
