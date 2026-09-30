// Kurulum ekranının sunucu uçları (eşik /control üzerinden PanoBaglantisi'ndedir).
// Gerçek sunucu gelince yalnız `adres` değişir.
import { jsonIstek, adresTemizle } from './http.js'

export class KurulumApi {
  constructor({ adres = '' } = {}) {
    this.adres = adresTemizle(adres)
  }

  // Kart sağlığı (3.7): alıcının duyduğu tüm kartlar — son duyulma, pil, atanan.
  kartlariGetir() { return jsonIstek(this.adres, '/api/cards') }

  // YALNIZ MOCK (donanım yok): iki kartı yüz yüze / sırt sırta tutmayı taklit eder.
  // mod: 'yuzyuze' | 'sirtsirta' | null (bırak). Gerçek sunucuda bu uç yoktur.
  demoTut(a, b, mod) { return jsonIstek(this.adres, '/api/demo/tut', 'POST', { a, b, mod }) }
}
