// Adım 2: kartı seç — iki yol birlikte (brief §6.2):
// (a) Yaklaştır ve tanı (önerilen): alıcının en güçlü duyduğu kart otomatik bulunur.
// (b) Numarayı yaz: yalnız şu an açık (duyulan) kartlar önerilir.
import { useEffect, useState } from 'react'
import { acikKartlar, kartOner, baskinKart } from '../../api/masaYardim.js'
import { kartNoCoz, KART_EN_BUYUK } from '../../api/kartNo.js'
import { useDemo } from '../../api/useDemo.js'

const YOKLAMA_MS = 1000

// Demo (donanım yok): kimseye atanmamış bir kart numarası seç.
function bosKartNo(kartlar) {
  const dolu = new Set(kartlar.filter((k) => k.atanan).map((k) => k.kart))
  for (let n = 85; n < 100; n++) if (!dolu.has(String(n))) return String(n)
  return '99'
}

export default function KartSecAdim({ api, seciliKisi, onKartSec, onGeri }) {
  const [kartlar, setKartlar] = useState(null)
  const [mod, setMod] = useState('yaklastir')
  const [girdi, setGirdi] = useState('')
  const demo = useDemo(api) // demo düğmeleri yalnız mock sunucuda

  useEffect(() => {
    let iptal = false
    const getir = () => api.kartlariGetir().then((k) => { if (!iptal) setKartlar(k) }).catch(() => {})
    getir()
    const z = setInterval(getir, YOKLAMA_MS)
    return () => { iptal = true; clearInterval(z) }
  }, [api])

  const acik = kartlar ? acikKartlar(kartlar) : []
  const baskin = kartlar ? baskinKart(kartlar) : { kart: null, coklu: false }
  const oneriler = kartOner(acik, girdi)
  const kartNo = kartNoCoz(girdi) // "007" → "7"; 0, 100+ (dinleyici) → null
  const girdiAcik = kartNo != null && acik.some((k) => k.kart === kartNo)
  // Demo isteği başarısız olursa (ör. sunucu yok) sessizce geç; yaklaştır ekranı zaten bekliyor.
  const yaklastir = (...kartlar_) => api.yaklastir(...kartlar_).catch(() => {})

  return (
    <div className="kartsec">
      <p className="kartver-secili">Kişi: <strong>{seciliKisi?.ad}</strong></p>

      <div className="kartsec-mod" role="tablist" aria-label="Kart seçme yolu">
        <button type="button" role="tab" aria-selected={mod === 'yaklastir'}
          className={`kartsec-mod-dugme ${mod === 'yaklastir' ? 'kartsec-mod-dugme--secili' : ''}`}
          onClick={() => setMod('yaklastir')} data-test="mod-yaklastir">
          Yaklaştır ve tanı <span className="kartsec-onerilen">önerilen</span>
        </button>
        <button type="button" role="tab" aria-selected={mod === 'numara'}
          className={`kartsec-mod-dugme ${mod === 'numara' ? 'kartsec-mod-dugme--secili' : ''}`}
          onClick={() => setMod('numara')} data-test="mod-numara">
          Numarayı yaz
        </button>
      </div>

      {mod === 'yaklastir' && (
        <div className="yaklastir" data-test="yaklastir-panel">
          {baskin.kart && (
            <div className="yaklastir-bulundu" role="status" data-test="kart-bulundu">
              <span className="yaklastir-buyuk">Kart {baskin.kart} bulundu ✓</span>
              <button type="button" className="kisisec-ekle" data-test="bulunan-sec"
                onClick={() => onKartSec(baskin.kart)}>Bu kartı seç</button>
            </div>
          )}
          {baskin.coklu && (
            <p className="kartsec-uyari" role="status" data-test="kart-coklu">
              ⚠ İki kart algılandı — birini alıcıdan uzaklaştırın.
            </p>
          )}
          {!baskin.kart && !baskin.coklu && (
            <p className="yaklastir-bekle" data-test="yaklastir-bekle">
              <span className="yaklastir-halka" aria-hidden="true" />
              Kartı alıcıya yaklaştırın…
            </p>
          )}

          {demo && (
            <div className="yaklastir-demo">
              <span className="yaklastir-demo-etiket">Demo — donanım yok, yaklaştırmayı taklit et:</span>
              <button type="button" className="kartver-geri" data-test="demo-yaklastir"
                onClick={() => kartlar && yaklastir(bosKartNo(kartlar))}>Boş bir kartı yaklaştır</button>
              <button type="button" className="kartver-geri" data-test="demo-iki"
                onClick={() => yaklastir('96', '97')}>İki kartı birden yaklaştır</button>
            </div>
          )}
        </div>
      )}

      {mod === 'numara' && (
        <>
          <label className="kisisec-etiket">Kart numarası (kartın üstündeki etiket)
            <input className="kartsec-numara" inputMode="numeric" value={girdi}
              onChange={(e) => setGirdi(e.target.value.replace(/\D/g, ''))}
              placeholder="Örn. 14" data-test="kart-numara" autoFocus />
          </label>

          {girdi && !kartNo && (
            <p className="kartsec-uyari" role="status" data-test="kart-gecersiz">
              ⚠ Kart numarası 1–{KART_EN_BUYUK} arası olmalı (100 ve üstü dinleyici cihazdır).
            </p>
          )}
          {kartNo && !girdiAcik && (
            <p className="kartsec-uyari" role="status" data-test="kart-duyulmuyor">
              ⚠ Kart {kartNo} şu an duyulmuyor — açık mı, pili var mı kontrol edin.
            </p>
          )}

          <div className="kartsec-bas">
            <span>Şu an açık kartlar</span>
            <span className="kartsec-sayi sayi">{kartlar ? acik.length : '…'}</span>
          </div>
          <ul className="kartsec-oneriler" data-test="kart-oneriler">
            {oneriler.slice(0, 24).map((k) => (
              <li key={k.kart}>
                <button type="button" className="kartsec-oge" data-test="kart-oneri" onClick={() => onKartSec(k.kart)}>
                  <span className="kartsec-acik" aria-hidden="true" />
                  <span className="kartsec-no sayi">Kart {k.kart}</span>
                  <span className="kartsec-etiket">{k.atanan ? 'atanmış' : 'boşta'}</span>
                </button>
              </li>
            ))}
            {kartlar && oneriler.length === 0 && <li className="kartver-iskele">Eşleşen açık kart yok.</li>}
          </ul>
        </>
      )}

      <div className="kisisec-form-dugmeler">
        <button type="button" className="kartver-geri" onClick={onGeri}>← Kişi</button>
        {mod === 'numara' && (
          <button type="button" className="kisisec-ekle" data-test="kart-sec-dugme"
            disabled={!kartNo} onClick={() => onKartSec(kartNo)}>Bu kartı seç</button>
        )}
      </div>
    </div>
  )
}
