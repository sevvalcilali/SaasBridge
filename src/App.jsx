// Faz 0 kanıt ekranı: canlı verinin aktığını ve tema token'larının
// çalıştığını gösterir. Faz 1'de yerini Pano ekranı alacak.
import { usePano } from './api/usePano.js'
import { sureYazisi, onceYazisi } from './api/format.js'
import './App.css'

const ROL_ADI = { investor: 'Yatırımcı', founder: 'Girişimci', guest: 'Misafir' }

function DurumEtiketi({ kisi }) {
  if (kisi.status === 'talking') {
    return (
      <span className="etiket etiket--birlikte">
        <span aria-hidden="true">●</span> {kisi.withName} ile · {sureYazisi(kisi.live)}
      </span>
    )
  }
  if (kisi.status === 'away') {
    return (
      <span className="etiket etiket--pasif">
        <span aria-hidden="true">◌</span> görünmüyor · {onceYazisi(kisi.seenAgo)}
      </span>
    )
  }
  return <span className="etiket etiket--bosta"><span aria-hidden="true">○</span> boşta</span>
}

export default function App() {
  const { durum, baglandi, hata } = usePano()

  if (!durum) {
    return (
      <main className="sayfa">
        <p className="bilgi">
          {hata ? 'Sunucuya bağlanılamıyor, yeniden deneniyor…' : 'Veri bekleniyor…'}
        </p>
      </main>
    )
  }

  const aliciYok = durum.receiverAge === null || durum.receiverAge > 5

  return (
    <main className={`sayfa ${baglandi ? '' : 'sayfa--soluk'}`}>
      {!baglandi && (
        <p className="bant bant--ciddi" role="status">
          <span aria-hidden="true">⚠</span> Sunucuya bağlanılamıyor, yeniden deneniyor… (son veri gösteriliyor)
        </p>
      )}
      {aliciYok && (
        <p className="bant bant--ciddi" role="status">
          <span aria-hidden="true">⚠</span> ALICI BAĞLI DEĞİL — veri güncellenmiyor
        </p>
      )}

      <header className="ust">
        <div>
          <h1>{durum.event.name}</h1>
          <p className="alt">{durum.event.sub} · {durum.event.date}</p>
        </div>
        <div className="ust-sag">
          <span className="saat sayi">{durum.clock}</span>
          <span className="esik sayi">Eşik {durum.threshold} dBm</span>
        </div>
      </header>

      <section className="ozet">
        <div className="kutu"><span className="kutu-deger sayi">{durum.stats.livePairs}</span><span className="kutu-ad">şu an birlikte</span></div>
        <div className="kutu"><span className="kutu-deger sayi">{durum.stats.done}</span><span className="kutu-ad">biten görüşme</span></div>
        <div className="kutu"><span className="kutu-deger sayi">{sureYazisi(durum.stats.mixedMin)}</span><span className="kutu-ad">karma görüşme</span></div>
        <div className="kutu"><span className="kutu-deger sayi">{durum.stats.deals}</span><span className="kutu-ad">potansiyel anlaşma</span></div>
        <div className="kutu"><span className="kutu-deger sayi">{durum.stats.reached}/{durum.stats.founders}</span><span className="kutu-ad">yatırımcıya ulaşan girişimci</span></div>
      </section>

      <div className="sutunlar">
        <section>
          <h2>Kişiler <span className="sayac sayi">{durum.people.length}</span></h2>
          <ul className="liste">
            {durum.people.map((kisi) => (
              <li key={kisi.id} className="satir">
                <span className="renk" style={{ background: kisi.color }} aria-hidden="true" />
                <span className={`rol rol--${kisi.role}`} title={ROL_ADI[kisi.role]} aria-hidden="true" />
                <span className="ad">
                  {kisi.role === 'founder' && kisi.org ? `${kisi.org} · ${kisi.name}` : kisi.name}
                  {kisi.stars && <span className="yildiz"> {kisi.stars}</span>}
                </span>
                <DurumEtiketi kisi={kisi} />
                <span className="sure sayi">{sureYazisi(kisi.min)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Bildirimler <span className="sayac sayi">{durum.alerts.length}</span></h2>
          <ul className="liste">
            {durum.alerts.slice(0, 12).map((bildirim) => (
              <li key={`${bildirim.t}-${bildirim.kind}`} className={`bildirim bildirim--${bildirim.severity}`}>
                <span className="bildirim-saat sayi">{bildirim.clock}</span>
                <span>
                  <strong>{bildirim.title}</strong>
                  <span className="bildirim-detay">{bildirim.detail}</span>
                </span>
              </li>
            ))}
            {durum.alerts.length === 0 && <li className="bilgi">Henüz bildirim yok.</li>}
          </ul>
        </section>
      </div>

      <footer className="dip">
        Etkinlik süresi {sureYazisi(durum.elapsed / 60)} · alıcı {onceYazisi(durum.receiverAge)} ·
        {' '}{durum.signals.length} çift ölçülüyor · Faz 0 kanıt ekranı
      </footer>
    </main>
  )
}
