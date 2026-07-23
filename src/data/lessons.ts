// @ts-nocheck
// Lesson catalogue + category and grade taxonomies that drive the filters.

// Grade levels for the selector. `tags` lists the grade-band labels a lesson
// can carry so a lesson can belong to more than one band.
export const GRADES = [
  { id: 'all', label: 'All grades', short: 'All' },
  { id: 'elementary', label: 'Elementary', short: 'Elem', bands: ['K-5'] },
  { id: 'middle', label: 'Middle school', short: 'Middle', bands: ['Grade 6-8'] },
  { id: 'high', label: 'High school', short: 'High', bands: ['Grade 9-12'] },
]

export const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'grid' },
  { id: 'missions', label: 'Satellite Missions', icon: 'orbit' },
  { id: 'spectrum', label: 'Electromagnetic Spectrum', icon: 'spectrum' },
  { id: 'stella', label: 'STELLA Data', icon: 'device' },
  { id: 'landsat', label: 'Landsat', icon: 'satellite' },
  { id: 'vegetation', label: 'Vegetation', icon: 'leaf' },
  { id: 'urban', label: 'Urban Heat', icon: 'heat' },
  { id: 'water', label: 'Water Quality', icon: 'water' },
  { id: 'teacher', label: 'Teacher Guide', icon: 'book' },
]

// color keys map to Tailwind theme colors (pink, yellow, lavender, cardmint, blue, coral)
// Every `image` is public-domain imagery from official sources (NASA / USGS);
// `credit` records the source for the on-card attribution.
export const LESSONS = [
  {
    id: 'how-landsat-images',
    route: 'lesson-landsat',
    color: 'lavender',
    label: 'Landsat',
    icon: 'satellite',
    title: 'How Landsat Images Are Made',
    meta: 'Grades 6–12 • 25 min',
    badge: 'Interactive lesson',
    minutes: 25,
    category: 'landsat',
    grades: ['middle', 'high'],
    image: 'landsat/natural-color.jpg',
    credit: 'USGS/NASA Landsat',
  },
  {
    id: 'spectrum-intro',
    route: 'lesson-ems',
    color: 'pink',
    label: 'Spectrum',
    icon: 'spectrum',
    title: 'What Is the Electromagnetic Spectrum?',
    meta: 'Deep-dive • 35–45 min',
    badge: 'Grades 6-12',
    minutes: 40,
    category: 'spectrum',
    grades: ['middle', 'high'],
    image: 'assets/nasa/ems-diagram-09172025.jpg',
    credit: 'NASA',
  },
  {
    id: 'measure-leaf',
    color: 'yellow',
    label: 'STELLA',
    icon: 'device',
    title: 'Measure a Leaf with STELLA',
    meta: 'Field activity • 20 min',
    badge: 'Hands-on',
    minutes: 20,
    category: 'stella',
    grades: ['elementary', 'middle'],
    image: 'assets/home/nasa-stella-field-lesson.jpg',
    credit: 'NASA STELLA',
  },
  {
    id: 'satellites-see',
    color: 'lavender',
    label: 'Landsat',
    icon: 'satellite',
    title: 'How Satellites See Earth',
    meta: 'Visual lesson • 15 min',
    badge: 'Grade 9-12',
    minutes: 15,
    category: 'landsat',
    grades: ['high', 'middle'],
    image: 'assets/media/landsat-in-orbit.jpg',
    credit: 'NASA/USGS',
  },
  {
    id: 'compare-surfaces',
    color: 'cardmint',
    label: 'Data',
    icon: 'data',
    title: 'Compare Grass, Soil, and Pavement',
    meta: 'Graph activity • 25 min',
    badge: 'Interactive',
    minutes: 25,
    category: 'vegetation',
    grades: ['middle', 'high'],
    image: 'assets/home/nasa-crop-circles.jpg',
    credit: 'NASA Earth Observatory',
  },
  {
    id: 'visible-infrared',
    color: 'blue',
    label: 'Spectrum',
    icon: 'spectrum',
    title: 'Visible vs Infrared Light',
    meta: 'Visual lesson • 12 min',
    badge: 'Grade 6-8',
    minutes: 12,
    category: 'spectrum',
    grades: ['middle'],
    image: 'landsat/false-color.jpg',
    credit: 'USGS/NASA Landsat',
  },
  {
    id: 'urban-heat',
    color: 'coral',
    label: 'Urban Heat',
    icon: 'heat',
    title: 'Urban Heat Island Explorer',
    meta: 'Map activity • 20 min',
    badge: 'Grade 9-12',
    minutes: 20,
    category: 'urban',
    grades: ['high'],
    image: 'assets/videos/posters/urban-heat-islands.jpg',
    credit: 'NASA',
  },
  {
    id: 'water-from-space',
    color: 'blue',
    label: 'Water Quality',
    icon: 'water',
    title: 'Water Quality from Space',
    meta: 'Case study • 18 min',
    badge: 'Interactive',
    minutes: 18,
    category: 'water',
    grades: ['middle', 'high'],
    image: 'assets/lessons/water-quality-bloom.jpg',
    credit: 'NASA Goddard Space Flight Center',
  },
]

// Returns the lessons matching the active category and grade.
export function filterLessons(lessons, categoryId, gradeId) {
  return lessons.filter((l) => {
    const catOk = categoryId === 'all' || l.category === categoryId
    const gradeOk = gradeId === 'all' || l.grades.includes(gradeId)
    return catOk && gradeOk
  })
}
