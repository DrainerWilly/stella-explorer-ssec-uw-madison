import { BUILD_PHOTO_BY_ID } from '../data/buildPhotos'
import { SOURCE_REFERENCE_BY_ID, sourceAssetUrl } from '../data/sourceReferences'
import { STL_ASSETS } from '../data/stlAssets'
import type { BuildStep, PartDefinition, SourceReference } from '../types'

interface SourceReferencePanelProps {
  step: BuildStep
  part: PartDefinition
}

interface FileReference {
  id: string
  title: string
  filename: string
  kind: string
  purpose: string
  href?: string
  collectionNote?: string
}

const COLLECTION_SOURCE_IDS = new Set([
  'build-photos',
  'stl-files',
  'circuitpython-libraries',
  'hardware-test-code',
])

function basename(path: string) {
  const segments = path.split('/')
  return segments[segments.length - 1] ?? path
}

function sourceToFile(source: SourceReference): FileReference {
  const isCollection = COLLECTION_SOURCE_IDS.has(source.id)
  return {
    id: source.id,
    title: source.title,
    filename: basename(source.relativePath),
    kind: source.kind,
    purpose: source.purpose,
    href: isCollection ? undefined : sourceAssetUrl(source.relativePath),
    collectionNote: isCollection ? 'Collection inspected in the source audit' : undefined,
  }
}

export default function SourceReferencePanel({ step, part }: SourceReferencePanelProps) {
  const stepDocuments = [...new Set(step.sourceIds)]
    .filter((id) => !COLLECTION_SOURCE_IDS.has(id))
    .map((id) => SOURCE_REFERENCE_BY_ID.get(id))
    .filter((source) => source !== undefined)
    .map(sourceToFile)

  const stepPhotos: FileReference[] = step.photoIds
    .map((id) => BUILD_PHOTO_BY_ID.get(id))
    .filter((photo) => photo !== undefined)
    .map((photo) => ({
      id: photo.id,
      title: `Photo ${photo.sequence} · ${photo.caption}`,
      filename: photo.filename,
      kind: 'photograph',
      purpose: `Official visual reference for build step ${photo.buildStepNumber}.`,
      href: sourceAssetUrl(photo.assetPath),
    }))

  const componentSources = [...new Set(part.sourceIds)]
    .filter((id) => id !== 'build-photos' && id !== 'stl-files')
    .map((id) => SOURCE_REFERENCE_BY_ID.get(id))
    .filter((source) => source !== undefined)
    .map(sourceToFile)

  const stl = part.stlAssetId
    ? STL_ASSETS.find((asset) => asset.id === part.stlAssetId)
    : undefined
  if (stl) {
    componentSources.push({
      id: `stl-${stl.id}`,
      title: `${part.officialName} geometry`,
      filename: stl.filename,
      kind: 'stl',
      purpose: stl.role,
      href: sourceAssetUrl(stl.assetPath),
    })
  }

  return (
    <section aria-labelledby="source-reference-title" className="sq2-panel mt-4 rounded-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Evidence for this view
          </p>
          <h2 id="source-reference-title" className="mt-1 text-sm font-semibold text-white">
            Source references
          </h2>
        </div>
        <span className="rounded-full border border-white/10 px-2 py-1 font-mono text-[9px] text-slate-500">
          {stepDocuments.length + stepPhotos.length + componentSources.length} files
        </span>
      </div>

      <ReferenceGroup
        title={`Step ${step.number} evidence`}
        references={[...stepDocuments, ...stepPhotos]}
      />
      <ReferenceGroup
        title={`Selected component · ${part.officialName}`}
        references={componentSources}
      />

      <p className="mt-3 text-[9px] leading-4 text-slate-600">
        Public links are deployment-relative. Developer filesystem paths never appear in the lab.
      </p>
    </section>
  )
}

function ReferenceGroup({ title, references }: { title: string; references: FileReference[] }) {
  return (
    <section className="mt-4" aria-label={title}>
      <h3 className="text-[8px] font-semibold uppercase tracking-[0.17em] text-slate-600">
        {title}
      </h3>
      {references.length ? (
        <ul className="mt-2 divide-y divide-white/10 border-y border-white/10">
          {references.map((reference) => (
            <li key={reference.id}>
              <ReferenceEntry reference={reference} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[9px] leading-4 text-slate-600">
          No component-specific file is required for this step.
        </p>
      )}
    </section>
  )
}

function ReferenceEntry({ reference }: { reference: FileReference }) {
  const content = (
    <>
      <span className="min-w-0">
        <span className="block text-[11px] font-medium leading-4 text-slate-300 group-hover:text-white">
          {reference.title}
        </span>
        <span className="mt-1 block break-all font-mono text-[8px] leading-3 text-slate-600">
          {reference.filename}
        </span>
        {reference.collectionNote && (
          <span className="mt-1 block text-[8px] text-slate-600">{reference.collectionNote}</span>
        )}
      </span>
      <span className="shrink-0 pt-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-cyan-300">
        {reference.kind}{reference.href ? ' ↗' : ''}
      </span>
    </>
  )

  if (!reference.href) {
    return <div className="flex items-start justify-between gap-4 py-3">{content}</div>
  }

  return (
    <a
      href={reference.href}
      target="_blank"
      rel="noreferrer noopener"
      title={reference.purpose}
      className="sq2-focus group flex items-start justify-between gap-4 py-3 text-left"
    >
      {content}
    </a>
  )
}
