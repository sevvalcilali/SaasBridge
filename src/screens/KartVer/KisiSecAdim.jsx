// Adım 1: kayıtlı kişilerde ara ve seç, ya da hızlı formla yeni kişi oluştur.
// Kayıtlı kişinin bilgisi (ad/rol/kurum/yıldız) buradan düzenlenir (2.11).
// Dokunmatik-ayakta: büyük hedefler, az yazı, klavye en son çare.
import { useState } from 'react'
import { katilimciAra, duzenlemeFarki } from '../../api/masaYardim.js'
import KisiFormu from './KisiFormu.jsx'

const BOS_FORM = { ad: '', rol: 'founder', kurum: '', yildiz: 0, not: '' }

export default function KisiSecAdim({ api, katilimcilar, onYenile, onKisiSec, onDuzenlendi }) {
  const [arama, setArama] = useState('')
  const [form, setForm] = useState(null) // null | { yeni: true } | { kisi }
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const [hata, setHata] = useState(null)

  const liste = katilimcilar ? katilimciAra(katilimcilar, arama) : []

  function formAc(yeni) {
    setHata(null)
    setForm(yeni)
  }

  async function yeniKisiEkle(veri) {
    if (gonderiliyor) return
    setGonderiliyor(true)
    try {
      const kisi = await api.kisiEkle(veri)
      await onYenile()
      onKisiSec(kisi)
    } catch {
      setHata('Kişi eklenemedi — sunucuya ulaşılamıyor. Tekrar deneyin.')
    } finally {
      setGonderiliyor(false)
    }
  }

  async function kisiKaydet(veri) {
    if (gonderiliyor) return
    const fark = duzenlemeFarki(form.kisi, veri)
    if (Object.keys(fark).length === 0) { setForm(null); return }
    setGonderiliyor(true)
    try {
      const guncel = await api.kisiGuncelle(form.kisi.kisiId, fark)
      await onYenile()
      onDuzenlendi?.(guncel)
      setForm(null)
    } catch {
      setHata('Kaydedilemedi — sunucuya ulaşılamıyor. Tekrar deneyin.')
    } finally {
      setGonderiliyor(false)
    }
  }

  if (katilimcilar === null) return <p className="kartver-iskele">Kişiler yükleniyor…</p>

  if (form?.yeni) {
    return (
      <KisiFormu baslangic={{ ...BOS_FORM }} kaydetEtiket="Ekle ve devam" gonderiliyor={gonderiliyor}
        hata={hata} onKaydet={yeniKisiEkle} onIptal={() => setForm(null)} />
    )
  }

  if (form?.kisi) {
    const { ad, rol, kurum, yildiz, not } = form.kisi
    return (
      <KisiFormu baslangic={{ ad, rol, kurum, yildiz, not }} renk={form.kisi.renk} kaydetEtiket="Kaydet"
        gonderiliyor={gonderiliyor} hata={hata} onKaydet={kisiKaydet} onIptal={() => setForm(null)} />
    )
  }

  return (
    <div className="kisisec">
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
          <li key={k.kisiId} className="kisisec-satir">
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
            <button type="button" className="kartver-geri kisisec-duzenle" data-test="kisi-duzenle"
              aria-label={`${k.ad} bilgilerini düzenle`} onClick={() => formAc({ kisi: k })}>
              Düzenle
            </button>
          </li>
        ))}
        {liste.length === 0 && <li className="kartver-iskele">Eşleşen kayıt yok.</li>}
      </ul>

      <button type="button" className="kisisec-yeni" data-test="yeni-kisi-ac" onClick={() => formAc({ yeni: true })}>
        + Yeni kişi
      </button>
    </div>
  )
}
