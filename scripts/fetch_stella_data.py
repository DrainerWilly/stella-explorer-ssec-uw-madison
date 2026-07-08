"""
Normalize NASA's official STELLA sample datasets (already downloaded into the
repo's /data folder) into one compact JSON bundle for the Data Visualizer page.

Source (public domain, U.S. government work; credit NASA STELLA):
  https://science.gsfc.nasa.gov/stella/about/stella-data/

Input:  data/  (extracted sample zips from the page above)
Output: src/data/stellaSamples.json
  {
    generatedAt, source,
    datasets: [{
      id, instrument, title, description, credit, sourceUrl,
      specUnit,            # irradiance unit for spectral triplets (differs by device)
      originalRows,        # rows in the source CSV before downsampling
      envFields: [key...], # canonical env keys present
      records: [{ t, batch, env: {key: num}, spec: [[nm, irr, unc|null], ...] }]
    }]
  }

Run:  py scripts/fetch_stella_data.py
"""

import csv
import io
import json
import re
import sys
from datetime import datetime, timezone

PAGE = "https://science.gsfc.nasa.gov/stella/about/stella-data/"
OUT = "src/data/stellaSamples.json"

# Local CSVs (extracted from the official sample zips) + their source zip URLs.
FILES = {
    "stella-q2": (
        "data/SQ2_sample_data.csv/SQ2_sample_data.csv",
        "https://science.gsfc.nasa.gov/stella/wp-content/uploads/2025/07/SQ2_sample_data.csv.zip",
    ),
    "stella-1-1": (
        "data/STELLA-1_1-SampleData/STELLA-1_1-SampleData/data.csv",
        "https://science.gsfc.nasa.gov/stella/wp-content/uploads/2025/07/STELLA-1_1-SampleData.zip",
    ),
    "stella-aq": (
        "data/STELLA-AQ_SampleData/STELLA-AQ_SampleData/data.csv",
        "https://science.gsfc.nasa.gov/stella/wp-content/uploads/2025/07/STELLA-AQ_SampleData.zip",
    ),
    "helio-stella": (
        "data/Helio-STELLA-2633_data/Helio-STELLA-2633_data.csv",
        "https://science.gsfc.nasa.gov/stella/wp-content/uploads/2025/07/Helio-STELLA-2633_data.zip",
    ),
}

# keep bundles lean; the page lazy-loads this JSON
MAX_RECORDS = 1200


def read_csv_file(path):
    with open(path, "rb") as f:
        raw = f.read()
    # Helio headers contain 0xA0 (non-breaking space) bytes; normalize hard.
    text = raw.decode("utf-8", errors="replace").replace("�", " ").replace("\xa0", " ")
    rows = list(csv.reader(io.StringIO(text)))
    header = [re.sub(r"\s+", " ", h).strip() for h in rows[0]]
    return header, [r for r in rows[1:] if len(r) > 1]


def parse_ts(s):
    s = s.strip()
    m = re.match(r"(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z", s)
    if not m:
        return None
    y, mo, d, h, mi, se = map(int, m.groups())
    return int(datetime(y, mo, d, h, mi, se, tzinfo=timezone.utc).timestamp() * 1000)


def num(v):
    try:
        f = float(str(v).strip())
        if f != f or f in (float("inf"), float("-inf")):
            return None
        return f
    except (ValueError, TypeError):
        return None


def r4(f):
    """Round to ~4 significant digits to keep the JSON small."""
    if f is None:
        return None
    if f == 0:
        return 0
    return float(f"{f:.4g}")


def downsample(records, cap=MAX_RECORDS):
    if len(records) <= cap:
        return records
    step = len(records) / cap
    return [records[int(i * step)] for i in range(cap)]


def col(header, name):
    name = name.lower()
    for i, h in enumerate(header):
        if h.lower() == name:
            return i
    return None


