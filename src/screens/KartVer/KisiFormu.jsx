// Kişi bilgisi formu — yeni kişi (2.5) ve düzenleme (2.11) aynı alanları kullanır:
// Ad, Rol (büyük düğmeler), Kurum, yatırımcıysa Yıldız, Not. Renk burada
// değiştirilemez (brief §6); düzenlemede yalnız gösterilir.
import { useState } from 'react'
import { formGecerli } from '../../api/masaYardim.js'

const ROLLER = [
  { deger: 'investor', etiket: 'Yatırımcı' },
  { deger: 'founder', etiket: 'Girişimci' },
  { deger: 'guest', etiket: 'Misafir' },
]

export default function KisiFormu({ baslangic, renk, kaydetEtiket, gonderiliyor, hata, onKaydet, onIptal }) {
  const [form, setForm] = useState(baslangic)
  const yaz = (alan, deger) => setForm((f) => ({ ...f, [alan]: deger }))

  return (
    <div className="kisisec-form" data-test="kisisec-form">
      {renk && (
        <p className="kisiform-renk">
          <span className="kisisec-renk" style={{ background: renk }} aria-hidden="true" />
          Kişinin rengi değişmez.
        </p>
      )}

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
            onClick={() => yaz('rol', r.deger)} data-test={`form-rol-${r.deger}`}>
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

      {hata && <p className="kartsec-uyari" role="alert">{hata}</p>}

      <div className="kisisec-form-dugmeler">
        <button type="button" className="kartver-geri" onClick={onIptal}>İptal</button>
        <button type="button" className="kisisec-ekle" data-test="form-ekle"
          disabled={!formGecerli(form) || gonderiliyor} onClick={() => onKaydet(form)}>
          {kaydetEtiket}
        </button>
      </div>
    </div>
  )
}
