import type { LayoutPartId } from '../../types'

interface TechnicalComponentProps {
  partId: LayoutPartId
  face?: 'positive-up' | 'negative-up' | null
  compact?: boolean
}

// These deliberately remain clean technical silhouettes rather than unrelated
// product photography. Their forms and colors are based on the supplied Build 1
// photograph and the board outlines on the supplied flat assembly diagram.
export default function TechnicalComponent({ partId, face, compact = false }: TechnicalComponentProps) {
  const text = compact ? 'text-[6px]' : 'text-[9px]'
  const dot = compact ? 'h-1 w-1' : 'h-1.5 w-1.5'

  if (partId === 'thing-plus-rp2040') {
    return <div className="relative h-full w-full rounded-[8%] border border-rose-950 bg-[#bb2d31] shadow-[inset_0_0_0_2px_rgb(255_255_255_/_0.12)]"><span className="absolute left-[10%] top-[7%] h-[11%] w-[45%] rounded-sm bg-slate-200" /><span className={`absolute left-1/2 top-[24%] -translate-x-1/2 font-bold text-rose-100 ${text}`}>RP2040</span><Pins side="left" dot={dot} /><Pins side="right" dot={dot} /></div>
  }
  if (partId === 'i2c-button') {
    return <div className="relative h-full w-full rounded-[7%] border border-rose-950 bg-[#c73a3c]"><span className="absolute left-1/2 top-1/2 h-[45%] w-[45%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-rose-950 bg-[#e94a46] shadow-[inset_0_0_0_2px_rgb(255_255_255_/_0.35)]" /><Pins side="left" dot={dot} /><Pins side="right" dot={dot} /></div>
  }
  if (partId === 'pcf8523-clock') {
    return <div className="relative h-full w-full rounded-[9%] border border-slate-500 bg-[#1f2734]"><span className="absolute left-1/2 top-1/2 h-[52%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-200 bg-[#b6a178]" /><span className={`absolute bottom-[6%] left-1/2 -translate-x-1/2 font-semibold text-slate-100 ${text}`}>RTC</span><Pins side="left" dot={dot} /><Pins side="right" dot={dot} /></div>
  }
  if (partId === 'cr1220') {
    return <div className={`relative grid h-full w-full place-items-center rounded-full border-2 ${face === 'positive-up' ? 'border-amber-100 bg-gradient-to-br from-[#f0ddb0] to-[#847151]' : 'border-slate-300 bg-gradient-to-br from-[#8c98a3] to-[#424b56]'}`}><span className={`${compact ? 'text-[8px]' : 'text-xs'} font-black ${face === 'positive-up' ? 'text-slate-700' : 'text-slate-100'}`}>{face === 'positive-up' ? '+' : '−'}</span><span className="sr-only">{face === 'positive-up' ? 'positive face' : 'negative face'}</span></div>
  }
  if (partId === 'triad-spectral-sensor') {
    return <div className="relative h-full w-full rounded-[4%] border border-rose-950 bg-[#c93636]"><span className="absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-rose-950 bg-[#781f25] shadow-[inset_0_0_0_3px_#ee6a5d]" /><span className="absolute left-1/2 top-1/2 h-[18%] w-[18%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-100" /><span className={`absolute bottom-[5%] left-1/2 -translate-x-1/2 font-bold text-rose-100 ${text}`}>TRIAD</span><Pins side="left" dot={dot} /><Pins side="right" dot={dot} /></div>
  }
  if (partId === 'oled-display') {
    return <div className="relative h-full w-full rounded-[9%] border border-cyan-950 bg-[#205a84]"><span className="absolute left-[13%] top-[18%] h-[52%] w-[66%] rounded-sm border border-slate-600 bg-[#07121a]" /><span className={`absolute bottom-[4%] left-1/2 -translate-x-1/2 text-cyan-100 ${text}`}>OLED</span><Pins side="right" dot={dot} /></div>
  }
  if (partId === 'battery-400') {
    return <div className="relative h-full w-full rounded-[5%] border border-slate-500 bg-gradient-to-b from-slate-100 to-slate-400"><span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-semibold text-slate-700 ${text}`}>3.7V 400mAh</span><span className="absolute -left-[7%] top-[36%] h-[26%] w-[10%] rounded-sm bg-white" /></div>
  }
  return <div className="relative h-full w-full rounded-full border border-slate-800 bg-gradient-to-b from-slate-600 to-slate-950"><span className="absolute left-1/2 top-1/2 h-[42%] w-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-500 bg-black" /><span className={`absolute bottom-[7%] left-1/2 -translate-x-1/2 font-semibold text-slate-300 ${text}`}>POWER</span></div>
}

function Pins({ side, dot }: { side: 'left' | 'right'; dot: string }) {
  return <span className={`absolute ${side === 'left' ? '-left-[5%]' : '-right-[5%]'} top-[32%] flex h-[36%] flex-col justify-around`}><i className={`block rounded-full bg-slate-200 ${dot}`} /><i className={`block rounded-full bg-slate-200 ${dot}`} /></span>
}
