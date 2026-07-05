// Science categories used to group and color Earth-observing missions in
// Mission Control. Category ids are the human-readable names on purpose so the
// catalog data reads clearly. Colors are restrained (not neon) and each pairs
// with a text label so meaning never relies on color alone.

export const MISSION_CATEGORIES = [
  {
    id: 'Land',
    label: 'Land',
    icon: 'leaf',
    color: '#5FAE6E',
    description:
      'Missions that map land cover, vegetation, soil, and the surface of the continents.',
  },
  {
    id: 'Atmosphere',
    label: 'Atmosphere',
    icon: 'rays',
    color: '#6FA8DC',
    description:
      'Missions that study the composition of the air — ozone, aerosols, and atmospheric chemistry.',
  },
  {
    id: 'Water and Oceans',
    label: 'Water & Oceans',
    icon: 'water',
    color: '#3F73C4',
    description:
      'Missions that observe the ocean surface, sea level, lakes, and rivers.',
  },
  {
    id: 'Weather and Precipitation',
    label: 'Weather & Precipitation',
    icon: 'cloud',
    color: '#9B86DE',
    description:
      'Missions that support weather forecasting and measure rain and snow.',
  },
  {
    id: 'Ice and Elevation',
    label: 'Ice & Elevation',
    icon: 'snow',
    color: '#4FC2CE',
    description:
      'Missions that measure the height of ice sheets, sea ice, and the land surface.',
  },
  {
    id: 'Climate and Radiation',
    label: 'Climate & Radiation',
    icon: 'heat',
    color: '#E0954E',
    description:
      "Missions that track the energy entering and leaving Earth's climate system.",
  },
  {
    id: 'Platforms',
    label: 'Platforms',
    icon: 'orbit',
    color: '#8B93A7',
    description:
      'Crewed or host platforms that carry multiple Earth-observing instruments (e.g. the ISS).',
  },
]

export const CATEGORY_BY_ID = Object.fromEntries(
  MISSION_CATEGORIES.map((c) => [c.id, c]),
)

// Marker/accent color for a category, with a neutral fallback for safety.
export function categoryColor(categoryId) {
  return CATEGORY_BY_ID[categoryId]?.color ?? '#8A8F98'
}

export function categoryIcon(categoryId) {
  return CATEGORY_BY_ID[categoryId]?.icon ?? 'satellite'
}
