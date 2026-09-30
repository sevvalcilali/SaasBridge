// Sunucuya JSON istekleri için ortak alt katman (MasaApi, KurulumApi). Ekranlar
// bunu doğrudan kullanmaz; yalnız api/ içindeki sarmalayıcılar.
// Gövde varsayılan JSON; `tur` verilirse (ör. CSV) metin olduğu gibi gider.
// 2xx dışı yanıt → istisna (çağıran hatayı kullanıcıya anlatır).
import { SUNUCU_ADRESI } from './client.js'

export async function jsonIstek(adres, yol, yontem = 'GET', govde, tur) {
  const secenek = { method: yontem, headers: {} }
  if (govde !== undefined) {
    secenek.headers['Content-Type'] = tur ?? 'application/json'
    secenek.body = tur ? govde : JSON.stringify(govde)
  }
  const yanit = await fetch(adres + yol, secenek)
  if (!yanit.ok) throw new Error(`${yontem} ${yol} → ${yanit.status}`)
  return yanit.json()
}

// Adres verilmezse client.js'teki tek sunucu adresi kullanılır.
export const adresTemizle = (adres = SUNUCU_ADRESI) => adres.replace(/\/$/, '')
