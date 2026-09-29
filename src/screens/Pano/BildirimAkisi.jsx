// Bildirim akışı: en yeni üstte (sunucu tarafında sıralı gelir), türe göre
// ikon, severity'ye göre sol kenar rengi. Tıklayınca ilgili kişileri vurgular
// (vurgu efekti 1.8'de kişi listesi + ağda). Son 20 gösterilir, gerisi kaydırmada.
import BildirimIkon from './bildirimIkonlari.jsx'
import './BildirimAkisi.css'

const GORUNEN = 20

function ayniKisiler(a, b) {
  return a.length === b.length && a.every((x, i) => x === b[i])
}

export default function BildirimAkisi({ alerts, vurgulanan = [], onBildirimTikla }) {
  const gorunen = alerts.slice(0, GORUNEN)
  const kalan = alerts.length - gorunen.length

  return (
    <div className="bildirim-akisi">
      <h2 className="bildirim-baslik">
        Bildirimler <span className="bildirim-sayi sayi">{alerts.length}</span>
      </h2>

      {alerts.length === 0 ? (
        <p className="bildirim-bos">Henüz bildirim yok.</p>
      ) : (
        <ul className="bildirim-liste">
          {gorunen.map((b) => {
            const secili = ayniKisiler(vurgulanan, b.people)
            return (
              <li key={`${b.t}-${b.kind}`}>
                <button
                  type="button"
                  className={`bildirim bildirim--${b.severity} ${secili ? 'bildirim--secili' : ''}`}
                  onClick={() => onBildirimTikla?.(b)}
                  data-test="bildirim"
                  data-kind={b.kind}
                  data-people={b.people.join(',')}
                >
                  <span className="bildirim-ikon" aria-hidden="true"><BildirimIkon kind={b.kind} /></span>
                  <span className="bildirim-govde">
                    <span className="bildirim-ust">
                      <strong className="bildirim-title">{b.title}</strong>
                      <time className="bildirim-saat sayi">{b.clock}</time>
                    </span>
                    <span className="bildirim-detay">{b.detail}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {kalan > 0 && <p className="bildirim-kalan">+ {kalan} daha eski bildirim</p>}
    </div>
  )
}