def build_q2(header, rows):
    # spectral columns: irradiance_<nm>nm_<color>_irradiance_uW_per_cm_squared (+ uncertainty)
    spec_cols = []  # (nm, irr_idx, unc_idx)
    for i, h in enumerate(header):
        m = re.match(r"irradiance_(\d+)nm_.*_irradiance_uW_per_cm_squared$", h)
        if m:
            unc = i + 1 if i + 1 < len(header) and "uncertainty" in header[i + 1] else None
            spec_cols.append((int(m.group(1)), i, unc))
    spec_cols.sort()
    ts_i = col(header, "timestamp_iso8601")
    batch_i = col(header, "batch")
    bat_i = col(header, "battery_voltage")
    records = []
    for r in rows:
        t = parse_ts(r[ts_i]) if ts_i is not None else None
        if t is None:
            continue
        env = {}
        bv = num(r[bat_i]) if bat_i is not None else None
        if bv is not None:
            env["battery_v"] = r4(bv)
        spec = [[nm, r4(num(r[ii])), r4(num(r[ui])) if ui else None] for nm, ii, ui in spec_cols]
        records.append({"t": t, "batch": int(num(r[batch_i]) or 0), "env": env, "spec": spec})
    return records, "µW/cm²"


def build_s11(header, rows):
    bands = []  # (nm, irr_idx, unc_idx)
    for i, h in enumerate(header):
        m = re.match(r"(?:[A-Za-z]+)?(\d{3})_irradiance_uW_per_cm_squared$", h)
        if m:
            unc = i + 1 if i + 1 < len(header) and "error" in header[i + 1] else None
            bands.append((int(m.group(1)), i, unc))
    bands.sort()
    env_map = {
        "surface_temp_C": "surface_temperature_C",
        "air_temp_C": "air_temperature_C",
        "rh_pct": "relative_humidity_percent",
        "pressure_hPa": "barometric_pressure_hPa",
        "altitude_m": "altitude_uncalibrated_m",
        "lidar_m": "LiDAR_range_m",
        "battery_v": "battery_voltage",
    }
    idx = {k: col(header, v) for k, v in env_map.items()}
    ts_i = col(header, "timestamp")
    batch_i = col(header, "batch_number")
    records = []
    for r in rows:
        t = parse_ts(r[ts_i]) if ts_i is not None else None
        if t is None:
            continue
        env = {}
        for k, i in idx.items():
            if i is not None:
                v = num(r[i])
                if v is not None:
                    env[k] = r4(v)
        spec = [[nm, r4(num(r[ii])), r4(num(r[ui])) if ui else None] for nm, ii, ui in bands]
        records.append({"t": t, "batch": int(num(r[batch_i]) or 0), "env": env, "spec": spec})
    return records, "µW/cm²"


def build_aq(header, rows):
    env_map = {
        "aqi": "AQIp",
        "co2_ppm": "CO2_ppm",
        "co2_temp_C": "CO2_sensor_air_temperature_C",
        "co2_rh_pct": "CO2_sensor_relative_humidity_%",
        "air_temp_C": "WX_sensor_air_temperature_C",
        "rh_pct": "WX_sensor_relative_humidity_%",
        "pressure_hPa": "WX_sensor_barometric_pressure_hPa",
        "pm1_ugm3": "1um_concentration_ug_m^3",
        "pm25_ugm3": "2_5um_concentration_ug_m^3",
        "pm10_ugm3": "10um_concentration_ug_m^3",
        "cnt03_p100ml": "0_3um_count_p_100mL",
        "cnt05_p100ml": "0_5um_count_p_100mL",
        "cnt25_p100ml": "2_5um_count_p_100mL",
        "battery_v": "battery_voltage",
    }
    idx = {k: col(header, v) for k, v in env_map.items()}
    ts_i = col(header, "timestamp")
    batch_i = col(header, "batch")
    records = []
    for r in rows:
        t = parse_ts(r[ts_i]) if ts_i is not None else None
        if t is None:
            continue
        env = {}
        for k, i in idx.items():
            if i is not None:
                v = num(r[i])
                if v is not None:
                    env[k] = r4(v)
        records.append({"t": t, "batch": int(num(r[batch_i]) or 0), "env": env, "spec": []})
    return records, None


