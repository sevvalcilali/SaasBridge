// Kart sağlığı tablosu (brief §8): her kart için en son duyulma, pil, "sorunlu"
// etiketi, atanmışsa kişi. Sorunlular üstte. Sorun renk + ikon + yazı ile verilir.
import { kartSagligi, sorunluSayisi, DUSUK_PIL } from '../../api/kartSagligi.js'
import { onceYazisi } from '../../api/format.js'
import KisiRozeti from '../../components/KisiRozeti.jsx'

export default function KartSagligi({ kartlar, people }) {
  if (!kartlar) return <p className="kartver-iskele">Kartlar okunuyor…</p>
  const satirlar = kartSagligi(kartlar, people)
  const sorunlu = sorunluSayisi(satirlar)
  return (
    <div className="saglik" data-test="kart-sagligi">
      <p className="saglik-ozet" data-test="saglik-ozet">
        <strong className="sayi">{satirlar.length}</strong> kart duyuluyor ·{' '}
        {sorunlu ? <strong className="saglik-ozet--sorun">⚠ {sorunlu} sorunlu</strong> : 'sorun yok'}
      </p>
      <div className="saglik-kaydir">
        <table className="cift-tablo saglik-tablo">
          <thead>
            <tr>
              <th scope="col">Kart</th>
              <th scope="col">Durum</th>
              <th scope="col">Kişi</th>
              <th scope="col" className="sag">Duyulma</th>
              <th scope="col" className="sag">Pil</th>
            </tr>
          </thead>
          <tbody>
            {satirlar.map((r) => (
              <tr key={r.kart} data-test="saglik-satir" data-kart={r.kart} data-sorunlu={r.sorunlar.length > 0 || undefined}
                className={r.sorunlar.length ? 'saglik-satir--sorun' : ''}>
                <td className="sayi saglik-kart">{r.kart}</td>
                <td>
                  {r.sorunlar.length === 0
                    ? <span className="saglik-iyi">✓ iyi</span>
                    : r.sorunlar.map((s) => <span key={s.tur} className={`saglik-sorun saglik-sorun--${s.tur}`}>{s.ikon} {s.etiket}</span>)}
                </td>
                <td className="saglik-kisi">
                  {r.kisi ? <KisiRozeti kisi={r.kisi} kartNo={false} /> : <span className="saglik-bos">{r.atanmis ? 'atanmış' : 'boşta'}</span>}
                </td>
                <td className="sag saglik-zaman">{onceYazisi(r.seenAgo)}</td>
                <td className={`sag sayi ${r.pil < DUSUK_PIL ? 'saglik-pil--dusuk' : ''}`}>%{r.pil}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
