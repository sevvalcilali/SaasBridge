// Adım 2: kartı seç. (a) "Yaklaştır ve tanı" 2.7'de eklenir; burada (b)
// numarayı yaz — yalnız şu an açık (duyulan) kartlar önerilir, yeşil nokta = açık.
import { useEffect, useState } from 'react'
import { acikKartlar, kartOner } from '../../api/masaYardim.js'

const YOKLAMA_MS = 2000

export default function KartSecAdim({ api, seciliKisi, onKartSec, onGeri }) {
  const [kartlar, setKartlar] = useState(null)
  const [girdi, setGirdi] = useState('')

  // Açık kartlar canlı değişir (kartlar açılıp kapanır) → düzenli yokla.
  useEffect(() => {
    let iptal = false
    const getir = () => api.kartlariGetir().then((k) => { if (!iptal) setKartlar(k) }).catch(() => {})
    getir()
    const z = setInterval(getir, YOKLAMA_MS)
    return () => { iptal = true; clearInterval(z) }
  }, [api])

  const acik = kartlar ? acikKartlar(kartlar) : []
  const oneriler = kartOner(acik, girdi)
  const girdiAcik = acik.some((k) => k.kart === girdi.trim())

  function sec(kart) {
    if (kart) onKartSec(kart)
  }

  return (
    <div className="kartsec">
      <p className="kartver-secili">Kişi: <strong>{seciliKisi?.ad}</strong></p>

      <label className="kisisec-etiket">Kart numarası (kartın üstündeki etiket)
        <input
          className="kartsec-numara"
          inputMode="numeric"
          value={girdi}
          onChange={(e) => setGirdi(e.target.value.replace(/\D/g, ''))}
          placeholder="Örn. 14"
          data-test="kart-numara"
          autoFocus
        />
      </label>

      {girdi && !girdiAcik && (
        <p className="kartsec-uyari" role="status" data-test="kart-duyulmuyor">
          ⚠ Kart {girdi} şu an duyulmuyor — açık mı, pili var mı kontrol edin.
        </p>
      )}

      <div className="kartsec-bas">
        <span>Şu an açık kartlar</span>
        <span className="kartsec-sayi sayi">{kartlar ? acik.length : '…'}</span>
      </div>
      <ul className="kartsec-oneriler" data-test="kart-oneriler">
        {oneriler.slice(0, 24).map((k) => (
          <li key={k.kart}>
            <button type="button" className="kartsec-oge" data-test="kart-oneri" onClick={() => sec(k.kart)}>
              <span className="kartsec-acik" aria-hidden="true" />
              <span className="kartsec-no sayi">Kart {k.kart}</span>
              <span className="kartsec-etiket">{k.atanan ? 'atanmış' : 'boşta'}</span>
            </button>
          </li>
        ))}
        {kartlar && oneriler.length === 0 && <li className="kartver-iskele">Eşleşen açık kart yok.</li>}
      </ul>

      <div className="kisisec-form-dugmeler">
        <button type="button" className="kartver-geri" onClick={onGeri}>← Kişi</button>
        <button type="button" className="kisisec-ekle" data-test="kart-sec-dugme"
          disabled={!girdi.trim()} onClick={() => sec(girdi.trim())}>
          Bu kartı seç
        </button>
      </div>
    </div>
  )
}
