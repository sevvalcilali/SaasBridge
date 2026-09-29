// Kişi detay paneli: kişi satırına ya da ağ düğümüne tıklayınca sağda açılır.
// Ad/rol/kurum/yıldız/kart no + "kiminle ne kadar" + kart durumu. Tek panel.
import { durumCumlesi, kisiGorusmeleri, gorunenAd } from '../../api/durum.js'
import { sureYazisi, onceYazisi } from '../../api/format.js'
import './DetayPaneli.css'

const ROL_ADI = { investor: 'Yatırımcı', founder: 'Girişimci', guest: 'Misafir' }

export default function DetayPaneli({ kisi, durum, onKapat }) {
  const gorusmeler = kisiGorusmeleri(kisi.id, durum.edges, durum.people)

  return (
    <aside className="detay" role="dialog" aria-label={`${kisi.name} ayrıntısı`} data-test="detay">
        <header className="detay-bas">
          <span className="detay-renk" style={{ background: kisi.color }} aria-hidden="true" />
          <span className={`kisi-rol kisi-rol--${kisi.role}`} aria-hidden="true" />
          <div className="detay-ad-blok">
            <strong className="detay-ad">{gorunenAd(kisi)}</strong>
            <span className="detay-rol">
              {ROL_ADI[kisi.role]}{kisi.stars ? ` · ${kisi.stars}` : ''}
            </span>
          </div>
          <button type="button" className="detay-kapat" onClick={onKapat} aria-label="Kapat">✕</button>
        </header>

        <dl className="detay-bilgi">
          <div><dt>Kart no</dt><dd className="sayi">{kisi.id}</dd></div>
          <div><dt>Durum</dt><dd>{durumCumlesi(kisi)}</dd></div>
          <div><dt>Son duyulma</dt><dd>{onceYazisi(kisi.seenAgo)}</dd></div>
          <div><dt>Bugünkü toplam</dt><dd className="sayi">{sureYazisi(kisi.min)}</dd></div>
        </dl>

        <h3 className="detay-baslik">Bugün kiminle</h3>
        {gorusmeler.length === 0 ? (
          <p className="detay-bos">Henüz kimseyle görüşmedi.</p>
        ) : (
          <ul className="detay-gorusmeler" data-test="detay-gorusme-liste">
            {gorusmeler.map((g) => (
              <li key={g.kisi.id}>
                <span className="detay-g-renk" style={{ background: g.kisi.color }} aria-hidden="true" />
                <span className="detay-g-ad">{gorunenAd(g.kisi)}</span>
                <span className="detay-g-sure sayi">{sureYazisi(g.min)}</span>
              </li>
            ))}
          </ul>
        )}
    </aside>
  )
}
