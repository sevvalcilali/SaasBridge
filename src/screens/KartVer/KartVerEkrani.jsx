// Karşılama masası — kart atama sihirbazı (brief §6). Adımlar: 1 Kişi → 2 Kart
// → 3 Onay. Ayrıca kart iadesi ve son atamayı geri alma (§6 "Yanlış atama
// düzeltme"). Sunucuyla masaApi üzerinden konuşulur.
import { useCallback, useEffect, useRef, useState } from 'react'
import { MasaApi } from '../../api/masaApi.js'
import { geriAlinabilir, GERI_AL_DK } from '../../api/masaYardim.js'
import KisiSecAdim from './KisiSecAdim.jsx'
import KartSecAdim from './KartSecAdim.jsx'
import KontrolOnayAdim from './KontrolOnayAdim.jsx'
import IadePaneli from './IadePaneli.jsx'
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

  const [mod, setMod] = useState('ver') // 'ver' | 'iade'
  const [adim, setAdim] = useState(1)
  const [seciliKisi, setSeciliKisi] = useState(null)
  const [seciliKart, setSeciliKart] = useState(null)
  const [katilimcilar, setKatilimcilar] = useState(null)
  const [sonAtama, setSonAtama] = useState(null) // { ad, kart, zaman } — geri alınabilir
  const [geriAliniyor, setGeriAliniyor] = useState(false)
  const [bilgi, setBilgi] = useState(null)       // kısa sonuç mesajı (iade / geri al)

  const yukle = useCallback(() => api.kisileriGetir().then(setKatilimcilar).catch(() => setKatilimcilar([])), [api])
  useEffect(() => { yukle() }, [yukle])

  // Son atama brief §6 gereği "birkaç dakika" geri alınabilir; süre dolunca şerit kalkar.
  useEffect(() => {
    if (!sonAtama) return
    const z = setTimeout(() => setSonAtama(null), GERI_AL_DK * 60_000)
    return () => clearTimeout(z)
  }, [sonAtama])

  useEffect(() => {
    if (!bilgi) return
    const z = setTimeout(() => setBilgi(null), 4000)
    return () => clearTimeout(z)
  }, [bilgi])

  function sihirbaziSifirla() {
    setSeciliKisi(null)
    setSeciliKart(null)
    setAdim(1)
  }

  // Onay → ekran hemen sıradaki kişiye sıfırlanır (hedef <15 sn/kişi).
  function tamamla(atama) {
    setSonAtama({ ...atama, zaman: Date.now() })
    setBilgi(null)
    sihirbaziSifirla()
    yukle()
  }

  async function geriAl() {
    // Sekme arka plandayken zamanlayıcı gecikebilir; pencere tıklamada da denetlenir.
    if (!geriAlinabilir(sonAtama) || geriAliniyor) { setSonAtama(null); return }
    setGeriAliniyor(true)
    try {
      await api.iade(sonAtama.kart)
      // Kart değişiminde eski kart geri verilmez (bırakılmıştı); kişi kartsız kalır.
      const ek = sonAtama.eskiKart ? ` ${sonAtama.ad} şu an kartsız.` : ''
      setBilgi(`↶ Geri alındı: ${sonAtama.ad} → Kart ${sonAtama.kart} ataması kaldırıldı, kart boşta.${ek}`)
      setSonAtama(null)
      yukle()
    } catch {
      setBilgi('Geri alınamadı — sunucuya ulaşılamıyor. Tekrar deneyin.')
    } finally {
      setGeriAliniyor(false)
    }
  }

  function iadeAlindi({ ad, kart }) {
    setBilgi(`✓ Kart ${kart} iade alındı. ${ad} panodan düştü; süreleri raporda kalır.`)
    // İade edilen kart son atamaysa artık geri alınacak bir şey yok.
    setSonAtama((s) => (s && s.kart === kart ? null : s))
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

  function modDegistir(yeni) {
    setMod(yeni)
    sihirbaziSifirla()
  }

  return (
    <main className="kartver">
      <header className="kartver-bas">
        <h1>{mod === 'ver' ? 'Kart Ver' : 'Kart İadesi'}</h1>
        <p className="kartver-alt">
          {mod === 'ver' ? 'Karşılama masası — gelen kişiye kart verin' : 'Ayrılan kişiden kartı geri alın'}
        </p>
      </header>

      <div className="kartsec-mod kartver-mod" role="group" aria-label="İşlem">
        <button type="button" className={`kartsec-mod-dugme ${mod === 'ver' ? 'kartsec-mod-dugme--secili' : ''}`}
          aria-pressed={mod === 'ver'} onClick={() => modDegistir('ver')} data-test="mod-ver">
          Kart ver
        </button>
        <button type="button" className={`kartsec-mod-dugme ${mod === 'iade' ? 'kartsec-mod-dugme--secili' : ''}`}
          aria-pressed={mod === 'iade'} onClick={() => modDegistir('iade')} data-test="mod-iade">
          Kart iadesi
        </button>
      </div>

      {sonAtama && (
        <div className="kartver-verildi kartver-sonatama" role="status" data-test="verildi">
          <span>
            ✓ {sonAtama.ad} → Kart {sonAtama.kart} verildi{sonAtama.eskiKart ? ` (Kart ${sonAtama.eskiKart} yerine)` : ''}.
          </span>
          <button type="button" className="kartver-geri kartver-geri-al" data-test="geri-al"
            disabled={geriAliniyor} onClick={geriAl}>
            {geriAliniyor ? 'Geri alınıyor…' : '↶ Geri al'}
          </button>
        </div>
      )}

      {bilgi && <p className="kartver-bilgi" role="status" data-test="bilgi">{bilgi}</p>}

      {mod === 'ver' && (
        <ol className="kartver-adimlar" aria-label="Adımlar">
          {ADIMLAR.map((a) => (
            <li key={a.no} className={`kartver-adim ${adim === a.no ? 'kartver-adim--etkin' : ''} ${adim > a.no ? 'kartver-adim--bitti' : ''}`}>
              <span className="kartver-adim-no">{a.no}</span>
              <span className="kartver-adim-ad">{a.ad}</span>
            </li>
          ))}
        </ol>
      )}

      <section className="kartver-govde" data-test="kartver-govde">
        {mod === 'iade' && (
          <IadePaneli api={api} katilimcilar={katilimcilar} onIade={iadeAlindi} />
        )}
        {mod === 'ver' && adim === 1 && (
          <KisiSecAdim api={api} katilimcilar={katilimcilar} onYenile={yukle} onKisiSec={kisiSec}
            onDuzenlendi={(k) => setBilgi(`✓ ${k.ad} bilgileri güncellendi.`)} />
        )}
        {mod === 'ver' && adim === 2 && (
          <div className="kartver-yer" data-test="adim-2">
            <KartSecAdim api={api} seciliKisi={seciliKisi} onKartSec={kartSec} onGeri={() => setAdim(1)} />
          </div>
        )}
        {mod === 'ver' && adim === 3 && (
          <div className="kartver-yer" data-test="adim-3">
            <KontrolOnayAdim api={api} seciliKisi={seciliKisi} seciliKart={seciliKart}
              katilimcilar={katilimcilar} onTamam={tamamla} onGeri={() => setAdim(2)} />
          </div>
        )}
      </section>
    </main>
  )
}
