// Organizatör canlı panosu — üst düzey ekran (PLAN Faz 1).
// Bölge iskeleti: üst şerit (1.2 hazır), gövde (sol · orta · sağ), alt şerit.
// Orta bölgeler adım adım doldurulur (1.3–1.16).
import { usePano } from '../../api/usePano.js'
import UstSerit from './UstSerit.jsx'
import './PanoEkrani.css'

export default function PanoEkrani() {
  const { durum, baglandi, hata, baglanti } = usePano()

  if (!durum) {
    return (
      <main className="pano pano--bos">
        <p className="bilgi">
          {hata ? 'Sunucuya bağlanılamıyor, yeniden deneniyor…' : 'Veri bekleniyor…'}
        </p>
      </main>
    )
  }

  function sifirlaIste() {
    // Yıkıcı işlem: brief §5, tüm süre/geçmiş/bildirim silinir → önce onay.
    const onay = window.confirm(
      'Tüm süreler, geçmiş ve bildirimler sıfırlanacak. Emin misiniz?',
    )
    if (onay) baglanti.sifirla()
  }

  return (
    <div className={`pano ${baglandi ? '' : 'pano--soluk'}`}>
      <UstSerit durum={durum} onSifirla={sifirlaIste} />

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
