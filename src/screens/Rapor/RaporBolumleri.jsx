// Rapor sayfasının bölümleri (brief §4.4). Yalnız görüntüler; hesaplar api/rapor.js'te.
import { raporAdi, kisiDurumYazisi, etkinlikSaati } from '../../api/rapor.js'
import { sureYazisi } from '../../api/format.js'

const ROL = { investor: 'Yatırımcı', founder: 'Girişimci', guest: 'Misafir' }
const dk = (sn) => sureYazisi(sn / 60)

function Ad({ kisi }) {
  return (
    <span className="rp-ad">
      <span className="rp-renk" style={kisi.renk ? { background: kisi.renk } : undefined} aria-hidden="true" />
      {raporAdi(kisi)}
    </span>
  )
}

export function Ozet({ ozet, anlasma }) {
  const kutu = [
    ['Görüşme', `${ozet.gorusme}`, ozet.suren ? `${ozet.suren} tanesi sürüyor` : null],
    ['Yatırımcı–girişimci toplam', dk(ozet.karmaSn), null],
    ['Yatırımcıya ulaşan girişimci', `${ozet.ulasan}/${ozet.girisimci}`, null],
    ['Potansiyel anlaşma', `${anlasma}`, null],
    ['Katılımcı', `${ozet.kisi}`, ozet.ayrilan ? `${ozet.ayrilan} kişi ayrıldı` : null],
  ]
  return (
    <dl className="rp-ozet" data-test="rapor-ozet">
      {kutu.map(([ad, deger, not]) => (
        <div key={ad}><dt>{ad}</dt><dd className="sayi">{deger}</dd>{not && <p className="rp-not">{not}</p>}</div>
      ))}
    </dl>
  )
}

export function Girisimciler({ girisimciler }) {
  return (
    <table className="rp-tablo" data-test="rapor-girisimciler">
      <thead><tr><th>Girişimci</th><th className="sag">Yatırımcı</th><th>Görüştüğü yatırımcılar</th><th className="sag">Toplam</th></tr></thead>
      <tbody>
        {girisimciler.map((g) => (
          <tr key={g.kisi.kisiId} className={g.yatirimcilar.length ? '' : 'rp-uyari-satir'} data-test="rapor-girisimci">
            <td><Ad kisi={g.kisi} /></td>
            <td className="sag sayi">{g.yatirimcilar.length}</td>
            <td>
              {g.yatirimcilar.length === 0
                ? <strong className="rp-uyari">⚠ Hiç yatırımcıyla görüşmedi</strong>
                : g.yatirimcilar.map((y) => `${raporAdi(y.kisi)} (${dk(y.toplamSn)})`).join(', ')}
            </td>
            <td className="sag sayi">{g.yatirimciSn ? dk(g.yatirimciSn) : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function EnUzun({ enUzun, saat, simdi }) {
  if (!enUzun.length) return <p className="rp-bos">Henüz görüşme yok.</p>
  return (
    <table className="rp-tablo" data-test="rapor-en-uzun">
      <thead><tr><th className="sag">#</th><th>Kim</th><th>Kiminle</th><th className="sag">Başlangıç</th><th className="sag">Süre</th></tr></thead>
      <tbody>
        {enUzun.map((o, i) => (
          <tr key={i}>
            <td className="sag sayi">{i + 1}</td>
            <td><Ad kisi={o.a} /></td>
            <td><Ad kisi={o.b} /></td>
            <td className="sag sayi">{etkinlikSaati(o.start, saat, simdi)}</td>
            <td className="sag sayi">{dk(o.sureSn)}{o.suruyor ? ' · sürüyor' : ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function Kisiler({ satirlar }) {
  return (
    <table className="rp-tablo" data-test="rapor-kisiler">
      <thead>
        <tr><th>Kişi</th><th>Rol</th><th className="sag">Toplam</th><th className="sag">Görüşme</th>
          <th className="sag">Kişi</th><th className="sag" title="Yatırımcı için girişimci, girişimci için yatırımcı">Karşı rol</th><th>Kart</th></tr>
      </thead>
      <tbody>
        {satirlar.map((r) => (
          <tr key={r.kisi.kisiId} data-test="rapor-kisi" data-kisi={r.kisi.kisiId}>
            <td><Ad kisi={r.kisi} /></td>
            <td>{ROL[r.kisi.rol] ?? '—'}{r.kisi.yildiz ? ` ${'★'.repeat(r.kisi.yildiz)}` : ''}</td>
            <td className="sag sayi">{r.toplamSn ? dk(r.toplamSn) : '—'}</td>
            <td className="sag sayi">{r.gorusmeSayisi}</td>
            <td className="sag sayi">{r.kisiSayisi}</td>
            <td className="sag sayi">{r.kisi.rol === 'investor' || r.kisi.rol === 'founder' ? r.karsiRolSayisi : '—'}</td>
            <td className={r.kisi.ayrildi && !r.kisi.atananKart ? 'rp-soluk' : ''}>{r.kisi.rol ? kisiDurumYazisi(r.kisi) : 'kayıtsız'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function Ciftler({ ciftler }) {
  if (!ciftler.length) return <p className="rp-bos">Henüz görüşme yok.</p>
  return (
    <table className="rp-tablo" data-test="rapor-ciftler">
      <thead><tr><th>Kişi</th><th>Kişi</th><th className="sag">Toplam</th><th className="sag">Görüşme</th></tr></thead>
      <tbody>
        {ciftler.map((c) => (
          <tr key={`${c.a.kisiId}|${c.b.kisiId}`}>
            <td><Ad kisi={c.a} /></td><td><Ad kisi={c.b} /></td>
            <td className="sag sayi">{dk(c.toplamSn)}</td><td className="sag sayi">{c.adet}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
