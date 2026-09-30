// Etkinlik raporu ve kişi zaman çizelgesi hesapları (brief §4.4, §7, §9-6). Saf fonksiyonlar.
// Kaynak: kayıt defteri (/api/people — ayrılanlar dahil) + görüşme kayıtları (/api/sessions).
// Oturum: { a, b, start, end } — a/b kişi kimliği (kisiId ya da kayıtsız "kart:N"),
// start/end etkinlik saniyesi, sürmekte olanda end = null.

const KARSI = { investor: 'founder', founder: 'investor' }
const karsiRolMu = (x, y) => KARSI[x?.rol] === y?.rol

export const oturumSuresiSn = (o, simdi) => Math.max(0, (o.end ?? simdi) - o.start)

// Kayıtsız kart için yer tutucu kişi ("kart:14" → "Kart 14 (kayıtsız)").
export function kimlikKisisi(kimlik) {
  const no = kimlik.startsWith('kart:') ? kimlik.slice(5) : kimlik
  return { kisiId: kimlik, ad: `Kart ${no} (kayıtsız)`, rol: null, kurum: '', renk: null, atananKart: null, ayrildi: false }
}

// Görünen ad: girişimcide kurum öne (pano ile aynı kural).
export const raporAdi = (k) => (k.rol === 'founder' && k.kurum ? `${k.kurum} · ${k.ad}` : k.ad)
// Dar yerler (zaman çizelgesi) için panodaki kısa ad: girişimcide yalnız kurum.
export const kisaAd = (k) => (k.rol === 'founder' && k.kurum ? k.kurum : k.ad)

export function kisiDurumYazisi(k) {
  if (k.atananKart) return `Kart ${k.atananKart}`
  return k.ayrildi ? 'ayrıldı' : 'kart almadı'
}

// "HH:MM:SS" (/state.clock) + elapsed → etkinlik saniyesi sn'nin saati "HH:MM".
export function etkinlikSaati(sn, saat, elapsed) {
  const [h, m, s] = saat.split(':').map(Number)
  const gun = (((h * 3600 + m * 60 + (s || 0) - elapsed + sn) % 86400) + 86400) % 86400
  const iki = (n) => String(Math.floor(n)).padStart(2, '0')
  return `${iki(gun / 3600)}:${iki((gun % 3600) / 60)}`
}

// Bir kişinin görüşmeleri, başlangıca göre (zaman çizelgesi).
export function kisiOturumlari(kisiId, oturumlar, kisiler, simdi) {
  const harita = new Map(kisiler.map((k) => [k.kisiId, k]))
  return oturumlar
    .filter((o) => o.a === kisiId || o.b === kisiId)
    .map((o) => {
      const diger = o.a === kisiId ? o.b : o.a
      return { ...o, karsi: harita.get(diger) ?? kimlikKisisi(diger), sureSn: oturumSuresiSn(o, simdi), suruyor: o.end === null }
    })
    .sort((p, q) => p.start - q.start)
}

