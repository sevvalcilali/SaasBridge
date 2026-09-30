// Adım 1: kayıtlı kişilerde ara ve seç, ya da hızlı formla yeni kişi oluştur.
// Dokunmatik-ayakta: büyük hedefler, az yazı, klavye en son çare.
import { useState } from 'react'
import { katilimciAra, formGecerli } from '../../api/masaYardim.js'

const ROLLER = [
  { deger: 'investor', etiket: 'Yatırımcı' },
  { deger: 'founder', etiket: 'Girişimci' },
  { deger: 'guest', etiket: 'Misafir' },
]
const BOS_FORM = { ad: '', rol: 'founder', kurum: '', yildiz: 0, not: '' }

export default function KisiSecAdim({ api, katilimcilar, onYenile, onKisiSec }) {
  const [arama, setArama] = useState('')
  const [formAcik, setFormAcik] = useState(false)
  const [form, setForm] = useState(BOS_FORM)
  const [gonderiliyor, setGonderiliyor] = useState(false)

  const liste = katilimcilar ? katilimciAra(katilimcilar, arama) : []
  const yaz = (alan, deger) => setForm((f) => ({ ...f, [alan]: deger }))

  async function yeniKisiEkle() {
    if (!formGecerli(form) || gonderiliyor) return
    setGonderiliyor(true)
    try {
      const kisi = await api.kisiEkle(form)
      await onYenile()
      onKisiSec(kisi)
    } finally {
      setGonderiliyor(false)
    }
  }

  if (katilimcilar === null) return <p className="kartver-iskele">Kişiler yükleniyor…</p>

  return (
    <div className="kisisec">
      {!formAcik && (
        <>
          <input
            type="search"
            className="kisisec-arama"
            placeholder="Kayıtlı kişilerde ara: ad veya kurum"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            aria-label="Kişi ara"
          />

          <ul className="kisisec-liste" data-test="kisisec-liste">
            {liste.map((k) => (
              <li key={k.kisiId}>
                <button type="button" className="kisisec-oge" data-test="kisisec-oge" onClick={() => onKisiSec(k)}>
                  <span className="kisisec-renk" style={{ background: k.renk }} aria-hidden="true" />
                  <span className="kisisec-ad">
                    <strong>{k.rol === 'founder' && k.kurum ? `${k.kurum} · ${k.ad}` : k.ad}</strong>
                    <span className="kisisec-durum">
                      {k.atananKart ? `Kart ${k.atananKart}` : 'kartsız'}
                      {k.yildiz ? ` · ${'★'.repeat(k.yildiz)}` : ''}
                    </span>
                  </span>
                </button>
              </li>
            ))}
            {liste.length === 0 && <li className="kartver-iskele">Eşleşen kayıt yok.</li>}
          </ul>

          <button type="button" className="kisisec-yeni" data-test="yeni-kisi-ac" onClick={() => { setForm({ ...BOS_FORM }); setFormAcik(true) }}>
            + Yeni kişi
          </button>
        </>
      )}

      {formAcik && (
        <div className="kisisec-form" data-test="kisisec-form">
          <label className="kisisec-etiket">Ad
            <input className="kisisec-girdi" value={form.ad} autoFocus
              onChange={(e) => yaz('ad', e.target.value)} data-test="form-ad" />
          </label>

          <span className="kisisec-etiket">Rol</span>
          <div className="kisisec-rol">
            {ROLLER.map((r) => (
              <button key={r.deger} type="button"
                className={`kisisec-rol-dugme ${form.rol === r.deger ? 'kisisec-rol-dugme--secili' : ''}`}
                aria-pressed={form.rol === r.deger}
                onClick={() => yaz('rol', r.deger)}>
                {r.etiket}
              </button>
            ))}
          </div>

          <label className="kisisec-etiket">Kurum
            <input className="kisisec-girdi" value={form.kurum} onChange={(e) => yaz('kurum', e.target.value)} data-test="form-kurum" />
          </label>

          {form.rol === 'investor' && (
            <div className="kisisec-yildiz-blok">
              <span className="kisisec-etiket">Yıldız</span>
              <div className="kisisec-yildizlar" role="radiogroup" aria-label="Yıldız">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button"
                    className={`kisisec-yildiz ${form.yildiz >= n ? 'kisisec-yildiz--dolu' : ''}`}
                    aria-label={`${n} yıldız`} aria-pressed={form.yildiz === n}
                    onClick={() => yaz('yildiz', form.yildiz === n ? 0 : n)}>★</button>
                ))}
              </div>
            </div>
          )}

          <label className="kisisec-etiket">Not (isteğe bağlı)
            <input className="kisisec-girdi" value={form.not} onChange={(e) => yaz('not', e.target.value)} />
          </label>

          <div className="kisisec-form-dugmeler">
            <button type="button" className="kartver-geri" onClick={() => setFormAcik(false)}>İptal</button>
            <button type="button" className="kisisec-ekle" data-test="form-ekle"
              disabled={!formGecerli(form) || gonderiliyor} onClick={yeniKisiEkle}>
              Ekle ve devam
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
