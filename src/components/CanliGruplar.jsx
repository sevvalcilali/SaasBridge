// Canlı gruplar ("adacıklar"): şu an yan yana olanlar tek bir dairede; 2 kişilik küçük, 5 kişilik büyük.
// Yatırımcı ile girişimcinin buluştuğu grup yeşil çerçeveli (etkinliğin amacı). Grupta olmayanlar alttaki
// "Boşta" şeridinde; yalnız kalan önemli yatırımcı orada öne çıkar. Daireler ekranda yer değiştirmez
// (api/gruplar.js yerlestir); yerleri salondaki yeri DEĞİLDİR. Pano ve sunum modunda ortak.
import { memo, useMemo, useRef } from 'react'
import { bostakiler, canliGruplar, yalnizMi, yerlestir } from '../api/gruplar.js'
import { kisaAd } from '../api/ad.js'
import { sureYazisi } from '../api/format.js'
import { RolSekli } from './KisiRozeti.jsx'
import './CanliGruplar.css'

const DAIREDE_EN_COK = 6 // daha kalabalık grupta ilk 5 kişi + "+N"

function Uye({ k, vurgulu, secili, isimsiz, onSec }) {
  const icerik = (
    <>
      <span className="grup-renk" style={{ background: k.color }} aria-hidden="true" />
      <RolSekli rol={k.role} />
      {!isimsiz && <span className="grup-ad">{kisaAd(k)}</span>}
    </>
  )
  const sinif = `grup-uye ${vurgulu ? 'grup-uye--vurgulu' : ''} ${secili ? 'grup-uye--secili' : ''}`
  if (!onSec) return <li className={sinif}>{icerik}</li>
  return (
    <li>
      <button type="button" className={sinif} title={kisaAd(k)} data-test="grup-uye" data-id={k.id}
        onClick={(e) => { e.stopPropagation(); onSec(k.id) }}>
        {icerik}
      </button>
    </li>
  )
}

const Grup = memo(function Grup({ g, vurguSet, seciliId, isimsiz, onKisiSec, onGrupSec }) {
  const n = g.uyeler.length
  const gorunen = n > DAIREDE_EN_COK ? g.uyeler.slice(0, DAIREDE_EN_COK - 1) : g.uyeler
  const vurgulu = g.uyeler.some((u) => vurguSet.has(u.id))
  const sure = sureYazisi(g.dakika).replace(/ \d+ sn$/, '')
  const etiket = `${n} kişi · ${sure}`
  return (
    <div className={`grup grup--n${Math.min(n, 5)} ${g.karma ? 'grup--karma' : ''} ${vurgulu ? 'grup--vurgulu' : ''}`}
      role="listitem" data-test="grup" data-karma={g.karma || undefined}
      aria-label={`${etiket}${g.karma ? ', yatırımcı ile girişimci' : ''}`}>
      <div className="grup-etiket sayi">{etiket}</div>
      <div className="grup-daire" onClick={onGrupSec ? () => onGrupSec(g.uyeler.map((u) => u.id)) : undefined}>
        <ul className="grup-uyeler">
          {gorunen.map((u) => (
            <Uye key={u.id} k={u} vurgulu={vurguSet.has(u.id)} secili={seciliId === u.id} isimsiz={isimsiz} onSec={onKisiSec} />
          ))}
          {n > gorunen.length && <li className="grup-fazla sayi">+{n - gorunen.length}</li>}
        </ul>
      </div>
    </div>
  )
})

export default function CanliGruplar({
  people, live = [], vurgulanan = [], seciliId, onKisiSec, onGrupSec, sunum = false, isimsiz = false,
}) {
  const gruplar = useMemo(() => canliGruplar(people, live), [people, live])
  const imza = gruplar.map((g) => g.anahtar).join('|')
  // Önceki çizimin yerleri: grup büyüyüp küçülse de aynı yerde kalır, yeni grup boş yere çıkar.
  const yerRef = useRef({ yerler: [], atama: new Map() })
  // eslint-disable-next-line react-hooks/exhaustive-deps -- gruplar yerine üyelik imzası izlenir
  const { yerler, atama } = useMemo(() => (yerRef.current = yerlestir(yerRef.current.yerler, gruplar)), [imza])
  const yerdeki = new Map(gruplar.map((g) => [atama.get(g.anahtar), g]))
  const { bosta, gorunmeyen } = useMemo(() => bostakiler(people, gruplar), [people, gruplar])
  const vurguSet = useMemo(() => new Set(vurgulanan), [vurgulanan])
  const tiklanir = !sunum && onKisiSec

  return (
    <div className={`gruplar ${sunum ? 'gruplar--sunum' : ''}`} data-vurgu={vurgulanan.length > 0 || undefined}>
      {gruplar.length === 0
        ? <p className="gruplar-yok">Şu an birlikte olan kimse yok.</p>
        : (
          <div className="gruplar-alan" role="list" aria-label="Şu an birlikte olanlar">
            {yerler.map((_, yi) => {
              const g = yerdeki.get(yi)
              return g
                ? <Grup key={g.anahtar} g={g} vurguSet={vurguSet} seciliId={seciliId} isimsiz={isimsiz}
                    onKisiSec={tiklanir ? onKisiSec : undefined} onGrupSec={tiklanir ? onGrupSec : undefined} />
                : <div key={`bos-${yi}`} className="grup grup--bos" aria-hidden="true" />
            })}
          </div>
        )}

      <section className="bosta" aria-label="Boşta olanlar" data-test="bosta">
        <h3 className="bosta-baslik">
          Boşta · <span className="sayi">{bosta.length}</span> kişi
          {gorunmeyen.length > 0 && <span className="bosta-gorunmeyen"> · görünmüyor <span className="sayi">{gorunmeyen.length}</span></span>}
        </h3>
        {/* Salon ekranında kimin boşta / yalnız olduğu yazılmaz: yalnız sayı. */}
        {!sunum && bosta.length > 0 && (
          <ul className="bosta-liste">
            {bosta.map((k) => {
              const yalniz = yalnizMi(k)
              return (
                <li key={k.id}>
                  <button type="button" className={`bosta-kisi ${yalniz ? 'bosta-kisi--yalniz' : ''} ${vurguSet.has(k.id) ? 'grup-uye--vurgulu' : ''}`}
                    data-test="bosta-kisi" data-id={k.id} data-yalniz={yalniz || undefined}
                    onClick={onKisiSec ? () => onKisiSec(k.id) : undefined}>
                    <span className="grup-renk" style={{ background: k.color }} aria-hidden="true" />
                    <RolSekli rol={k.role} />
                    <span className="grup-ad">{kisaAd(k)}</span>
                    {yalniz && <span className="bosta-yalniz sayi">yalnız · {sureYazisi(k.idleSinceS / 60).replace(/ \d+ sn$/, '')}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <p className="ag-not">Dairelerin yeri salondaki yeri göstermez; yalnız şu an kimlerin birlikte olduğunu gösterir.</p>
    </div>
  )
}