export function raporHesapla(kisiler, oturumlar, simdi, { enUzunAdet = 10 } = {}) {
  const harita = new Map(kisiler.map((k) => [k.kisiId, k]))
  const kisiBul = (id) => {
    if (!harita.has(id)) harita.set(id, kimlikKisisi(id))
    return harita.get(id)
  }

  const kisiTop = new Map()   // kisiId → { toplamSn, adet, esler: Set, karsiEsler: Map(kisiId → sn) }
  const ciftTop = new Map()   // "a|b" → { a, b, toplamSn, adet }
  const kayit = (id) => {
    if (!kisiTop.has(id)) kisiTop.set(id, { toplamSn: 0, adet: 0, esler: new Set(), karsiEsler: new Map() })
    return kisiTop.get(id)
  }
  let karmaSn = 0
  const enUzunAday = []

  for (const o of oturumlar) {
    const sure = oturumSuresiSn(o, simdi)
    const [ka, kb] = [kisiBul(o.a), kisiBul(o.b)]
    const karsi = karsiRolMu(ka, kb)
    for (const [ben, es] of [[o.a, o.b], [o.b, o.a]]) {
      const t = kayit(ben)
      t.toplamSn += sure; t.adet++; t.esler.add(es)
      if (karsi) t.karsiEsler.set(es, (t.karsiEsler.get(es) ?? 0) + sure)
    }
    if (karsi) karmaSn += sure
    const [x, y] = o.a < o.b ? [o.a, o.b] : [o.b, o.a]
    const anahtar = `${x}|${y}`
    const c = ciftTop.get(anahtar) ?? { a: kisiBul(x), b: kisiBul(y), toplamSn: 0, adet: 0 }
    c.toplamSn += sure; c.adet++
    ciftTop.set(anahtar, c)
    enUzunAday.push({ a: ka, b: kb, start: o.start, end: o.end, sureSn: sure, suruyor: o.end === null })
  }

  const bos = { toplamSn: 0, adet: 0, esler: new Set(), karsiEsler: new Map() }
  // Katılımcı tablosu yalnız kayıtlı kişiler (özetteki sayıyla aynı); kayıtsız kartın
  // görüşmeleri çift ve "en uzun" tablolarında kalır.
  const kisiSatirlari = kisiler
    .map((k) => {
      const t = kisiTop.get(k.kisiId) ?? bos
      return { kisi: k, toplamSn: t.toplamSn, gorusmeSayisi: t.adet, kisiSayisi: t.esler.size, karsiRolSayisi: t.karsiEsler.size }
    })
    .sort((p, q) => q.toplamSn - p.toplamSn || raporAdi(p.kisi).localeCompare(raporAdi(q.kisi), 'tr'))

  const girisimciler = [...harita.values()]
    .filter((k) => k.rol === 'founder')
    .map((k) => {
      const t = kisiTop.get(k.kisiId) ?? bos
      const yatirimcilar = [...t.karsiEsler.entries()]
        .map(([id, sn]) => ({ kisi: harita.get(id), toplamSn: sn }))
        .sort((p, q) => q.toplamSn - p.toplamSn)
      return { kisi: k, yatirimcilar, yatirimciSn: yatirimcilar.reduce((s, y) => s + y.toplamSn, 0) }
    })
    .sort((p, q) => q.yatirimcilar.length - p.yatirimcilar.length || q.yatirimciSn - p.yatirimciSn
      || raporAdi(p.kisi).localeCompare(raporAdi(q.kisi), 'tr'))

  const ulasan = girisimciler.filter((g) => g.yatirimcilar.length > 0).length

  return {
    ozet: {
      gorusme: oturumlar.length,
      suren: oturumlar.filter((o) => o.end === null).length,
      karmaSn,
      ulasan,
      girisimci: girisimciler.length,
      kisi: kisiler.length,
      ayrilan: kisiler.filter((k) => k.ayrildi && !k.atananKart).length,
    },
    kisiSatirlari,
    girisimciler,
    ciftler: [...ciftTop.values()].sort((p, q) => q.toplamSn - p.toplamSn),
    enUzun: enUzunAday.sort((p, q) => q.sureSn - p.sureSn).slice(0, enUzunAdet),
  }
}

// Zaman çizelgesi ekseni: ilk görüşmenin başı → şimdi. Konum yüzdesi [0, 100].
export function cizelgeAraligi(oturumlar, simdi) {
  const bas = oturumlar.length ? Math.min(...oturumlar.map((o) => o.start)) : 0
  return { bas, son: Math.max(simdi, bas + 60) } // en az 1 dk genişlik: tek kısa görüşme ezilmesin
}
export const cizelgeYuzde = (sn, aralik) => ((sn - aralik.bas) / (aralik.son - aralik.bas)) * 100
