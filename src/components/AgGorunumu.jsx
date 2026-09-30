// Ağ görünümü (pano orta bölge + sunum modu; ortak bileşen): kişiler düğüm, rol şekliyle + kişinin rengiyle.
// Yerleşim deterministik (api/agYerlesim.js) — düğümler sabit durur, zıplamaz.
// Sunum modunda (salon ekranı) tıklanmaz ve ekrana sığar; isimsiz seçilirse ad yazılmaz.
// Konum FİZİKSEL konum DEĞİLDİR; bu SVG altında belirtilir.
import { useMemo } from 'react'
import { agYerlesimi, agCizgileri, agYukseklik } from '../api/agYerlesim.js'
import './AgGorunumu.css'

const VB_W = 1000
const VB_W_SUNUM = 1700 // salon ekranı geniş (16:9): sütunlar ayrılır, ağ ekranı doldurur
const R = 17 // düğüm yarıçapı (viewBox birimi)

// Kısa etiket: girişimcide kurum, diğerinde ad.
function etiket(n) {
  const s = n.role === 'founder' && n.org ? n.org : n.name
  return s.length > 16 ? s.slice(0, 15) + '…' : s
}

function Dugum({ n, vurgulu, secili, isimsiz, onSec }) {
  const ortak = {
    fill: n.color,
    stroke: secili ? 'var(--vurgu)' : 'var(--yuzey)',
    strokeWidth: secili ? 3 : 2,
  }
  // Tıklanabilir yalnız seçim işlevi verilmişse (sunum modunda değil).
  const etkilesim = onSec
    ? {
        role: 'button', tabIndex: 0, 'aria-label': n.name,
        onClick: () => onSec(n.id),
        onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSec(n.id) } },
      }
    : {}
  return (
    <g className={`ag-dugum ${vurgulu ? 'ag-dugum--vurgulu' : ''} ${onSec ? '' : 'ag-dugum--sabit'}`}
      data-test="ag-dugum" data-role={n.role} data-id={n.id}
      data-vurgulu={vurgulu || undefined} data-secili={secili || undefined}
      {...etkilesim}>
      {vurgulu && <circle className="ag-halka" cx={n.x} cy={n.y} r={R + 8} fill="none" />}
      {n.role === 'investor' && <circle cx={n.x} cy={n.y} r={R} {...ortak} />}
      {n.role === 'founder' && <rect x={n.x - R} y={n.y - R} width={R * 2} height={R * 2} rx={5} {...ortak} />}
      {n.role === 'guest' && (
        <rect x={n.x - R * 0.8} y={n.y - R * 0.8} width={R * 1.6} height={R * 1.6}
          transform={`rotate(45 ${n.x} ${n.y})`} {...ortak} />
      )}
      {!isimsiz && (
        <text className="ag-etiket" x={n.x} y={n.etiketYukari ? n.y - R - 8 : n.y + R + 22} textAnchor="middle">
          {etiket(n)}
        </text>
      )}
    </g>
  )
}

export default function AgGorunumu({
  people, edges = [], live = [], vurgulanan = [], seciliId, onKisiSec, sunum = false, isimsiz = false,
}) {
  const vbH = agYukseklik(people)
  const vbW = sunum ? VB_W_SUNUM : VB_W
  const dugumler = useMemo(() => agYerlesimi(people, { w: vbW, h: vbH }), [people, vbW, vbH])
  const cizgiler = useMemo(() => agCizgileri(edges, live, dugumler), [edges, live, dugumler])
  const vurguSet = useMemo(() => new Set(vurgulanan), [vurgulanan])
  const vurguAktif = vurgulanan.length > 0

  return (
    <div className={`ag-gorunumu ${sunum ? 'ag-gorunumu--sunum' : ''}`}>
      <svg
        className="ag-svg"
        data-vurgu={vurguAktif || undefined}
        viewBox={`0 0 ${vbW} ${vbH}`}
        style={sunum ? undefined : { aspectRatio: `${VB_W} / ${vbH}` }}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Kişi ağı${isimsiz ? ' (isimsiz)' : ''} — kim kiminle vakit geçirdi`}
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
          <Dugum key={n.id} n={n} vurgulu={vurguSet.has(n.id)} secili={seciliId === n.id} isimsiz={isimsiz} onSec={onKisiSec} />
        ))}
      </svg>
      <p className="ag-not">Düğümlerin konumu fiziksel konum değildir; yalnız rol gruplarını gösterir.</p>
    </div>
  )
}
