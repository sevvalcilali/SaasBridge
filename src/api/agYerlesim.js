// Ağ görünümü yerleşimi. Deterministik ve sabit: konum yalnız role ve grup
// içi sıraya bağlıdır (sunucu sırası), zamanla/değere göre değişmez → düğümler
// ZIPLAMAZ. Düğüm konumu FİZİKSEL konum DEĞİLDİR (brief §7).

const KENAR = 130 // sol/sağ sütun x konumu ve alt kenar boşluğu
const DUGUM_ARALIGI = 64 // sütunda düğüm başına en az dikey boşluk (düğüm + altındaki etiket)
const SUTUN_ARALIGI = 250 // bir rol birden çok sütuna bölününce sütunlar arası (etiket sığsın)
const ORTA_BOSLUK = 700 // yatırımcı ve girişimci blokları arasında çizgilere kalan en az genişlik

const rolSayilari = (people) => ({
  yat: people.filter((k) => k.role === 'investor').length,
  gir: people.filter((k) => k.role === 'founder').length,
})
// n kişi, sütun başına en çok `enCok` → kaç sütun, sütunda kaç satır.
function sutunDuzeni(n, enCok) {
  const sutun = Math.max(1, Math.ceil(n / enCok))
  return { sutun, satir: Math.max(1, Math.ceil(n / sutun)) }
}

// Ağın viewBox yüksekliği: kalabalık sütunda düğümler üst üste binmesin diye
// en kalabalık sütundaki kişi sayısıyla büyür (brief §7: kalabalıkta okunaklılık).
// sutunBasi verilirse (sunum modu: kaydırma yok) rol birden çok sütuna bölünür,
// yükseklik sütun başı satırla sınırlı kalır. Yalnız rol sayılarına bağlıdır →
// her tik değişmez, yalnız katılımcı eklenince.
export function agYukseklik(people, sutunBasi = Infinity) {
  const { yat, gir } = rolSayilari(people)
  const satir = Math.max(sutunDuzeni(yat, sutunBasi).satir, sutunDuzeni(gir, sutunBasi).satir)
  return Math.max(700, satir * DUGUM_ARALIGI + 260)
}

// viewBox genişliği: en az `taban`; çok sütunda sütunlar ve ortadaki çizgi alanı sığacak kadar.
export function agGenislik(people, taban, sutunBasi = Infinity) {
  const { yat, gir } = rolSayilari(people)
  const ek = (sutunDuzeni(yat, sutunBasi).sutun - 1 + sutunDuzeni(gir, sutunBasi).sutun - 1) * SUTUN_ARALIGI
  return Math.max(taban, 2 * KENAR + ORTA_BOSLUK + ek)
}

// Bir eksende n öğeyi [bas, bit] aralığına ortalayarak dağıtır.
function dagit(n, bas, bit) {
  if (n <= 0) return []
  const adim = (bit - bas) / n
  return Array.from({ length: n }, (_, i) => bas + adim * (i + 0.5))
}

export function agYerlesimi(people, { w = 1000, h = 700, sutunBasi = Infinity } = {}) {
  const yat = people.filter((k) => k.role === 'investor')
  const gir = people.filter((k) => k.role === 'founder')
  const mis = people.filter((k) => k.role === 'guest')

  // Sütun sütun doldurulur (sunucu sırası korunur): yatırımcılar soldan içe,
  // girişimciler sağdan içe. Tek sütunda eski düzenle aynıdır.
  const yatD = sutunDuzeni(yat.length, sutunBasi)
  const girD = sutunDuzeni(gir.length, sutunBasi)
  const yatY = dagit(yatD.satir, 60, h - 160)
  const girY = dagit(girD.satir, 60, h - 160)
  const misX = dagit(mis.length, KENAR, w - KENAR) // alt sıra (sol→sağ)
  const yatKonum = (i) => [KENAR + Math.floor(i / yatD.satir) * SUTUN_ARALIGI, yatY[i % yatD.satir]]
  const girKonum = (i) => [w - KENAR - Math.floor(i / girD.satir) * SUTUN_ARALIGI, girY[i % girD.satir]]

  const dugum = (k, x, y, etiketYukari = false) =>
    ({ id: k.id, role: k.role, color: k.color, name: k.name, org: k.org, x, y, etiketYukari, kisi: k })

  return people.map((k) => {
    if (k.role === 'investor') return dugum(k, ...yatKonum(yat.indexOf(k)))
    if (k.role === 'founder') return dugum(k, ...girKonum(gir.indexOf(k)))
    // Alt sıradaki komşu etiketler çakışmasın: tek sıradakiler üste yazılır.
    const i = mis.indexOf(k)
    return dugum(k, misX[i], h - 70, i % 2 === 1)
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
