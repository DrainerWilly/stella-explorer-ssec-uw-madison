import { useState } from 'react'
import Icon from '../Icon.jsx'
import { EXAGGERATION_OPTIONS } from '../../utils/orbitMath.js'
import { SCIENCE_LAYERS_NOTE } from '../../data/earthLayers.js'
import { PANEL, LABEL, GHOST_BTN, ACCENT, ACCENT_INK } from './mcStyles.js'

function Row({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[12px] font-semibold text-white/80">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-[18px] w-8 shrink-0 rounded-full transition-colors ${
          checked ? '' : 'bg-white/15'
        }`}
        style={checked ? { backgroundColor: ACCENT } : undefined}
      >
        <span
          className={`absolute top-0.5 h-[14px] w-[14px] rounded-full transition-all ${
            checked ? 'left-[16px] bg-[#062033]' : 'left-0.5 bg-white'
          }`}
        />
      </button>
    </div>
  )
}

export default function SceneControls({ settings, onChange, reducedMotion, onResetCamera }) {
  const [open, setOpen] = useState(false)

  const chip = (active) =>
    `rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
      active ? '' : 'bg-white/5 text-white/50 hover:text-white'
    }`

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Scene settings"
        title="Scene settings"
        className={`${GHOST_BTN} ${open ? 'bg-white/15 text-white' : ''}`}
      >
        <Icon name="settings" className="h-[18px] w-[18px]" />
      </button>

      {open && (
        <div className={`absolute right-0 top-11 z-40 w-64 ${PANEL} p-3`}>
          <div className={LABEL}>Scene settings</div>
          <div className="mt-1">
            <Row label="Earth rotation" checked={settings.earthRotation} onChange={(v) => onChange('earthRotation', v)} />
            <Row label="Stars" checked={settings.stars} onChange={(v) => onChange('stars', v)} />
            <Row label="Orbit trails" checked={settings.trails} onChange={(v) => onChange('trails', v)} />
            <Row label="Ground track" checked={settings.groundTrack} onChange={(v) => onChange('groundTrack', v)} />
            <Row label="Lat/lon grid" checked={settings.grid} onChange={(v) => onChange('grid', v)} />
            <Row label="Show all labels" checked={settings.showAllLabels} onChange={(v) => onChange('showAllLabels', v)} />
            <Row label="Cities" checked={settings.cities} onChange={(v) => onChange('cities', v)} />
          </div>

          {/* exaggeration */}
          <div className="mt-2 border-t border-white/10 pt-2">
            <div className={LABEL}>Visual orbit exaggeration</div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {EXAGGERATION_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onChange('exaggeration', opt.value)}
                  aria-pressed={settings.exaggeration === opt.value}
                  className={chip(settings.exaggeration === opt.value)}
                  style={
                    settings.exaggeration === opt.value
                      ? { backgroundColor: ACCENT, color: ACCENT_INK }
                      : undefined
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[10px] leading-snug text-white/35">
              {settings.exaggeration === 1
                ? 'Orbit heights shown to physical scale.'
                : `Orbit heights shown ×${settings.exaggeration} for visibility (not physical scale).`}
            </p>
          </div>

          {/* quality */}
          <div className="mt-2 border-t border-white/10 pt-2">
            <div className={LABEL}>Quality</div>
            <div className="mt-1.5 flex gap-1">
              {['low', 'balanced', 'high'].map((q) => (
                <button
                  key={q}
                  onClick={() => onChange('quality', q)}
                  aria-pressed={settings.quality === q}
                  className={`flex-1 ${chip(settings.quality === q)}`}
                  style={
                    settings.quality === q
                      ? { backgroundColor: ACCENT, color: ACCENT_INK }
                      : undefined
                  }
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onResetCamera}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/70 hover:text-white"
          >
            <Icon name="reset" className="h-3.5 w-3.5" />
            Reset camera
          </button>

          <div className="mt-2 flex items-center justify-between text-[10px] text-white/35">
            <span className="uppercase tracking-wider">Reduced motion</span>
            <span className={reducedMotion ? 'font-bold text-emerald-400' : ''}>
              {reducedMotion ? 'On (respected)' : 'Off'}
            </span>
          </div>

          <p className="mt-2 rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-[10px] text-white/40">
            {SCIENCE_LAYERS_NOTE}
          </p>
        </div>
      )}
    </div>
  )
}
