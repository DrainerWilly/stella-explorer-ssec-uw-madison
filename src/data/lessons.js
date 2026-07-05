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
export const LESSONS = [
  {
    id: 'mission-control',
    route: 'mission-control',
    color: 'blue',
    label: 'Satellite missions',
    icon: 'orbit',
    title: 'Explore Earth-Observing Satellites',
    meta: 'Grades 6–12 • Interactive',
    badge: 'Orbit explorer',
    minutes: 20,
    category: 'missions',
    grades: ['middle', 'high'],
  },
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
  },
  {
    id: 'field-investigation',
    color: 'cardmint',
    label: 'Teacher Guide',
    icon: 'book',
    title: 'Build Your Own Field Investigation',
    meta: 'Teacher demo • 30 min',
    badge: 'Teacher',
    minutes: 30,
    category: 'teacher',
    grades: ['middle', 'high'],
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
