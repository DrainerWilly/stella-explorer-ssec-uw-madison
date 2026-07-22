import { sourceAssetUrl } from '../data/sourceReferences'

const PDF_URL = sourceAssetUrl(
  'Build instructions and documentation/STELLA-Q2 flat assembly diagram.pdf',
)

export default function AssemblyDiagram() {
  return (
    <figure className="flex min-h-[34rem] flex-col rounded-sm border border-white/10 bg-[#e9ecea] p-3 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/10 pb-3 text-slate-800">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Central build reference
          </p>
          <h3 className="mt-1 text-sm font-semibold">STELLA-Q2 flat assembly</h3>
        </div>
        <a
          href={PDF_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="sq2-focus rounded-sm border border-slate-900/20 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition hover:bg-slate-900 hover:text-white"
        >
          Open source PDF
        </a>
      </div>
      <div className="grid flex-1 place-items-center overflow-auto py-5 sq2-scrollbar">
        <img
          src="/assets/stella-q2/flat-assembly-diagram.webp"
          alt="NASA STELLA-Q2 one-to-one flat assembly diagram showing the microcontroller, power switch, battery, pushbutton, real-time clock, 18-channel spectrometer, OLED display, and their connecting cables."
          className="max-h-[52rem] w-full max-w-[76rem] object-contain"
        />
      </div>
      <figcaption className="border-t border-slate-900/10 pt-3 text-[11px] leading-5 text-slate-600">
        The source diagram is 1:1 only when printed at 100% on one sheet; responsive browser
        display is not physical scale. The coin-cell callout specifies the positive side up.
      </figcaption>
    </figure>
  )
}
