import { PART_BY_ID, PARTS_LIST } from '../data/parts'
import { SOURCE_REFERENCE_BY_ID, sourceAssetUrl } from '../data/sourceReferences'

interface ComponentInspectorProps {
  selectedPartId: string
}

export default function ComponentInspector({ selectedPartId }: ComponentInspectorProps) {
  const part = PART_BY_ID.get(selectedPartId) ?? PARTS_LIST[0]
  const primarySource = part.sourceIds
    .map((id) => SOURCE_REFERENCE_BY_ID.get(id))
    .find(Boolean)

  return (
    <section aria-labelledby="component-inspector-title" aria-live="polite" className="sq2-panel mt-4 rounded-sm p-4">
      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
        Component inspector
      </p>
      <h2 id="component-inspector-title" className="mt-2 text-lg font-semibold leading-6 text-white">
        {part.officialName}
      </h2>
      <p className="mt-1 font-mono text-[10px] text-slate-500">
        Quantity {part.quantity} · {part.manufacturer} · {part.partNumber}
      </p>

      <dl className="mt-4 space-y-3 border-t border-white/10 pt-4">
        <InspectorField label="Purpose" value={part.purpose} />
        <InspectorField label="Assembly role" value={part.assemblyRole} />
        <InspectorField label="Assembly slot" value={part.assemblySlot} />
        <InspectorField
          label="Connections"
          value={part.connectorLocations.length ? part.connectorLocations.join(' · ') : 'No electrical connection'}
        />
      </dl>

      {part.note && (
        <p className="mt-4 border-l-2 border-amber-300/40 bg-amber-300/[0.04] px-3 py-2 text-[10px] leading-4 text-amber-100/70">
          {part.note}
        </p>
      )}

      {primarySource && (
        <a
          href={sourceAssetUrl(primarySource.relativePath)}
          target="_blank"
          rel="noreferrer noopener"
          className="sq2-focus mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-300 hover:text-white"
        >
          Open primary source <span aria-hidden="true">↗</span>
        </a>
      )}
    </section>
  )
}

function InspectorField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-600">{label}</dt>
      <dd className="mt-1 text-[11px] leading-5 text-slate-400">{value}</dd>
    </div>
  )
}
