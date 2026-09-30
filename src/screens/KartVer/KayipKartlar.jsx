// Kayıp kart (brief §6.3): kişinin kartı 60 sn'dir duyulmuyor → "Kartı kontrol et".
// Görevli kişiyi bulunca "Pil değiştirildi" ya da "Kart değiştirildi" seçer.
// `KayipUyarilari` üstteki uyarı şeridi, `KartKontrol` seçilen kişinin paneli.
import { onceYazisi } from '../../api/format.js'

export function KayipUyarilari({ kayiplar, pilDegisti, onKontrol }) {
  if (!kayiplar.length) return null
  return (
    <ul className="kayip-liste" aria-label="Kartı kontrol edilecek kişiler" data-test="kayip-uyarilari">
      {kayiplar.map((k) => (
        pilDegisti.has(k.kart) ? (
          <li key={k.kart} className="kayip kayip--bekleniyor" role="status">
            <span>↻ <strong>{k.kisi.ad}</strong> · Kart {k.kart}: pil değiştirildi, sinyal bekleniyor.</span>
          </li>
        ) : (
          <li key={k.kart} className="kayip" role="alert" data-test="kayip-uyari">
            <span>⚠ <strong>Kartı kontrol et:</strong> {k.kisi.ad} · Kart {k.kart} · son duyulma {onceYazisi(k.seenAgo)}</span>
            <button type="button" className="kartver-geri kayip-dugme" data-test="kayip-kontrol" onClick={() => onKontrol(k)}>
              Kontrol et
            </button>
          </li>
        )
      ))}
    </ul>
  )
}

export function KartKontrol({ kayip, onPilDegisti, onKartDegisti, onKapat }) {
  const { kisi, kart, seenAgo } = kayip
  return (
    <div className="kontrol" data-test="kart-kontrol">
      <h2 className="kontrol-baslik">Kartı kontrol et</h2>
      <div className="onay-kart" style={{ '--kisi-renk': kisi.renk }}>
        <span className="onay-renk" aria-hidden="true" />
        <span className="onay-metin"><strong>{kisi.ad}</strong> · <strong>Kart {kart}</strong></span>
      </div>
      <p className="kontrol-not">
        Kart {onceYazisi(seenAgo)} duyuldu. Kişiyi bulun, kartına bakın: pili mi bitti, kart mı bozuk?
      </p>
      <div className="kayip-secenek">
        <button type="button" className="kisisec-yeni" data-test="pil-degisti" onClick={() => onPilDegisti(kayip)}>
          Pil değiştirildi
          <span className="kayip-aciklama">Aynı kart; sinyal gelince uyarı kalkar.</span>
        </button>
        <button type="button" className="kisisec-yeni" data-test="kart-degisti" onClick={() => onKartDegisti(kayip)}>
          Kart değiştirildi
          <span className="kayip-aciklama">Yeni kart verilir; süreler kişide birleşir.</span>
        </button>
      </div>
      <div className="kisisec-form-dugmeler">
        <button type="button" className="kartver-geri" onClick={onKapat}>Vazgeç</button>
      </div>
    </div>
  )
}
