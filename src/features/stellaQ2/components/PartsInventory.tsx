import { PARTS_LIST, PARTS_LIST_TOTAL_USD, PRINTED_PARTS } from '../data/parts'
import type { PartDefinition } from '../types'

interface PartsInventoryProps {
  selectedPartId: string
  onSelect: (partId: string) => void
}

export default function PartsInventory({ selectedPartId, onSelect }: PartsInventoryProps) {
  return (
    <section aria-labelledby="parts-inventory-title" className="sq2-panel overflow-hidden rounded-sm">
      <div className="flex items-end justify-between gap-4 border-b border-white/10 px-4 py-4">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Official inventory
          </p>
          <h2 id="parts-inventory-title" className="mt-1 text-sm font-semibold text-white">
            Parts list
          </h2>
        </div>
        <div className="text-right">
          <p className="font-mono text-lg font-semibold text-white">${PARTS_LIST_TOTAL_USD}</p>
          <p className="text-[8px] uppercase tracking-[0.14em] text-slate-600">published total</p>
        </div>
      </div>
      <div className="max-h-[25rem] overflow-y-auto py-1 sq2-scrollbar">
        <InventorySection
          label="Published parts list · 13 lines"
          parts={PARTS_LIST}
          selectedPartId={selectedPartId}
          onSelect={onSelect}
        />
        <InventorySection
          label="Supplied 3D-print files"
          parts={PRINTED_PARTS}
          selectedPartId={selectedPartId}
          onSelect={onSelect}
        />
      </div>
      <p className="border-t border-white/10 px-4 py-3 text-[9px] leading-4 text-slate-600">
        The published total includes both documented battery configurations. See each battery’s
        note before choosing an enclosure.
      </p>
    </section>
  )
}

function InventorySection({
  label,
  parts,
  selectedPartId,
  onSelect,
}: {
  label: string
  parts: PartDefinition[]
  selectedPartId: string
  onSelect: (partId: string) => void
}) {
  return (
    <section aria-label={label}>
      <h3 className="px-4 pb-1 pt-3 text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-600">
        {label}
      </h3>
      <ul>
        {parts.map((part, index) => {
          const selected = selectedPartId === part.id
          return (
            <li key={part.id}>
              <button
                type="button"
                onClick={() => onSelect(part.id)}
                aria-pressed={selected}
                className={`sq2-focus grid w-full grid-cols-[1.8rem_1fr_auto] items-start gap-2 border-l-2 px-3 py-2.5 text-left transition ${
                  selected
                    ? 'border-cyan-300 bg-cyan-300/[0.07]'
                    : 'border-transparent hover:bg-white/[0.035]'
                }`}
              >
                <span className="pt-0.5 font-mono text-[9px] text-slate-600">
                  {(part.lineNumber ?? index + 1).toString().padStart(2, '0')}
                </span>
                <span>
                  <span className={`block text-xs font-medium ${selected ? 'text-white' : 'text-slate-300'}`}>
                    {part.officialName}
                  </span>
                  <span className="mt-0.5 block text-[9px] text-slate-600">
                    {part.manufacturer} · {part.partNumber}
                  </span>
                </span>
                <span className="font-mono text-[10px] text-slate-500">×{part.quantity}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
