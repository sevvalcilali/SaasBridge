// Karakalem insan siluti (Pano canlı gruplar): baş, gövde, kollar, bacaklar; çizgiler iki kez, hafif kaydırılarak
// çizilir ve gövde taranır → kalem izi görünümü (filtre yok: ucuz tablette de akıcı). Renk `currentColor` (süre).
// Üç duruş (api/gruplar.js siluetPozu): 0 kollar yanda, 1 el kalkık (konuşuyor), 2 elinde bardak. Varsayılan sağa
// bakar; `ayna` sola çevirir (grubun ortasına dönsün). Rol işareti göğüste: ○ yatırımcı, □ girişimci, ◇ misafir.
const GOVDE = 'M17 36 Q30 27 43 36 L46 63 Q30 67 14 63 Z'
const BACAKLAR = 'M23 64 L22 95 M37 64 L38 95 M22 95 L16.5 96.5 M38 95 L43.5 96.5'
const TARAMA = 'M20 42 L26 38 M19 49 L32 41 M18 56 L38 44 M19 62 L42 50 M28 64 L44 56'
// [sol kol, sağ kol]. Duruş 1'de sağ el kalkık: ayrı parça, konuşurken hafifçe sallanır (CSS siluet-el).
const KOLLAR = [
  ['M18 37 Q12 49 14 61', 'M42 37 Q48 49 46 61'],
  ['M18 37 Q12 49 14 61', 'M42 37 Q53 40 55 28'],
  ['M18 37 Q10 46 15 53', 'M42 37 Q48 49 46 61'],
]

function Cizim({ poz }) {
  const [sol, sag] = KOLLAR[poz]
  return (
    <>
      <ellipse cx="30" cy="15" rx="8.6" ry="9.4" />
      <path d={GOVDE} />
      <path d={sol} />
      <path d={sag} className={poz === 1 ? 'siluet-el' : undefined} />
      <path d={BACAKLAR} />
      {poz === 2 && <path d="M10.5 48.5 L17.5 48.5 L16.5 56 L11.5 56 Z" />}
    </>
  )
}

function RolIsareti({ rol }) {
  const ortak = { fill: 'var(--yuzey)', stroke: 'currentColor', strokeWidth: 1.6 }
  if (rol === 'founder') return <rect x="26.5" y="43.5" width="7" height="7" rx="1" {...ortak} />
  if (rol === 'guest') return <rect x="27" y="44" width="6" height="6" transform="rotate(45 30 47)" {...ortak} />
  return <circle cx="30" cy="47" r="3.8" {...ortak} />
}

export default function Siluet({ renk, poz = 0, rol, ayna = false, gecikme = 0, className = '' }) {
  return (
    <svg className={`siluet ${className}`} viewBox="0 0 60 100" style={{ color: renk, '--gecikme': `${gecikme}s` }}
      aria-hidden="true">
      <g transform={ayna ? 'translate(60 0) scale(-1 1)' : undefined}
        fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <g strokeWidth="2.3" opacity="0.92"><Cizim poz={poz} /></g>
        <g strokeWidth="1" opacity="0.45" transform="translate(0.9 -0.7)"><Cizim poz={poz} /></g>
        <path d={TARAMA} strokeWidth="0.8" opacity="0.32" />
      </g>
      <RolIsareti rol={rol} />
    </svg>
  )
}
