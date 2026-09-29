// Sunucuyla konuşan TEK yer (PLAN mimari kuralı 1). Ekran bileşenleri
// asla fetch/SSE yapmaz; buradan gelen anlık görüntüyü görüntüler.
//
// Gerçek sunucuya geçiş: yalnız ADRES değişir (varsayılan: aynı kaynak —
// üretimde pano.py'nin 8002'si, geliştirmede Vite proxy'si).
//
// SSE, EventSource yerine fetch+akış ile okunur: yeniden bağlanma ve hata
// durumu bizim kontrolümüzde olmalı (brief §11: kopunca uyarı göster, son
// veriyi SİLME) ve aynı kod bağımlılık eklemeden Node testlerinde koşar.
import { sunucuRengi } from './renkler.js'

const ILK_BEKLEME_MS = 500
const EN_UZUN_BEKLEME_MS = 10000

/** Ham sunucu durumunu arayüzün kullandığı biçime çevirir. */
export function durumIsle(ham) {
  return {
    ...ham,
    // Kart no 100+ dinleyici cihazdır, kişi değildir (brief §2).
    people: ham.people
      .filter((k) => !(Number(k.id) >= 100))
      .map((k) => ({ ...k, color: sunucuRengi(k.color), sunucuColor: k.color })),
    // Sunucu en eskiyi başa koyar; akışta en yeni en üstte durur (brief §7).
    alerts: [...ham.alerts].sort((a, b) => b.t - a.t),
  }
}

export class PanoBaglantisi {
  constructor({ adres = '', bekleme = null, sessizlikEsigiMs = 6000 } = {}) {
    this.adres = adres.replace(/\/$/, '')
    this.beklemeGecersizKil = bekleme
    // Sunucu ~2 Hz yayınlar; bu kadar süre HİÇ mesaj gelmezse bağlantı sessizce
    // ölmüş sayılır (soket asılı kaldıysa hata/kapanış gelmez) → yeniden bağlan.
    this.sessizlikEsigiMs = sessizlikEsigiMs
    this.durum = null
    this.baglandi = false
    this.hata = null
    this.dinleyiciler = new Set()
    this.calisiyor = false
    this.iptal = null
    this.sonBaglantiBasarili = false
  }

  /** Anlık görüntüyü dinler; çağırınca aboneliği bırakan işlevi döndürür. */
  dinle(geriCagri) {
    this.dinleyiciler.add(geriCagri)
    geriCagri(this.anlik())
    return () => this.dinleyiciler.delete(geriCagri)
  }

  anlik() {
    return { durum: this.durum, baglandi: this.baglandi, hata: this.hata }
  }

  /** Yeniden deneme bekleme süresi: geri çekmeli, üst sınırlı. */
  beklemeSuresi(deneme) {
    if (this.beklemeGecersizKil) return this.beklemeGecersizKil(deneme)
    return Math.min(ILK_BEKLEME_MS * 2 ** deneme, EN_UZUN_BEKLEME_MS)
  }

  async basla() {
    if (this.calisiyor) return
    this.calisiyor = true

    // Açılışta bir kez tam durum (brief §5): akış gecikirse ekran boş kalmasın.
    try {
      const yanit = await fetch(`${this.adres}/state`)
      if (yanit.ok) this.durumAyarla(await yanit.json())
    } catch {
      /* akış yine de denenir */
    }

    let deneme = 0
    while (this.calisiyor) {
      try {
        await this.akisiDinle()
      } catch {
        if (!this.calisiyor) break
        if (this.sonBaglantiBasarili) { deneme = 0; this.sonBaglantiBasarili = false }
        this.baglandi = false
        this.hata = 'baglanti'
        this.bildir()
        await new Promise((c) => setTimeout(c, this.beklemeSuresi(deneme++)))
      }
    }
  }

  async akisiDinle() {
    const kontrol = new AbortController()
    this.iptal = kontrol
    const yanit = await fetch(`${this.adres}/events`, {
      signal: kontrol.signal,
      headers: { Accept: 'text/event-stream' },
    })
    if (!yanit.ok || !yanit.body) throw new Error('akış açılamadı')
    this.sonBaglantiBasarili = true
    this.baglandi = true
    this.hata = null
    this.bildir()

    const okuyucu = yanit.body.getReader()
    const cozucu = new TextDecoder()
    let tampon = ''

    // Sessizlik gözcüsü: son mesajdan bu yana eşiği aşan süre geçerse akışı
    // iptal et; dış döngü bunu kopma sayıp yeniden bağlanır.
    let sonMesaj = Date.now()
    const gozcu = setInterval(() => {
      if (Date.now() - sonMesaj > this.sessizlikEsigiMs) kontrol.abort()
    }, Math.max(50, Math.min(1000, this.sessizlikEsigiMs / 2)))

    try {
      for (;;) {
        const { value, done } = await okuyucu.read()
        if (done) throw new Error('akış kapandı')
        tampon += cozucu.decode(value, { stream: true })
        let sinir
        while ((sinir = tampon.indexOf('\n\n')) >= 0) {
          const blok = tampon.slice(0, sinir)
          tampon = tampon.slice(sinir + 2)
          const veri = blok
            .split('\n')
            .filter((satir) => satir.startsWith('data:'))
            .map((satir) => satir.slice(5).trimStart())
            .join('')
          if (!veri) continue
          sonMesaj = Date.now()
          try {
            this.durumAyarla(JSON.parse(veri))
          } catch {
            /* bozuk tek mesaj akışı düşürmez */
          }
        }
      }
    } finally {
      clearInterval(gozcu)
    }
  }

  durumAyarla(ham) {
    this.durum = durumIsle(ham)
    this.baglandi = true
    this.hata = null
    this.bildir()
  }

  bildir() {
    const anlik = this.anlik()
    for (const geriCagri of this.dinleyiciler) geriCagri(anlik)
  }

  async komut(govde) {
    const yanit = await fetch(`${this.adres}/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(govde),
    })
    return yanit.ok
  }

  /** Eşiği değiştirir (kaydırıcı bırakıldıktan ~250 ms sonra çağrılır). */
  esikGonder(dbm) {
    return this.komut({ cmd: 'threshold', value: dbm })
  }

  /** Tüm süreleri/geçmişi/bildirimleri sıfırlar — çağıran onay almış olmalı. */
  sifirla() {
    return this.komut({ cmd: 'reset' })
  }

  kapat() {
    this.calisiyor = false
    this.iptal?.abort()
    this.dinleyiciler.clear()
  }
}
