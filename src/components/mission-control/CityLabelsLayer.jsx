import { useMemo, useState } from 'react'
import { Html } from '@react-three/drei'
import { surfaceVec3, DEG2RAD } from '../../utils/orbitMath.js'
import { TOP_CITIES_BY_POPULATION } from '../../data/topCities.js'

const CITY_COLOR = '#ffc266' // warm amber, reads as "city lights" against the blue globe
const SURFACE_LIFT = 0.008

// How many of the largest cities are limited by quality (mirrors the approach
// used for stars/segments elsewhere) so this stays light on lower-end devices.
function cityCountForQuality(quality) {
  if (quality === 'low') return 20
  if (quality === 'high') return TOP_CITIES_BY_POPULATION.length
  return 40
}
// Of the shown cities, only the largest get an always-on label; the rest only
// label on hover, so the globe doesn't get cluttered with text.
const ALWAYS_LABELED_COUNT = 12

function CityMarker({ city, alwaysLabel }) {
  const [hovered, setHovered] = useState(false)
  const position = useMemo(
    () => surfaceVec3(city.lat * DEG2RAD, city.lon * DEG2RAD, SURFACE_LIFT),
    [city.lat, city.lon],
  )
  const showLabel = alwaysLabel || hovered

  return (
    <group position={position}>
      {/* larger invisible hit area for easy hover on a small dot */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* soft halo */}
      <mesh scale={hovered ? 2.6 : 1.8}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshBasicMaterial color={CITY_COLOR} transparent opacity={0.28} depthWrite={false} />
      </mesh>

      {/* the city dot */}
      <mesh scale={hovered ? 1.6 : 1}>
        <sphereGeometry args={[0.012, 10, 10]} />
        <meshBasicMaterial color={CITY_COLOR} />
      </mesh>

      {showLabel && (
        <Html center distanceFactor={9} zIndexRange={[15, 0]} style={{ pointerEvents: 'none' }}>
          <div
            className="translate-y-[-14px] whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{
              background: 'rgba(10,14,25,0.78)',
              color: '#ffe4b3',
              border: `1px solid ${CITY_COLOR}`,
            }}
          >
            {city.name}
          </div>
        </Html>
      )}
    </group>
  )
}

// A static reference layer of major world cities — off by default, toggled
// from Scene settings. Purely educational/orientation; not tied to any
// satellite or orbital data.
export default function CityLabelsLayer({ show, quality }) {
  const cities = useMemo(
    () => TOP_CITIES_BY_POPULATION.slice(0, cityCountForQuality(quality)),
    [quality],
  )

  if (!show) return null

  return (
    <group>
      {cities.map((city, i) => (
        <CityMarker key={city.name} city={city} alwaysLabel={i < ALWAYS_LABELED_COUNT} />
      ))}
    </group>
  )
}
