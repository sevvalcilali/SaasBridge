// Karşılama masası (§9) uçlarıyla konuşan TEK yer. Ekran bileşenleri doğrudan
// fetch yapmaz; buradan çağırır. Gerçek sunucu gelince yalnız `adres` değişir
// (varsayılan: aynı kaynak). client.js ile aynı felsefe.
import { sunucuRengi } from './renkler.js'

// Kişi rengi panodakiyle aynı açık palete çevrilir (client.js ile aynı eşleme):
// renk kişiyi takip eder ve yeşil yalnız "birlikte" demektir (brief §10).
const renkUyarla = (k) => ({ ...k, renk: sunucuRengi(k.renk) })

export class MasaApi {
  constructor({ adres = '' } = {}) {
    this.adres = adres.replace(/\/$/, '')
  }

  // Gövde varsayılan JSON; `tur` verilirse (ör. CSV) metin olduğu gibi gider.
  async #iste(yol, yontem = 'GET', govde, tur) {
    const secenek = { method: yontem, headers: {} }
    if (govde !== undefined) {
      secenek.headers['Content-Type'] = tur ?? 'application/json'
      secenek.body = tur ? govde : JSON.stringify(govde)
    }
    const yanit = await fetch(this.adres + yol, secenek)
    if (!yanit.ok) throw new Error(`${yontem} ${yol} → ${yanit.status}`)
    return yanit.json()
  }

  // --- kişi kayıt defteri ---
  async kisileriGetir() { return (await this.#iste('/api/people')).map(renkUyarla) }
  async kisiEkle(veri) { return renkUyarla(await this.#iste('/api/people', 'POST', veri)) }
  async kisiGuncelle(kisiId, veri) {
    return renkUyarla(await this.#iste(`/api/people/${encodeURIComponent(kisiId)}`, 'PATCH', veri))
  }
  kisiSil(kisiId) { return this.#iste(`/api/people/${encodeURIComponent(kisiId)}`, 'DELETE', {}) }
  // Toplu ön yükleme (§9-5): CSV metni → { eklenen, atlanan: [{ satir, sebep }] }
  iceAktar(csvMetni) { return this.#iste('/api/people/import', 'POST', csvMetni, 'text/csv; charset=utf-8') }

  // --- atama ---
  ata(kisiId, kart) { return this.#iste('/api/assign', 'POST', { kisiId, kart }) }
  // Kart iadesi kişiyi "ayrıldı" yapar; yanlış atamayı geri almak yapmaz (ayrildi: false).
  iade(kart, { ayrildi = true } = {}) { return this.#iste('/api/unassign', 'POST', { kart, ayrildi }) }

  // --- kartlar / yaklaştır ve tanı ---
  kartlariGetir() { return this.#iste('/api/cards') }
  yaklastir(kart, kart2) { return this.#iste('/api/yaklastir', 'POST', { kart, kart2 }) }
}
