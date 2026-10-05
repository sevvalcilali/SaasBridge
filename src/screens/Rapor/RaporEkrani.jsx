// Etkinlik sonrası rapor (brief §4.4): kim kimle toplam kaç dakika, hangi girişimci
// kaç yatırımcıya ulaştı, en uzun görüşmeler. Yazdırılabilir / PDF'e uygun.
// Kaynak: kayıt defteri + görüşme kayıtları (ayrılanlar dahil) — /state yalnız etkinlik
// başlığı, saat ve "potansiyel anlaşma" sayısı için — görüntü alınırken TEK seferlik okunur;
// rapor sabit olduğu için canlı akış (2 Hz) dinlenmez, sayfa her tikte yeniden çizilmez.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RaporApi } from '../../api/raporApi.js'
import { raporHesapla, yatirimciMatrisi } from '../../api/rapor.js'
import { tarihSaatYazisi } from '../../api/format.js'
import { katilimcilarCsv, gorusmelerCsv, csvIndir, dosyaAdi } from '../../api/csvDisa.js'
import { Ozet, Girisimciler, EnUzun, Kisiler, Ciftler, Matris } from './RaporBolumleri.jsx'
import './RaporEkrani.css'

export default function RaporEkrani() {
  const apiRef = useRef(null)
  if (apiRef.current === null) apiRef.current = new RaporApi()
  const [veri, setVeri] = useState(null) // anlık görüntü: kayıtlar + o anki saat/geçen süre/başlık
  const [hata, setHata] = useState(null)

  // Rapor bir anlık görüntüdür (yazdırırken değişmesin): açılışta ve "Yenile" ile alınır.
  // Kayıtlarla birlikte o anki etkinlik saniyesi, saat, başlık ve anlaşma sayısı da donar;
  // yoksa süren görüşmelerin süresi canlı saatle büyümeye devam ederdi.
  const yukle = useCallback(async () => {
    setHata(null)
    try {
      const api = apiRef.current
      const [kisiler, oturumlar, d] = await Promise.all([api.kisileriGetir(), api.oturumlariGetir(), api.durumGetir()])
      setVeri({
        kisiler, oturumlar, zaman: new Date(),
        simdi: d.elapsed, saat: d.clock, etkinlik: d.event ?? {}, anlasma: d.stats?.deals ?? 0,
      })
    } catch {
      setHata('Rapor verisi alınamadı — sunucuya ulaşılamıyor.')
    }
  }, [])
  useEffect(() => { yukle() }, [yukle])
  const r = useMemo(() => veri && raporHesapla(veri.kisiler, veri.oturumlar, veri.simdi), [veri])
  const matris = useMemo(() => r && yatirimciMatrisi(r, veri.kisiler), [r, veri])

  if (!veri) {
    return <main className="rapor"><p className="rp-bos">{hata ?? 'Rapor hazırlanıyor…'}</p></main>
  }

  const { simdi, saat, etkinlik } = veri

  return (
    <main className="rapor" data-test="rapor">
      <header className="rp-bas">
        <div>
          <p className="rp-ust">Etkinlik raporu</p>
          <h1>{etkinlik.name ?? 'Etkinlik'}</h1>
          <p className="rp-alt">{[etkinlik.date, `Hazırlanma: ${tarihSaatYazisi(veri.zaman)}`].filter(Boolean).join(' · ')}</p>
        </div>
        <div className="rp-araclar" data-test="rapor-araclar">
          <button type="button" className="kisisec-ekle" onClick={() => window.print()} data-test="rapor-yazdir">Yazdır / PDF</button>
          <button type="button" className="kartver-geri" data-test="csv-katilimcilar"
            onClick={() => csvIndir(dosyaAdi('katilimcilar', veri.zaman), katilimcilarCsv(r))}>⇩ Katılımcılar (CSV)</button>
          <button type="button" className="kartver-geri" data-test="csv-gorusmeler"
            onClick={() => csvIndir(dosyaAdi('gorusmeler', veri.zaman), gorusmelerCsv(veri.oturumlar, veri.kisiler, simdi, saat))}>⇩ Görüşmeler (CSV)</button>
          <button type="button" className="kartver-geri" onClick={yukle} data-test="rapor-yenile">Yenile</button>
        </div>
      </header>
      {hata && <p className="kartsec-uyari" role="alert">{hata}</p>}

      <Ozet ozet={r.ozet} anlasma={veri.anlasma} />

      <section className="rp-bolum">
        <h2>Girişimciler ve ulaştıkları yatırımcılar</h2>
        <Girisimciler girisimciler={r.girisimciler} />
      </section>
      <section className="rp-bolum">
        <h2>Yatırımcı × girişimci (dakika)</h2>
        <p className="rp-aciklama">Gün boyu kim kiminle ne kadar: koyu hücre = uzun görüşme. Boş satır, hiçbir girişimciyle görüşmemiş yatırımcı.</p>
        <Matris m={matris} />
      </section>
      <section className="rp-bolum">
        <h2>En uzun görüşmeler</h2>
        <EnUzun enUzun={r.enUzun} saat={saat} simdi={simdi} />
      </section>
      <section className="rp-bolum">
        <h2>Katılımcılar <span className="rp-sayi">{r.kisiSatirlari.length}</span></h2>
        <p className="rp-aciklama">Kartını iade edip ayrılanlar da dahil; süreleri silinmez.</p>
        <Kisiler satirlar={r.kisiSatirlari} />
      </section>
      <section className="rp-bolum">
        <h2>Kim kimle ne kadar <span className="rp-sayi">{r.ciftler.length}</span></h2>
        <Ciftler ciftler={r.ciftler} />
      </section>
      <p className="rp-dipnot">Süreler kartların birbirini duymasına göre ölçülür; görüşmeler ~5 sn geç başlar, ~15 sn geç biter. Konum ve mesafe ölçülmez.</p>
    </main>
  )
}
