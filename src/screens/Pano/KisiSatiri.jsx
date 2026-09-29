// Kişi listesi satırı: renk + rol şekli + ad (girişimcide kurum öne) +
// yıldız + durum cümlesi + toplam süre. Kimlik renk+şekil+ad ile verilir
// (asla yalnız renkle). Durum RENKLERİ 1.4'te eklenir; burada temel yapı.
import { durumCumlesi } from '../../api/durum.js'
import { sureYazisi } from '../../api/format.js'

const ROL_ADI = { investor: 'Yatırımcı', founder: 'Girişimci', guest: 'Misafir' }

export default function KisiSatiri({ kisi }) {
  return (
    <li className="kisi-satiri" data-durum={kisi.status} data-test="kisi-satiri">
      <span className="kisi-renk" style={{ background: kisi.color }} aria-hidden="true" />
      <span
        className={`kisi-rol kisi-rol--${kisi.role}`}
        title={ROL_ADI[kisi.role]}
        aria-hidden="true"
      />

      <span className="kisi-ad">
        {kisi.role === 'founder' && kisi.org ? (
          <>
            <strong>{kisi.org}</strong>
            <span className="kisi-ad-kisi"> · {kisi.name}</span>
          </>
        ) : (
          <strong>{kisi.name}</strong>
        )}
        {kisi.stars && <span className="kisi-yildiz" aria-label={`${kisi.tier} yıldız`}> {kisi.stars}</span>}
      </span>

      <span className="kisi-durum">{durumCumlesi(kisi)}</span>
      <span className="kisi-sure sayi" title="bugünkü toplam süre">{sureYazisi(kisi.min)}</span>
    </li>
  )
}
