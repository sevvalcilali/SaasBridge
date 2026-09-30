// Kurulum / eşik ekranı (brief §4.3, §8) — teknik kişi etkinlik öncesi kullanır:
// eşik ayarı, canlı sinyal grafiği, çift tablosu, kalibrasyon, kart sağlığı.
// Veri panoyla aynı kaynaktan (usePano / SSE); dBm burada gösterilebilir, metre yok.
import { useRef, useState } from 'react'
import { usePano } from '../../api/usePano.js'
import { ciftSayisi } from '../../api/sinyal.js'
import { KurulumApi } from '../../api/kurulumApi.js'
import { useKartlar } from '../../api/useKartlar.js'
import { useSeyrek } from '../../api/useSeyrek.js'
import HataBantlari from '../../components/HataBantlari.jsx'
import EsikAyari from './EsikAyari.jsx'
import CiftTablosu from './CiftTablosu.jsx'
import SinyalGrafigi from './SinyalGrafigi.jsx'
import PerspektifSecici from './PerspektifSecici.jsx'
import KalibrasyonSihirbazi from './KalibrasyonSihirbazi.jsx'
import KartSagligi from './KartSagligi.jsx'
import './KurulumEkrani.css'

// Kalabalık (Faz 5.4): 97 kişide ~500 çift duyulur; tablo her tikte (0,5 sn) baştan çizilince
// ucuz cihazda kare düşer ve yüzlerce değişen satır zaten okunamaz → 2 sn'de bir tazelenir.
const KALABALIK_CIFT = 100
const TABLO_TAZELEME_MS = 2000

export default function KurulumEkrani() {
  const { durum, baglandi, hata, baglanti } = usePano()
  const [taslakEsik, setTaslakEsik] = useState(null) // kaydırılırken grafik anında izler
  const [perspektif, setPerspektif] = useState(null)  // seçili kişinin kart no'su ya da null
  const apiRef = useRef(null)
  if (apiRef.current === null) apiRef.current = new KurulumApi()
  const { kartlar } = useKartlar(apiRef.current)
  const kalabalik = (durum?.signals.length ?? 0) > KALABALIK_CIFT
  const tablo = useSeyrek(durum && { signals: durum.signals, people: durum.people }, TABLO_TAZELEME_MS, kalabalik)

  if (!durum) {
    return (
      <main className="kurulum kurulum--bos">
        <p className="kartver-iskele">{hata ? 'Sunucuya bağlanılamıyor, yeniden deneniyor…' : 'Veri bekleniyor…'}</p>
      </main>
    )
  }

  return (
    <main className={`kurulum ${baglandi ? '' : 'kurulum--soluk'}`}>
      <HataBantlari durum={durum} baglandi={baglandi} />
      <header className="kurulum-bas">
        <h1>Kurulum</h1>
        <p className="kurulum-alt">Teknik ekran — eşik ayarı, sinyaller ve kart sağlığı. Etkinlik öncesi kullanılır.</p>
      </header>

      <div className="kurulum-govde">
        <div className="kurulum-ana">
          <section className="kurulum-kutu" aria-labelledby="k-esik" data-test="kutu-esik">
            <h2 id="k-esik" className="kurulum-baslik">Eşik</h2>
            <EsikAyari esik={durum.threshold} signals={durum.signals} onGonder={(v) => baglanti.esikGonder(v)} onTaslak={setTaslakEsik} />
          </section>
          <section className="kurulum-kutu" aria-labelledby="k-grafik" data-test="kutu-grafik">
            <h2 id="k-grafik" className="kurulum-baslik">Canlı sinyal (son {durum.chartSeconds} sn)</h2>
            <PerspektifSecici signals={durum.signals} people={durum.people} secili={perspektif} onSec={setPerspektif} />
            <SinyalGrafigi history={durum.history} people={durum.people} esik={taslakEsik ?? durum.threshold}
              pencere={durum.chartSeconds} kisiId={perspektif} />
          </section>
          <section className="kurulum-kutu" aria-labelledby="k-ciftler" data-test="kutu-ciftler">
            <h2 id="k-ciftler" className="kurulum-baslik">Çiftler <span className="kartsec-sayi">{ciftSayisi(durum.signals, perspektif)}</span></h2>
            {kalabalik && <p className="kurulum-not" data-test="tablo-seyrek">Kalabalık: tablo {TABLO_TAZELEME_MS / 1000} sn'de bir tazelenir. Bir kişiye odaklanmak için adına tıklayın.</p>}
            <CiftTablosu signals={tablo.signals} people={tablo.people} kisiId={perspektif} onKisiSec={setPerspektif} />
          </section>
        </div>
        <div className="kurulum-yan">
          <section className="kurulum-kutu" aria-labelledby="k-kalibrasyon" data-test="kutu-kalibrasyon">
            <h2 id="k-kalibrasyon" className="kurulum-baslik">Kalibrasyon</h2>
            <KalibrasyonSihirbazi signals={durum.signals} people={durum.people} esik={durum.threshold}
              api={apiRef.current} onEsikGonder={(v) => baglanti.esikGonder(v)} />
          </section>
          <section className="kurulum-kutu" aria-labelledby="k-saglik" data-test="kutu-saglik">
            <h2 id="k-saglik" className="kurulum-baslik">Kart sağlığı</h2>
            <KartSagligi kartlar={kartlar} people={durum.people} />
          </section>
        </div>
      </div>
    </main>
  )
}
