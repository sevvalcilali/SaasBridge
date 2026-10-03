// Canlı sinyal grafiği (brief §8): son 90 sn, her çift bir çizgi (iki kişinin
// renkleri, dönüşümlü), eşik yatay kesikli çizgi, eşik üstü bölge NÖTR tonda
// (yeşil değil — eşik üstü ≠ birlikte; Şevval kararı), çizgi sonunda "3 · 4"
// etiketi, üzerine gelince değerler. Eksen sabit: veri gelince oynamaz.
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  grafikSerileri, olcekX, olcekY, xdenSaniye, etiketleriAyir, anlikDegerler, ciftEtiketi,
  Y_ALT, Y_UST, VARSAYILAN_CIFT,
} from '../../api/grafik.js'
import { dbmYazisi } from '../../api/sinyal.js'

// Grafik kabın gerçek piksel genişliğinde çizilir (ölçeklenmez): yazılar her ekranda
// gerçek boyutunda kalır. Kenar boşlukları px; sağda çizgi sonu etiketleri.
const SOL = 40, SAG = 86, UST = 10, ALT = 26
const IZGARA = [-90, -80, -70, -60, -50, -40]
const NOTR = 'var(--metin-soluk)'

export default function SinyalGrafigi({ history, people, esik, pencere, kisiId = null }) {
  const [hepsi, setHepsi] = useState(false)
  const [imlec, setImlec] = useState(null) // saniyeÖnce
  const [genislik, setGenislik] = useState(900)
  const kapRef = useRef(null)
  useEffect(() => {
    const ro = new ResizeObserver(([g]) => setGenislik(Math.round(g.contentRect.width)))
    ro.observe(kapRef.current)
    return () => ro.disconnect()
  }, [])
  const G = Math.max(160, genislik - SOL - SAG)
  const Y = genislik < 640 ? 200 : 280

  const { seriler, toplam } = useMemo(
    () => grafikSerileri(history, people, { hepsi, kisiId }),
    [history, people, hepsi, kisiId],
  )

  const x = (sn) => SOL + olcekX(sn, G, pencere)
  const y = (v) => UST + olcekY(v, Y)
  const yol = (s) => s.noktalar.map(([sn, v], i) => `${i ? 'L' : 'M'}${x(sn).toFixed(1)},${y(v).toFixed(1)}`).join('')
  const etiketY = etiketleriAyir(seriler.map((s) => y(s.son)), 16, UST + 6, UST + Y - 2)
  const anlik = imlec === null ? [] : anlikDegerler(seriler, imlec)

  function hareket(e) {
    const vx = e.clientX - e.currentTarget.getBoundingClientRect().left - SOL
    setImlec(vx < 0 || vx > G ? null : xdenSaniye(vx, G, pencere))
  }

  return (
    <div className="grafik" ref={kapRef} data-test="sinyal-grafigi">
      {toplam === 0 ? (
        <p className="kartver-iskele">{kisiId ? 'Bu kişinin şu an duyulan çifti yok.' : 'Henüz sinyal yok.'}</p>
      ) : (<>
      <div className="grafik-ust">
        <p className="grafik-ozet">
          {toplam > seriler.length
            ? <>En güçlü <strong>{seriler.length}</strong> çift gösteriliyor ({toplam} çift duyuluyor).</>
            : <><strong>{toplam}</strong> çift gösteriliyor.</>}
        </p>
        {toplam > VARSAYILAN_CIFT && (
          <button type="button" className="kartver-geri grafik-dugme" aria-pressed={hepsi}
            onClick={() => setHepsi((h) => !h)} data-test="grafik-hepsi">
            {hepsi ? `Yalnız en güçlü ${VARSAYILAN_CIFT}` : `Tümünü göster (${toplam})`}
          </button>
        )}
      </div>

      <div className="grafik-kutu" onPointerMove={hareket} onPointerLeave={() => setImlec(null)}>
        <svg width={SOL + G + SAG} height={UST + Y + ALT} viewBox={`0 0 ${SOL + G + SAG} ${UST + Y + ALT}`} role="img"
          aria-label={`Son ${pencere} saniyede ${seriler.length} çiftin sinyal gücü; eşik ${esik} dBm. Değerler aşağıdaki çift tablosunda.`}>
          {/* eşik üstü bölge: nötr ton */}
          <rect x={SOL} y={y(Y_UST)} width={G} height={y(esik) - y(Y_UST)} className="grafik-bolge" />
          {IZGARA.map((v) => (
            <g key={v}>
              <line x1={SOL} x2={SOL + G} y1={y(v)} y2={y(v)} className="grafik-izgara" />
              <text x={SOL - 6} y={y(v) + 4} className="grafik-eksen" textAnchor="end">{v}</text>
            </g>
          ))}
          {[pencere, pencere * 2 / 3, pencere / 3, 0].map((sn) => (
            <text key={sn} x={x(sn)} y={UST + Y + 18} className="grafik-eksen"
              textAnchor={sn === 0 ? 'end' : sn === pencere ? 'start' : 'middle'}>
              {sn === 0 ? 'şimdi' : `${Math.round(sn)} sn önce`}
            </text>
          ))}
          <text x={SOL + 6} y={y(Y_UST) + 14} className="grafik-bolge-yazi">eşik üstü — yakın</text>

          {seriler.map((s) => (
            <g key={s.anahtar} data-test="grafik-cizgi" data-cift={s.anahtar}>
              <path d={yol(s)} className="grafik-cizgi" stroke={s.a.color ?? NOTR} />
              <path d={yol(s)} className="grafik-cizgi grafik-cizgi--ikinci" stroke={s.b.color ?? NOTR} />
            </g>
          ))}

          <line x1={SOL} x2={SOL + G} y1={y(esik)} y2={y(esik)} className="grafik-esik" data-test="grafik-esik" />
          <text x={SOL + G - 4} y={y(esik) - 5} className="grafik-esik-yazi" textAnchor="end">eşik {esik}</text>

          {seriler.map((s, i) => (
            <g key={s.anahtar} className="grafik-etiket">
              <line x1={x(s.noktalar[s.noktalar.length - 1][0])} x2={SOL + G + 6}
                y1={y(s.son)} y2={etiketY[i]} className="grafik-etiket-bag" />
              <circle cx={SOL + G + 12} cy={etiketY[i]} r={4} fill={s.a.color ?? NOTR} />
              <circle cx={SOL + G + 22} cy={etiketY[i]} r={4} fill={s.b.color ?? NOTR} />
              <text x={SOL + G + 30} y={etiketY[i] + 4} className="grafik-etiket-yazi">{ciftEtiketi(s)}</text>
            </g>
          ))}

          {imlec !== null && <line x1={x(imlec)} x2={x(imlec)} y1={UST} y2={UST + Y} className="grafik-imlec" />}
        </svg>

        {imlec !== null && anlik.length > 0 && (
          <div className="grafik-ipucu" role="status" data-test="grafik-ipucu"
            style={{ left: `${Math.min(78, Math.max(22, (x(imlec) / (SOL + G + SAG)) * 100))}%` }}>
            <p className="grafik-ipucu-zaman">{Math.round(imlec)} sn önce</p>
            <ul>
              {anlik.map(({ seri, deger }) => (
                <li key={seri.anahtar}>
                  <span className="grafik-nokta" style={{ background: seri.a.color ?? NOTR }} />
                  <span className="grafik-nokta" style={{ background: seri.b.color ?? NOTR }} />
                  <span className="grafik-ipucu-cift">{ciftEtiketi(seri)}</span>
                  <span className="sayi">{dbmYazisi(deger)} dBm</span>
                  <span className={`grafik-ipucu-durum ${deger >= esik ? 'grafik-ipucu-durum--ust' : ''}`}>
                    {deger >= esik ? 'eşik üstü' : 'altı'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      </>)}
    </div>
  )
}
