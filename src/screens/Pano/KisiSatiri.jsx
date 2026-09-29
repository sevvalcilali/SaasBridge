// Kişi listesi satırı: renk + rol şekli + ad (girişimcide kurum öne) +
// yıldız + durum (ikon+renk+yazı) + toplam süre. Kimlik renk+şekil+ad ile;
// durum renk+ikon+yazı üçlüsüyle verilir (renk körlüğü — brief §10).
import { durumCumlesi, atanmamisKartMi } from '../../api/durum.js'
import { sureYazisi } from '../../api/format.js'

const ROL_ADI = { investor: 'Yatırımcı', founder: 'Girişimci', guest: 'Misafir' }
const DURUM_IKON = { talking: '●', idle: '○', away: '◌' }

export default function KisiSatiri({ kisi, onKisiAta }) {
  const atanmamis = atanmamisKartMi(kisi)

  return (
    <li
      className="kisi-satiri"
      data-durum={kisi.status}
      data-atanmamis={atanmamis || undefined}
      data-test="kisi-satiri"
    >
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

      {atanmamis ? (
        <span className="kisi-durum kisi-durum--atanmamis">
          <span className="kisi-durum-ikon" aria-hidden="true">⚠</span>
          Atanmamış kart
        </span>
      ) : (
        <span className="kisi-durum">
          <span className="kisi-durum-ikon" aria-hidden="true">{DURUM_IKON[kisi.status]}</span>
          {durumCumlesi(kisi)}
        </span>
      )}

      {atanmamis ? (
        <button type="button" className="kisi-ata-dugme" onClick={() => onKisiAta?.(kisi)}>
          Kişi ata
        </button>
      ) : (
        <span className="kisi-sure sayi" title="bugünkü toplam süre">{sureYazisi(kisi.min)}</span>
      )}
    </li>
  )
}
