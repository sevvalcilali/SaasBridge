// Karşılama masası (§9) uçlarıyla konuşan TEK yer. Ekran bileşenleri doğrudan
// fetch yapmaz; buradan çağırır. Gerçek sunucu gelince yalnız `adres` değişir
// (varsayılan: aynı kaynak). client.js ile aynı felsefe.

export class MasaApi {
  constructor({ adres = '' } = {}) {
    this.adres = adres.replace(/\/$/, '')
  }

  async #iste(yol, yontem = 'GET', govde) {
    const secenek = { method: yontem, headers: {} }
    if (govde !== undefined) {
      secenek.headers['Content-Type'] = 'application/json'
      secenek.body = JSON.stringify(govde)
    }
    const yanit = await fetch(this.adres + yol, secenek)
    if (!yanit.ok) throw new Error(`${yontem} ${yol} → ${yanit.status}`)
    return yanit.json()
  }

  // --- kişi kayıt defteri ---
  kisileriGetir() { return this.#iste('/api/people') }
  kisiEkle(veri) { return this.#iste('/api/people', 'POST', veri) }
  kisiGuncelle(kisiId, veri) { return this.#iste(`/api/people/${encodeURIComponent(kisiId)}`, 'PATCH', veri) }
  kisiSil(kisiId) { return this.#iste(`/api/people/${encodeURIComponent(kisiId)}`, 'DELETE', {}) }

  // --- atama ---
  ata(kisiId, kart) { return this.#iste('/api/assign', 'POST', { kisiId, kart }) }
  iade(kart) { return this.#iste('/api/unassign', 'POST', { kart }) }

  // --- kartlar / yaklaştır ve tanı ---
  kartlariGetir() { return this.#iste('/api/cards') }
  yaklastir(kart, kart2) { return this.#iste('/api/yaklastir', 'POST', { kart, kart2 }) }
}
