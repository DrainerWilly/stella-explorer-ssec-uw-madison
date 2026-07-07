"""
Fetch a real Landsat 8/9 Collection 2 Level-2 scene (USGS/NASA public data,
served via Microsoft Planetary Computer's public STAC + Azure blob storage)
and render individual-band grayscale crops for the "How Landsat Images Are
Made" lesson's band-measurement panel.

This pulls ACTUAL per-band reflectance/thermal data for one real scene, not a
synthetic illustration or a channel split of an RGB composite.
"""
import json
import sys

import numpy as np
import planetary_computer
import rasterio
from PIL import Image
from pyproj import Transformer
from pystac_client import Client
from rasterio.windows import Window

STAC_URL = "https://planetarycomputer.microsoft.com/api/stac/v1"
OUT_DIR = "public/landsat/bands"
ITEM_ID = "LC08_L2SP_016042_20240222_02_T1"

# Confirmed by inspecting the scene's true-color preview: the coast/harbor +
# barrier islands + city grid + agriculture, southwest Florida Gulf coast.
CENTER_LON, CENTER_LAT = -81.87, 26.53

# Band -> (Collection-2 L2 asset key, is_thermal)
BANDS = {
    2: ("blue", False),
    3: ("green", False),
    4: ("red", False),
    5: ("nir08", False),
    6: ("swir16", False),
    7: ("swir22", False),
    10: ("lwir11", True),
}

CROP_SIZE = 1100  # pixels, square crop (30 m/px -> ~33 km across)
FINAL_SIZE = 720  # downsized for web delivery


def get_item():
    catalog = Client.open(STAC_URL)
    return catalog.get_collection("landsat-c2-l2").get_item(ITEM_ID)


def stretch_to_u8(arr):
    valid = arr[arr > 0]
    if valid.size == 0:
        return np.zeros(arr.shape, dtype=np.uint8)
    lo, hi = np.percentile(valid, [2, 98])
    if hi <= lo:
        hi = lo + 1
    out = np.clip((arr.astype(np.float32) - lo) / (hi - lo), 0, 1)
    out = (out * 255).astype(np.uint8)
    out[arr <= 0] = 0
    return out


def main():
    import os

    os.makedirs(OUT_DIR, exist_ok=True)
    item = get_item()
    meta = {
        "sceneId": item.id,
        "datetime": item.properties.get("datetime"),
        "platform": item.properties.get("platform"),
        "cloudCover": item.properties.get("eo:cloud_cover"),
        "collection": "landsat-c2-l2 (USGS Landsat Collection 2 Level-2)",
        "cropCenterLonLat": [CENTER_LON, CENTER_LAT],
    }
    print("SCENE:", json.dumps(meta), file=sys.stderr)

    signed = planetary_computer.sign(item)
    half = CROP_SIZE // 2

    for band, (asset_key, _is_thermal) in BANDS.items():
        href = signed.assets[asset_key].href
        with rasterio.open(href) as src:
            transformer = Transformer.from_crs("EPSG:4326", src.crs, always_xy=True)
            px, py = transformer.transform(CENTER_LON, CENTER_LAT)
            col, row = ~src.transform * (px, py)
            col, row = int(col), int(row)
            win = Window(max(0, col - half), max(0, row - half), CROP_SIZE, CROP_SIZE)
            arr = src.read(1, window=win)
        u8 = stretch_to_u8(arr)
        img = Image.fromarray(u8).resize((FINAL_SIZE, FINAL_SIZE), Image.LANCZOS)
        out_path = f"{OUT_DIR}/band-{band}.jpg"
        img.save(out_path, "JPEG", quality=87)
        print(f"WROTE {out_path} {img.size}", file=sys.stderr)

    # Provenance record kept alongside the script (not shipped to /public).
    with open("scripts/landsat-band-scene-meta.json", "w") as f:
        json.dump(meta, f, indent=2)
    print("DONE", file=sys.stderr)


if __name__ == "__main__":
    main()
