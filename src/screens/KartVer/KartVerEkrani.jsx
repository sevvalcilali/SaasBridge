// Karşılama masası — kart atama sihirbazı (brief §6). Adımlar: 1 Kişi → 2 Kart
// → 3 Onay. Sunucuyla masaApi üzerinden konuşulur. 2.6–2.9'da kart+onay dolacak.
import { useCallback, useEffect, useRef, useState } from 'react'
import { MasaApi } from '../../api/masaApi.js'
import KisiSecAdim from './KisiSecAdim.jsx'
import KartSecAdim from './KartSecAdim.jsx'
import KontrolOnayAdim from './KontrolOnayAdim.jsx'
import './KartVerEkrani.css'

const ADIMLAR = [
  { no: 1, ad: 'Kişi' },
  { no: 2, ad: 'Kart' },
  { no: 3, ad: 'Onay' },
]

export default function KartVerEkrani() {
  const apiRef = useRef(null)
  if (apiRef.current === null) apiRef.current = new MasaApi()
  const api = apiRef.current

  const [adim, setAdim] = useState(1)
  const [seciliKisi, setSeciliKisi] = useState(null)
  const [seciliKart, setSeciliKart] = useState(null)
  const [katilimcilar, setKatilimcilar] = useState(null)
  const [sonAtama, setSonAtama] = useState(null)

  const yukle = useCallback(() => api.kisileriGetir().then(setKatilimcilar).catch(() => setKatilimcilar([])), [api])
  useEffect(() => { yukle() }, [yukle])

  // "Verildi" bildirimi birkaç saniye sonra kendiliğinden kalkar.
  useEffect(() => {
    if (!sonAtama) return
    const z = setTimeout(() => setSonAtama(null), 4000)
    return () => clearTimeout(z)
  }, [sonAtama])

  // Onay → ekran hemen sıradaki kişiye sıfırlanır (hedef <15 sn/kişi).
  function tamamla(atama) {
    setSonAtama(atama)
    setSeciliKisi(null)
    setSeciliKart(null)
    setAdim(1)
    yukle()
  }

  function kisiSec(kisi) {
    setSeciliKisi(kisi)
    setAdim(2)
  }

  function kartSec(kart) {
    setSeciliKart(kart)
    setAdim(3)
  }

  return (
    <main className="kartver">
      <header className="kartver-bas">
        <h1>Kart Ver</h1>
        <p className="kartver-alt">Karşılama masası — gelen kişiye kart verin</p>
      </header>

      {sonAtama && (
        <p className="kartver-verildi" role="status" data-test="verildi">
          ✓ {sonAtama.ad} → Kart {sonAtama.kart} verildi. Sıradaki kişi.
        </p>
      )}

      <ol className="kartver-adimlar" aria-label="Adımlar">
        {ADIMLAR.map((a) => (
          <li key={a.no} className={`kartver-adim ${adim === a.no ? 'kartver-adim--etkin' : ''} ${adim > a.no ? 'kartver-adim--bitti' : ''}`}>
            <span className="kartver-adim-no">{a.no}</span>
            <span className="kartver-adim-ad">{a.ad}</span>
          </li>
        ))}
      </ol>

      <section className="kartver-govde" data-test="kartver-govde">
        {adim === 1 && (
          <KisiSecAdim api={api} katilimcilar={katilimcilar} onYenile={yukle} onKisiSec={kisiSec} />
        )}
        {adim === 2 && (
          <div className="kartver-yer" data-test="adim-2">
            <KartSecAdim api={api} seciliKisi={seciliKisi} onKartSec={kartSec} onGeri={() => setAdim(1)} />
          </div>
        )}
        {adim === 3 && (
          <div className="kartver-yer" data-test="adim-3">
            <KontrolOnayAdim api={api} seciliKisi={seciliKisi} seciliKart={seciliKart}
              katilimcilar={katilimcilar} onTamam={tamamla} onGeri={() => setAdim(2)} />
          </div>
        )}
      </section>
    </main>
  )
}
