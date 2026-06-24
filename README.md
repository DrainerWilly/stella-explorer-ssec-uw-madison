# Explore Earth with STELLA

An interactive, K–12 **remote sensing** education dashboard. Students and teachers
compare **STELLA** field-spectrometer measurements with **Landsat 8 & 9** satellite
data to learn how scientists observe Earth from space.

Built as a single-page **React + Vite + Tailwind CSS** app with a pastel,
education-product UI: a floating "app window" on a mint backdrop, a left icon
sidebar, lesson cards in the center, and a student/teacher dashboard on the right.

> Software & Website Developments from SSEC Intern, Mertkan.

## Features

- **Category filters** — filter lessons by topic (Spectrum, STELLA, Landsat, Vegetation, Urban Heat, Water Quality, Teacher Guide).
- **Grade-level selector** — Elementary / Middle / High; filters lessons and syncs the dashboard panel.
- **Visible vs Infrared toggle** — the "Field Data vs Satellite Data" activity plots real reflectance curves for a leaf vs. pavement and switches between *what your eyes see* (400–700 nm) and *what satellites see* (adds near-infrared / SWIR), with a live **NDVI** readout.
- **Responsive** — three-column desktop layout collapses to a stacked layout with a bottom nav bar on smaller screens.

## Data

Charts use **published reference data**, not a single field sample:

- `src/data/landsat.js` — Landsat 8/9 OLI/TIRS band center wavelengths and ranges (USGS spec).
- `src/data/spectra.js` — representative spectral reflectance signatures (vegetation, soil, water, pavement) in the shapes published by USGS/ECOSTRESS-style spectral libraries, plus STELLA-Q2 (AS7341) channel wavelengths and an `ndvi()` helper.
- `src/data/lessons.js` / `src/data/dashboard.js` — lesson catalogue, categories, grade tags, and dashboard content.

The data layer is isolated so real STELLA CSV exports can be dropped in later.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # production build to dist/
npm run preview  # preview the production build locally
```

Requires Node 18+ (developed on Node 20/24).

## Project structure

```
src/
  App.jsx                 # holds filter/grade state, composes the layout
  components/             # AppShell, BrowserHeader, SidebarNav, HeroSection,
                          # CategoryFilters, LessonCard(Grid), FeaturedActivityCard,
                          # SpectralCompare, RightDashboard, ProgressCard, MiniBarChart,
                          # CurrentLessons, SmallCourseCard, Icon
  data/                   # landsat, spectra, lessons, dashboard
```

## Deploy to GitHub Pages

A workflow is included at `.github/workflows/deploy.yml`. To go live:

1. Push to `main`.
2. In **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.

The workflow then builds and publishes `dist/` on every push to `main` (or run it
manually from the **Actions** tab). `vite.config.js` uses `base: './'`, so assets
resolve correctly under any Pages subpath.
