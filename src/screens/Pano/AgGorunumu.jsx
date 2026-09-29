// Ağ görünümü (orta bölge): kişiler düğüm, rol şekliyle + kişinin rengiyle.
// Yerleşim deterministik (api/agYerlesim.js) — düğümler sabit durur, zıplamaz.
// Konum FİZİKSEL konum DEĞİLDİR; bu SVG altında belirtilir.
import { useMemo } from 'react'
import { agYerlesimi, agCizgileri, agYukseklik } from '../../api/agYerlesim.js'
import './AgGorunumu.css'

const VB_W = 1000
const R = 17 // düğüm yarıçapı (viewBox birimi)

// Kısa etiket: girişimcide kurum, diğerinde ad.
function etiket(n) {
  const s = n.role === 'founder' && n.org ? n.org : n.name
  return s.length > 16 ? s.slice(0, 15) + '…' : s
}

function Dugum({ n, vurgulu, secili, onSec }) {
  const ortak = {
    fill: n.color,
    stroke: secili ? 'var(--vurgu)' : 'var(--yuzey)',
    strokeWidth: secili ? 3 : 2,
  }
  return (
    <g className={`ag-dugum ${vurgulu ? 'ag-dugum--vurgulu' : ''}`}
      data-test="ag-dugum" data-role={n.role} data-id={n.id}
      data-vurgulu={vurgulu || undefined} data-secili={secili || undefined}
      role="button" tabIndex={0} aria-label={n.name}
      onClick={() => onSec?.(n.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSec?.(n.id) } }}>
      {vurgulu && <circle className="ag-halka" cx={n.x} cy={n.y} r={R + 8} fill="none" />}
      {n.role === 'investor' && <circle cx={n.x} cy={n.y} r={R} {...ortak} />}
      {n.role === 'founder' && <rect x={n.x - R} y={n.y - R} width={R * 2} height={R * 2} rx={5} {...ortak} />}
      {n.role === 'guest' && (
        <rect x={n.x - R * 0.8} y={n.y - R * 0.8} width={R * 1.6} height={R * 1.6}
          transform={`rotate(45 ${n.x} ${n.y})`} {...ortak} />
      )}
      <text className="ag-etiket" x={n.x} y={n.etiketYukari ? n.y - R - 8 : n.y + R + 22} textAnchor="middle">
        {etiket(n)}
      </text>
    </g>
  )
}

export default function AgGorunumu({ people, edges = [], live = [], vurgulanan = [], seciliId, onKisiSec }) {
  const vbH = agYukseklik(people)
  const dugumler = useMemo(() => agYerlesimi(people, { w: VB_W, h: vbH }), [people, vbH])
  const cizgiler = useMemo(() => agCizgileri(edges, live, dugumler), [edges, live, dugumler])
  const vurguSet = useMemo(() => new Set(vurgulanan), [vurgulanan])
  const vurguAktif = vurgulanan.length > 0

  return (
    <div className="ag-gorunumu">
      <svg
        className="ag-svg"
        data-vurgu={vurguAktif || undefined}
        viewBox={`0 0 ${VB_W} ${vbH}`}
        style={{ aspectRatio: `${VB_W} / ${vbH}` }}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Kişi ağı — kim kiminle vakit geçirdi"
      >
        <g className="ag-cizgiler">
          {cizgiler.map((c) => (
            <line
              key={`${c.a}-${c.b}`}
              className={`ag-cizgi ${c.birlikte ? 'ag-cizgi--birlikte' : ''}`}
              data-test="ag-cizgi"
              data-birlikte={c.birlikte || undefined}
              x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
              strokeWidth={c.kalinlik}
            />
          ))}
        </g>
        {dugumler.map((n) => (
          <Dugum key={n.id} n={n} vurgulu={vurguSet.has(n.id)} secili={seciliId === n.id} onSec={onKisiSec} />
        ))}
      </svg>
      <p className="ag-not">Düğümlerin konumu fiziksel konum değildir; yalnız rol gruplarını gösterir.</p>
    </div>
  )
}
