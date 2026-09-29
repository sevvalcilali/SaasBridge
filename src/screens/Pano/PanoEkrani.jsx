// Organizatör canlı panosu — üst düzey ekran (PLAN Faz 1).
// Bölge iskeleti: üst şerit (1.2 hazır), gövde (sol · orta · sağ), alt şerit.
// Orta bölgeler adım adım doldurulur (1.3–1.16).
import { useEffect, useState } from 'react'
import { usePano } from '../../api/usePano.js'
import { useKalici } from '../../api/useKalici.js'
import UstSerit from './UstSerit.jsx'
import KisiListesi from './KisiListesi.jsx'
import BildirimAkisi from './BildirimAkisi.jsx'
import AltSerit from './AltSerit.jsx'
import HataBantlari from './HataBantlari.jsx'
import AgGorunumu from './AgGorunumu.jsx'
import DetayPaneli from './DetayPaneli.jsx'
import './PanoEkrani.css'

export default function PanoEkrani() {
  const { durum, baglandi, hata, baglanti } = usePano()
  // Bir bildirime tıklayınca ilgili kişiler vurgulanır (liste satırları; ağ 1.13).
  const [vurgulanan, setVurgulanan] = useState([])
  // Satıra/düğüme tıklayınca açılan detay paneli (tek panel).
  const [seciliId, setSeciliId] = useState(null)
  // Telefonda (≤600px) tek bölge gösterilir; son sekme korunur (brief §11).
  const [sekme, setSekme] = useKalici('pano.sekme', 'kisiler')

  // Parıltı 3 sn sonra kendiliğinden söner (brief §7 tıkla-vurgula, sakin).
  useEffect(() => {
    if (vurgulanan.length === 0) return
    const zaman = setTimeout(() => setVurgulanan([]), 3000)
    return () => clearTimeout(zaman)
  }, [vurgulanan])

  function kisiSec(id) {
    setSeciliId((onceki) => (onceki === id ? null : id))
  }

  function bildirimTikla(bildirim) {
    setVurgulanan((onceki) =>
      onceki.length === bildirim.people.length && onceki.every((x, i) => x === bildirim.people[i])
        ? [] // aynı bildirime tekrar tıkla → vurguyu kaldır
        : bildirim.people,
    )
  }

  const seciliKisi = durum?.people.find((k) => k.id === seciliId)

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

      <nav className="pano-sekmeler" role="tablist" aria-label="Bölüm">
        {[['kisiler', 'Kişiler'], ['ag', 'Ağ'], ['bildirimler', 'Bildirimler']].map(([deger, etiket]) => (
          <button
            key={deger}
            type="button"
            role="tab"
            aria-selected={sekme === deger}
            className={`pano-sekme ${sekme === deger ? 'pano-sekme--secili' : ''}`}
            onClick={() => setSekme(deger)}
          >
            {etiket}
          </button>
        ))}
      </nav>

      <div className="pano-govde" data-sekme={sekme}>
        <section className="pano-sol" data-bolge="sol" aria-label="Kişiler">
          <KisiListesi
            people={durum.people}
            vurgulanan={vurgulanan}
            seciliId={seciliId}
            onKisiSec={kisiSec}
            onKisiAta={() => {}}
          />
        </section>
        <section className="pano-orta" data-bolge="orta" aria-label="Ağ görünümü">
          <AgGorunumu
            people={durum.people}
            edges={durum.edges}
            live={durum.live}
            vurgulanan={vurgulanan}
            seciliId={seciliId}
            onKisiSec={kisiSec}
          />
        </section>
        <aside className="pano-sag" data-bolge="sag" aria-label="Bildirimler">
          <BildirimAkisi alerts={durum.alerts} vurgulanan={vurgulanan} onBildirimTikla={bildirimTikla} />
        </aside>
      </div>

      <footer className="pano-alt" data-bolge="alt">
        <AltSerit durum={durum} />
      </footer>

      {seciliKisi && <DetayPaneli kisi={seciliKisi} durum={durum} onKapat={() => setSeciliId(null)} />}
    </div>
  )
}
