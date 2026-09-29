// Ağ görünümü (orta bölge): kişiler düğüm, rol şekliyle + kişinin rengiyle.
// Yerleşim deterministik (api/agYerlesim.js) — düğümler sabit durur, zıplamaz.
// Konum FİZİKSEL konum DEĞİLDİR; bu SVG altında belirtilir. Çizgiler 1.12'de.
import { useMemo } from 'react'
import { agYerlesimi, agCizgileri } from '../../api/agYerlesim.js'
import './AgGorunumu.css'

const VB_W = 1000
const VB_H = 700
const R = 15 // düğüm yarıçapı (viewBox birimi)

// Kısa etiket: girişimcide kurum, diğerinde ad.
function etiket(n) {
  const s = n.role === 'founder' && n.org ? n.org : n.name
  return s.length > 16 ? s.slice(0, 15) + '…' : s
}

function Dugum({ n }) {
  const ortak = {
    fill: n.color,
    stroke: 'var(--yuzey)',
    strokeWidth: 2,
  }
  return (
    <g className="ag-dugum" data-test="ag-dugum" data-role={n.role} data-id={n.id}>
      {n.role === 'investor' && <circle cx={n.x} cy={n.y} r={R} {...ortak} />}
      {n.role === 'founder' && <rect x={n.x - R} y={n.y - R} width={R * 2} height={R * 2} rx={5} {...ortak} />}
      {n.role === 'guest' && (
        <rect x={n.x - R * 0.8} y={n.y - R * 0.8} width={R * 1.6} height={R * 1.6}
          transform={`rotate(45 ${n.x} ${n.y})`} {...ortak} />
      )}
      <text className="ag-etiket" x={n.x} y={n.y + R + 13} textAnchor="middle">{etiket(n)}</text>
    </g>
  )
}

export default function AgGorunumu({ people, edges = [], live = [] }) {
  const dugumler = useMemo(() => agYerlesimi(people, { w: VB_W, h: VB_H }), [people])
  const cizgiler = useMemo(() => agCizgileri(edges, live, dugumler), [edges, live, dugumler])

  return (
    <div className="ag-gorunumu">
      <svg
        className="ag-svg"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
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
        {dugumler.map((n) => <Dugum key={n.id} n={n} />)}
      </svg>
      <p className="ag-not">Düğümlerin konumu fiziksel konum değildir; yalnız rol gruplarını gösterir.</p>
    </div>
  )
}
