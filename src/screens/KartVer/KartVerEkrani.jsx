// Karşılama masası — kart atama sihirbazı (brief §6). Adımlar: 1 Kişi → 2 Kart
// → 3 Onay. Sunucuyla masaApi üzerinden konuşulur. 2.6–2.9'da kart+onay dolacak.
import { useCallback, useEffect, useRef, useState } from 'react'
import { MasaApi } from '../../api/masaApi.js'
import KisiSecAdim from './KisiSecAdim.jsx'
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
  const [katilimcilar, setKatilimcilar] = useState(null)

  const yukle = useCallback(() => api.kisileriGetir().then(setKatilimcilar).catch(() => setKatilimcilar([])), [api])
  useEffect(() => { yukle() }, [yukle])

  function kisiSec(kisi) {
    setSeciliKisi(kisi)
    setAdim(2)
  }

  return (
    <main className="kartver">
      <header className="kartver-bas">
        <h1>Kart Ver</h1>
        <p className="kartver-alt">Karşılama masası — gelen kişiye kart verin</p>
      </header>

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
            <p className="kartver-secili">Seçilen kişi: <strong>{seciliKisi?.ad}</strong></p>
            <p className="kartver-iskele">Kart seçimi 2.6–2.7'de gelecek.</p>
            <button type="button" className="kartver-geri" onClick={() => setAdim(1)}>← Kişi adımına dön</button>
          </div>
        )}
      </section>
    </main>
  )
}
