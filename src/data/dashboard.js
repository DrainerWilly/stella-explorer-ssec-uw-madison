// Content for the right-hand student/teacher dashboard panel.

export const PROFILE = {
  name: 'STELLA Classroom',
  subtitle: 'Teacher Mode',
  friends: { count: 0, label: 'Students' },
}

export const PROGRESS = {
  title: "Today's activity",
  value: '3.5h',
  badge: 'Great progress',
  // mini bar chart: value is a 0..1 fraction of the tallest bar
  bars: [
    { label: 'Spectrum', value: 0.55, color: '#F7BFC4' },
    { label: 'STELLA', value: 0.8, color: '#FFE2AC' },
    { label: 'Landsat', value: 0.45, color: '#D8D2FF' },
    { label: 'Data', value: 0.95, color: '#BDEFD8' },
    { label: 'Quiz', value: 0.6, color: '#CDEBFF' },
  ],
}

export const CURRENT_LESSONS = [
  {
    id: 'stella-field-demo',
    color: 'pink',
    icon: 'device',
    label: 'Hands-on',
    title: 'STELLA Field Demo',
    badge: '20 min',
  },
  {
    id: 'landsat-imagery',
    color: 'yellow',
    icon: 'satellite',
    label: 'Satellite Data',
    title: 'Landsat 8 & 9 Imagery',
    badge: '15 min',
  },
  {
    id: 'vegetation-health',
    color: 'cardmint',
    icon: 'leaf',
    label: 'NDVI',
    title: 'Vegetation Health',
    badge: 'Interactive',
  },
]
