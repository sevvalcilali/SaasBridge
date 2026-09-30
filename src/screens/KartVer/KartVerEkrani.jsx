// Karşılama masası — kart atama sihirbazı (brief §6). Adımlar: 1 Kişi → 2 Kart
// → 3 Onay. Ayrıca kart iadesi ve son atamayı geri alma (§6 "Yanlış atama
// düzeltme"). Boştaki kartlar şeridi ve kayıp kart uyarısı (2.13) /api/cards
// yoklamasından beslenir. Sunucuyla masaApi üzerinden konuşulur.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MasaApi } from '../../api/masaApi.js'
import { useKartlar } from '../../api/useKartlar.js'
import { rotaKart, kartVerAdresi } from '../../api/useRota.js'
import { geriAlinabilir, GERI_AL_DK, kayipKartlar } from '../../api/masaYardim.js'
import KisiSecAdim from './KisiSecAdim.jsx'
import KartSecAdim from './KartSecAdim.jsx'
import KontrolOnayAdim from './KontrolOnayAdim.jsx'
import IadePaneli from './IadePaneli.jsx'
import BostakiKartlar from './BostakiKartlar.jsx'
import { KayipUyarilari, KartKontrol } from './KayipKartlar.jsx'
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
  const [kontrol, setKontrol] = useState(null)   // "Kartı kontrol et" paneli açık kayıp
  const [pilDegisti, setPilDegisti] = useState(() => new Set()) // kart no: sinyal bekleniyor
  // Panodaki "Kişi ata"dan gelindiyse kart baştan bellidir: kişi seçilince doğrudan onaya.
  const [hedefKart, setHedefKart] = useState(() => rotaKart(window.location.hash))

  const kartlar = useKartlar(api)
  const kayiplar = useMemo(
    () => (kartlar && katilimcilar ? kayipKartlar(kartlar, katilimcilar) : []),
    [kartlar, katilimcilar],
  )
  const kayipKisiIdler = useMemo(() => new Set(kayiplar.map((k) => k.kisi.kisiId)), [kayiplar])

  // Sinyali geri gelen kartın "pil değiştirildi" işareti düşer (tekrar susarsa yeniden uyarır).
  const kayipAnahtar = kayiplar.map((k) => k.kart).join(',')
  useEffect(() => {
    const hala = new Set(kayipAnahtar ? kayipAnahtar.split(',') : [])
    setPilDegisti((onceki) => {
      const kalan = [...onceki].filter((k) => hala.has(k))
      return kalan.length === onceki.size ? onceki : new Set(kalan)
    })
  }, [kayipAnahtar])

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
      await api.iade(sonAtama.kart, { ayrildi: false }) // yanlış atama: kişi ayrılmadı, kart bekliyor
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

  function hedefKartiBirak() {
    setHedefKart(null)
    window.history.replaceState(null, '', kartVerAdresi(null))
  }

  function kisiSec(kisi) {
    setSeciliKisi(kisi)
    if (hedefKart) {
      setSeciliKart(hedefKart)
      setAdim(3)
      hedefKartiBirak()
    } else {
      setAdim(2)
    }
  }

  function kartSec(kart) {
    setSeciliKart(kart)
    setAdim(3)
  }

  function modDegistir(yeni) {
    setMod(yeni)
    setKontrol(null)
    if (hedefKart) hedefKartiBirak()
    sihirbaziSifirla()
  }

  function pilDegistirildi({ kisi, kart }) {
    setPilDegisti((onceki) => new Set(onceki).add(kart))
    setKontrol(null)
    setBilgi(`↻ Kart ${kart} (${kisi.ad}): pil değiştirildi. Sinyal gelince uyarı kendiliğinden kalkar.`)
  }

  // Kart değiştirildi → sihirbaz bu kişiyle Adım 2'den açılır (kart değişimi, 2.11).
  function kartDegistirildi({ kisi }) {
    setKontrol(null)
    setMod('ver')
    setSeciliKisi(kisi)
    setSeciliKart(null)
    setAdim(2)
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

      <KayipUyarilari kayiplar={kayiplar} pilDegisti={pilDegisti} onKontrol={setKontrol} />

      {hedefKart && mod === 'ver' && (
        <div className="kartver-verildi kartver-sonatama kartver-hedef" role="status" data-test="hedef-kart">
          <span>Kart {hedefKart} için kişi seçin — seçince doğrudan onaya geçilir.</span>
          <button type="button" className="kartver-geri kartver-geri-al" onClick={hedefKartiBirak}>Vazgeç</button>
        </div>
      )}

      {mod === 'ver' && !kontrol && (
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
        {kontrol && (
          <KartKontrol kayip={kontrol} onPilDegisti={pilDegistirildi} onKartDegisti={kartDegistirildi}
            onKapat={() => setKontrol(null)} />
        )}
        {!kontrol && mod === 'iade' && (
          <IadePaneli api={api} katilimcilar={katilimcilar} onIade={iadeAlindi} />
        )}
        {!kontrol && mod === 'ver' && adim === 1 && (
          <KisiSecAdim api={api} katilimcilar={katilimcilar} kayipKisiIdler={kayipKisiIdler} onYenile={yukle} onKisiSec={kisiSec}
            onDuzenlendi={(k) => setBilgi(`✓ ${k.ad} bilgileri güncellendi.`)} />
        )}
        {!kontrol && mod === 'ver' && adim === 2 && (
          <div className="kartver-yer" data-test="adim-2">
            <KartSecAdim api={api} seciliKisi={seciliKisi} onKartSec={kartSec} onGeri={() => setAdim(1)} />
          </div>
        )}
        {!kontrol && mod === 'ver' && adim === 3 && (
          <div className="kartver-yer" data-test="adim-3">
            <KontrolOnayAdim api={api} seciliKisi={seciliKisi} seciliKart={seciliKart}
              katilimcilar={katilimcilar} onTamam={tamamla} onGeri={() => setAdim(2)} />
          </div>
        )}
      </section>

      <BostakiKartlar kartlar={kartlar} />
    </main>
  )
}
