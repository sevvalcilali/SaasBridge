// Organizatör canlı panosu — üst düzey ekran (PLAN Faz 1).
// Bölge iskeleti: üst şerit, gövde (sol kişi listesi · orta ağ · sağ bildirim),
// alt şerit. İçerikler adım adım doldurulur (1.2–1.16); bu adım (1.1) yalnız
// bölge düzenini ve responsive davranışı kurar.
import { usePano } from '../../api/usePano.js'
import './PanoEkrani.css'

export default function PanoEkrani() {
  const { durum, baglandi, hata } = usePano()

  if (!durum) {
    return (
      <main className="pano pano--bos">
        <p className="bilgi">
          {hata ? 'Sunucuya bağlanılamıyor, yeniden deneniyor…' : 'Veri bekleniyor…'}
        </p>
      </main>
    )
  }

  return (
    <div className={`pano ${baglandi ? '' : 'pano--soluk'}`}>
      <header className="pano-ust" data-bolge="ust">
        <span className="iskele-etiket">Üst şerit</span>
        <span className="canli-rozet" aria-hidden="true">● canlı · {durum.people.length} kişi</span>
      </header>

      <div className="pano-govde">
        <section className="pano-sol" data-bolge="sol" aria-label="Kişiler">
          <span className="iskele-etiket">Kişi listesi</span>
        </section>
        <section className="pano-orta" data-bolge="orta" aria-label="Ağ görünümü">
          <span className="iskele-etiket">Ağ görünümü</span>
        </section>
        <aside className="pano-sag" data-bolge="sag" aria-label="Bildirimler">
          <span className="iskele-etiket">Bildirimler</span>
        </aside>
      </div>

      <footer className="pano-alt" data-bolge="alt">
        <span className="iskele-etiket">Alt şerit · özet</span>
      </footer>
    </div>
  )
}
