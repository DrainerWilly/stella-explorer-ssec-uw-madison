// @ts-nocheck
import { useState } from 'react'
import Icon from '../Icon'
import InstrumentPicker from './InstrumentPicker'
import BuildWorkshop from './BuildWorkshop'
import DeviceSimulator from './DeviceSimulator'
import { STELLA_SOURCE } from '../../data/stellaBuilds'

const STAGES = [
  { id: 'choose', label: 'Choose' },
  { id: 'build', label: 'Build' },
  { id: 'fly', label: 'Fly it' },
]

// STELLA Device Lab: pick a real NASA STELLA instrument, assemble it part by
// part from the actual parts list, then drive a working demo of the device.
export default function StellaDevicePage({ onNavigate }) {
  const [stage, setStage] = useState('choose')
  const [instrument, setInstrument] = useState(null)

  const goto = (next) => setStage(next)

  return (
    <main className="order-1 flex-1 overflow-y-auto overflow-x-hidden scroll-soft px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            STELLA Device Lab
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
            NASA’s STELLA instruments are real do-it-yourself science tools. Pick one, build it
            from its actual parts list, then take the finished instrument for a spin.
          </p>
        </header>

        {/* stage stepper */}
        <div className="flex items-center gap-1 rounded-full bg-cream p-1">
          {STAGES.map((s, i) => {
            const activeIdx = STAGES.findIndex((x) => x.id === stage)
            const active = stage === s.id
            const reachable = i === 0 || (instrument && i <= activeIdx)
            return (
              <button
                key={s.id}
                onClick={() => reachable && goto(s.id)}
                disabled={!reachable}
                aria-current={active ? 'step' : undefined}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all ${
                  active
                    ? 'bg-ink text-app shadow-soft'
                    : reachable
                      ? 'text-muted hover:text-ink'
                      : 'text-faint/60'
                }`}
              >
                <span
                  className={`grid h-[18px] w-[18px] place-items-center rounded-full text-[10px] ${
                    active ? 'bg-app/20' : 'bg-ink/10'
                  }`}
                >
                  {i + 1}
                </span>
                {s.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-6">
        {stage === 'choose' && (
          <InstrumentPicker
            onChoose={(inst) => {
              setInstrument(inst)
              goto('build')
            }}
          />
        )}

        {stage === 'build' && instrument && (
          <BuildWorkshop
            key={instrument.id}
            instrument={instrument}
            onComplete={() => goto('fly')}
            onBack={() => goto('choose')}
          />
        )}

        {stage === 'fly' && instrument && (
          <DeviceSimulator
            key={instrument.id}
            instrument={instrument}
            onRebuild={() => goto('build')}
            onChooseAnother={() => {
              setInstrument(null)
              goto('choose')
            }}
            onNavigate={onNavigate}
          />
        )}
      </div>

      {/* source credit */}
      <footer className="mt-8 border-t border-ink/10 pt-4">
        <p className="max-w-3xl text-[11px] leading-relaxed text-faint">
          {STELLA_SOURCE.credit} Parts, costs, and screen behavior follow NASA’s published
          STELLA-1.2 build documentation; the on-screen demo is a simulation, not device firmware.
          This is an independent educational project. No NASA endorsement is implied.{' '}
          <a
            href={STELLA_SOURCE.indexUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-0.5 font-bold text-muted hover:text-ink hover:underline"
          >
            All STELLA instruments <Icon name="share" className="h-2.5 w-2.5" />
          </a>
        </p>
      </footer>
    </main>
  )
}
