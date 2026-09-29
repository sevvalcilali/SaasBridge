// Organizatör canlı panosu — üst düzey ekran (PLAN Faz 1).
// Bölge iskeleti: üst şerit (1.2 hazır), gövde (sol · orta · sağ), alt şerit.
// Orta bölgeler adım adım doldurulur (1.3–1.16).
import { useEffect, useState } from 'react'
import { usePano } from '../../api/usePano.js'
import UstSerit from './UstSerit.jsx'
import KisiListesi from './KisiListesi.jsx'
import BildirimAkisi from './BildirimAkisi.jsx'
import AltSerit from './AltSerit.jsx'
import HataBantlari from './HataBantlari.jsx'
import AgGorunumu from './AgGorunumu.jsx'
import './PanoEkrani.css'

export default function PanoEkrani() {
  const { durum, baglandi, hata, baglanti } = usePano()
  // Bir bildirime tıklayınca ilgili kişiler vurgulanır (liste satırları; ağ 1.13).
  const [vurgulanan, setVurgulanan] = useState([])

  // Parıltı 3 sn sonra kendiliğinden söner (brief §7 tıkla-vurgula, sakin).
  useEffect(() => {
    if (vurgulanan.length === 0) return
    const zaman = setTimeout(() => setVurgulanan([]), 3000)
    return () => clearTimeout(zaman)
  }, [vurgulanan])

  function bildirimTikla(bildirim) {
    setVurgulanan((onceki) =>
      onceki.length === bildirim.people.length && onceki.every((x, i) => x === bildirim.people[i])
        ? [] // aynı bildirime tekrar tıkla → vurguyu kaldır
        : bildirim.people,
    )
  }

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
      <HataBantlari durum={durum} baglandi={baglandi} />
      <UstSerit durum={durum} onSifirla={sifirlaIste} />

      <div className="pano-govde">
        <section className="pano-sol" data-bolge="sol" aria-label="Kişiler">
          <KisiListesi people={durum.people} vurgulanan={vurgulanan} onKisiAta={() => {}} />
        </section>
        <section className="pano-orta" data-bolge="orta" aria-label="Ağ görünümü">
          <AgGorunumu people={durum.people} />
        </section>
        <aside className="pano-sag" data-bolge="sag" aria-label="Bildirimler">
          <BildirimAkisi alerts={durum.alerts} vurgulanan={vurgulanan} onBildirimTikla={bildirimTikla} />
        </aside>
      </div>

      <footer className="pano-alt" data-bolge="alt">
        <AltSerit durum={durum} />
      </footer>
    </div>
  )
}
