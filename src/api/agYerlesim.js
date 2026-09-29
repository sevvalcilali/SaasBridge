// Ağ görünümü yerleşimi. Deterministik ve sabit: konum yalnız role ve grup
// içi sıraya bağlıdır (sunucu sırası), zamanla/değere göre değişmez → düğümler
// ZIPLAMAZ. Düğüm konumu FİZİKSEL konum DEĞİLDİR (brief §7).

const KENAR = 130 // sol/sağ sütun x konumu ve alt kenar boşluğu

// Bir eksende n öğeyi [bas, bit] aralığına ortalayarak dağıtır.
function dagit(n, bas, bit) {
  if (n <= 0) return []
  const adim = (bit - bas) / n
  return Array.from({ length: n }, (_, i) => bas + adim * (i + 0.5))
}

export function agYerlesimi(people, { w = 1000, h = 700 } = {}) {
  const yat = people.filter((k) => k.role === 'investor')
  const gir = people.filter((k) => k.role === 'founder')
  const mis = people.filter((k) => k.role === 'guest')

  const yatY = dagit(yat.length, 60, h - 160)   // sol sütun (üst→alt)
  const girY = dagit(gir.length, 60, h - 160)   // sağ sütun
  const misX = dagit(mis.length, KENAR, w - KENAR) // alt sıra (sol→sağ)

  const dugum = (k, x, y) => ({ id: k.id, role: k.role, color: k.color, name: k.name, org: k.org, x, y, kisi: k })

  return people.map((k) => {
    if (k.role === 'investor') return dugum(k, KENAR, yatY[yat.indexOf(k)])
    if (k.role === 'founder') return dugum(k, w - KENAR, girY[gir.indexOf(k)])
    return dugum(k, misX[mis.indexOf(k)], h - 70)
  })
}

const anahtar = (a, b) => (Number(a) < Number(b) ? `${a}-${b}` : `${b}-${a}`)

// Ağ çizgileri: bugün birlikte vakit geçirmiş çiftler (edges) + şu an birlikte
// olanlar (live). Kalınlık toplam süreyle artar; live çiftler "birlikte" (yeşil).
export function agCizgileri(edges, live, dugumler) {
  const konum = new Map(dugumler.map((d) => [d.id, d]))
  const birlikteSet = new Set(live.map((c) => anahtar(c.a, c.b)))

  const cizgiler = []
  const gorulen = new Set()

  const ekle = (a, b, min) => {
    const key = anahtar(a, b)
    if (gorulen.has(key)) return
    const da = konum.get(a)
    const db = konum.get(b)
    if (!da || !db) return // 100+ kart gibi düğümü olmayan çift
    gorulen.add(key)
    cizgiler.push({
      a, b,
      x1: da.x, y1: da.y, x2: db.x, y2: db.y,
      kalinlik: Math.min(1 + min * 0.4, 8),
      birlikte: birlikteSet.has(key),
      min,
    })
  }

  for (const e of edges) ekle(e.a, e.b, e.min)
  // edge'de yeri olmayan (yeni başlamış) live çiftler de çizilsin
  for (const c of live) if (!gorulen.has(anahtar(c.a, c.b))) ekle(c.a, c.b, 0)

  return cizgiler
}