def build_helio(header, rows):
    colors = ["violet", "indigo", "blue", "cyan", "green", "yellow", "orange", "red"]
    bands = []
    for c in colors:
        nm_i = col(header, f"{c}_center_nm")
        irr_i = None
        for i, h in enumerate(header):
            if re.match(rf"{c}_+irradiance_W/\(m\^2\*nm\)$", h):
                irr_i = i
        if nm_i is not None and irr_i is not None:
            bands.append((c, nm_i, irr_i))
    env_map = {
        "lux": "lux",
        "uva": "uva",
        "air_temp_C": "air_temperature_C",
        "rh_pct": "relative_humidity_percent",
        "pressure_hPa": "barometric_pressure_hPa",
        "battery_v": "battery_voltage",
    }
    idx = {k: col(header, v) for k, v in env_map.items()}
    ts_i = col(header, "timestamp_iso8601")
    batch_i = col(header, "batch")
    records = []
    for r in rows:
        t = parse_ts(r[ts_i]) if ts_i is not None else None
        if t is None:
            continue
        env = {}
        for k, i in idx.items():
            if i is not None:
                v = num(r[i])
                if v is None:
                    continue
                if k == "lux" and v >= 99999:  # sensor saturation sentinel
                    continue
                env[k] = r4(v)
        spec = []
        for _c, nm_i, irr_i in bands:
            nm = num(r[nm_i])
            irr = num(r[irr_i])
            if nm is not None:
                spec.append([int(nm), r4(irr), None])
        spec.sort(key=lambda b: b[0])
        records.append({"t": t, "batch": int(num(r[batch_i]) or 0), "env": env, "spec": spec})
    return records, "W/(m²·nm)"


DATASETS = [
    {
        "id": "stella-1-1",
        "build": build_s11,
        "instrument": "STELLA-1.1",
        "title": "Field session — spectra + environment",
        "description":
            "A real outdoor measuring session: 12 spectral bands (450–860 nm) with uncertainties, "
            "plus surface temperature, air temperature, humidity, pressure, and LiDAR range.",
    },
    {
        "id": "helio-stella",
        "build": build_helio,
        "instrument": "Helio-STELLA",
        "title": "A day of sunlight",
        "description":
            "Solar monitoring across a full day: eight visible bands (415–680 nm), UVA and lux, "
            "with air temperature, humidity, and pressure — watch the Sun rise and set in data.",
    },
    {
        "id": "stella-aq",
        "build": build_aq,
        "instrument": "STELLA-AQ",
        "title": "Air-quality session",
        "description":
            "Air-quality sampling: CO₂ concentration, particulate matter (PM1 / PM2.5 / PM10), "
            "particle counts, and weather-sensor context.",
    },
    {
        "id": "stella-q2",
        "build": build_q2,
        "instrument": "STELLA-Q2",
        "title": "18-band spectral snapshots",
        "description":
            "Short spectral captures across 18 bands from 410 nm (violet) to 940 nm (near-infrared), "
            "each with measurement uncertainty.",
    },
]


def main():
    out = {
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": PAGE,
        "credit": "Data: NASA STELLA (Goddard Space Flight Center) — public domain, credit NASA.",
        "datasets": [],
    }
    for spec in DATASETS:
        path, url = FILES[spec["id"]]
        print(f"reading {path} ...", file=sys.stderr)
        header, rows = read_csv_file(path)
        records, spec_unit = spec["build"](header, rows)
        original = len(records)
        records = downsample(records)
        env_fields = sorted({k for rec in records for k in rec["env"]})
        out["datasets"].append(
            {
                "id": spec["id"],
                "instrument": spec["instrument"],
                "title": spec["title"],
                "description": spec["description"],
                "credit": "Data: NASA STELLA (public domain).",
                "sourceUrl": url,
                "specUnit": spec_unit,
                "originalRows": original,
                "envFields": env_fields,
                "records": records,
            }
        )
        print(
            f"  {spec['id']}: {original} rows -> {len(records)} bundled, "
            f"{len(env_fields)} env fields, spec bands: {len(records[0]['spec']) if records else 0}",
            file=sys.stderr,
        )

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, separators=(",", ":"))
    import os

    print(f"WROTE {OUT} ({os.path.getsize(OUT) / 1024:.0f} KB)", file=sys.stderr)


if __name__ == "__main__":
    main()
