// Kurulum / eşik ekranı (brief §4.3, §8) — teknik kişi etkinlik öncesi kullanır:
// eşik ayarı, canlı sinyal grafiği, çift tablosu, kalibrasyon, kart sağlığı.
// Veri panoyla aynı kaynaktan (usePano / SSE); dBm burada gösterilebilir, metre yok.
import { usePano } from '../../api/usePano.js'
import HataBantlari from '../../components/HataBantlari.jsx'
import EsikAyari from './EsikAyari.jsx'
import './KurulumEkrani.css'

export default function KurulumEkrani() {
  const { durum, baglandi, hata, baglanti } = usePano()

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
            <EsikAyari esik={durum.threshold} signals={durum.signals} onGonder={(v) => baglanti.esikGonder(v)} />
          </section>
          <section className="kurulum-kutu" aria-labelledby="k-grafik" data-test="kutu-grafik">
            <h2 id="k-grafik" className="kurulum-baslik">Canlı sinyal (son {durum.chartSeconds} sn)</h2>
          </section>
          <section className="kurulum-kutu" aria-labelledby="k-ciftler" data-test="kutu-ciftler">
            <h2 id="k-ciftler" className="kurulum-baslik">Çiftler</h2>
          </section>
        </div>
        <div className="kurulum-yan">
          <section className="kurulum-kutu" aria-labelledby="k-kalibrasyon" data-test="kutu-kalibrasyon">
            <h2 id="k-kalibrasyon" className="kurulum-baslik">Kalibrasyon</h2>
          </section>
          <section className="kurulum-kutu" aria-labelledby="k-saglik" data-test="kutu-saglik">
            <h2 id="k-saglik" className="kurulum-baslik">Kart sağlığı</h2>
          </section>
        </div>
      </div>
    </main>
  )
}
