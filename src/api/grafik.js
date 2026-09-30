// Canlı sinyal grafiği geometrisi (brief §8). Saf fonksiyonlar; bileşen yalnız çizer.
// history: { "3-4": [[saniyeÖnce, dBm], ...] } — en eski başta (brief §5.1).
import { ESIK_ALT, ESIK_UST } from './esik.js'
import { kartKisisi } from './sinyal.js'

export const Y_ALT = ESIK_ALT // ölçek kaydırıcıyla aynı ve SABİT: veri gelince eksen oynamaz
export const Y_UST = ESIK_UST
export const VARSAYILAN_CIFT = 6

const parcala = (anahtar) => anahtar.split('-')

// Hangi çiftler çizilir: kişi seçiliyse (perspektif) yalnız onunkiler; aksi halde
// en güçlü N (son değere göre) ya da hepsi. Çizim sırası kart no'ya göre sabit.
export function grafikSerileri(history, people, { hepsi = false, n = VARSAYILAN_CIFT, kisiId = null } = {}) {
  const kisi = new Map(people.map((p) => [p.id, p]))
  let seriler = Object.entries(history)
    .filter(([, noktalar]) => noktalar.length > 0)
    .map(([anahtar, noktalar]) => {
      const [a, b] = parcala(anahtar)
      return {
        anahtar,
        a: kisi.get(a) ?? kartKisisi(a),
        b: kisi.get(b) ?? kartKisisi(b),
        noktalar,
        son: noktalar[noktalar.length - 1][1],
      }
    })
  if (kisiId) seriler = seriler.filter((s) => s.a.id === kisiId || s.b.id === kisiId)
  const toplam = seriler.length
  if (!hepsi && seriler.length > n) seriler = [...seriler].sort((p, q) => q.son - p.son).slice(0, n)
  const sira = (s) => parcala(s.anahtar).map(Number)
  seriler.sort((p, q) => sira(p)[0] - sira(q)[0] || sira(p)[1] - sira(q)[1])
  return { seriler, toplam }
}

const sinirla = (v, alt, ust) => Math.min(ust, Math.max(alt, v))

// dBm → piksel (üst = güçlü). Aralık dışı değerler kenara yapışır.
export const olcekY = (dbm, yukseklik) =>
  ((Y_UST - sinirla(dbm, Y_ALT, Y_UST)) / (Y_UST - Y_ALT)) * yukseklik

// saniyeÖnce → piksel (sağ kenar = şimdi).
export const olcekX = (sn, genislik, pencere) => genislik - (sinirla(sn, 0, pencere) / pencere) * genislik
export const xdenSaniye = (x, genislik, pencere) => sinirla(((genislik - x) / genislik) * pencere, 0, pencere)

// Çizgi sonu etiketleri çakışmasın: y'ler sıralanıp en az `aralik` açılır,
// [alt, ust] içinde tutulur. Dönüş giriş sırasıyla aynı.
export function etiketleriAyir(ys, aralik, ust, alt) {
  const sirali = ys.map((y, i) => ({ y, i })).sort((p, q) => p.y - q.y)
  for (let k = 0; k < sirali.length; k++) {
    const onceki = k === 0 ? ust - aralik : sirali[k - 1].y
    sirali[k].y = Math.max(sirali[k].y, onceki + aralik)
  }
  // alt sınırı aştıysa sondan yukarı it
  for (let k = sirali.length - 1; k >= 0; k--) {
    const sonraki = k === sirali.length - 1 ? alt + aralik : sirali[k + 1].y
    sirali[k].y = Math.min(sirali[k].y, sonraki - aralik)
  }
  const sonuc = new Array(ys.length)
  for (const { y, i } of sirali) sonuc[i] = y
  return sonuc
}

// Üzerine gelinen andaki değerler: her seride o ana en yakın nokta (±tolerans sn).
export function anlikDegerler(seriler, saniyeOnce, tolerans = 2.5) {
  return seriler
    .map((s) => {
      let en = null
      for (const [sn, v] of s.noktalar) if (en === null || Math.abs(sn - saniyeOnce) < Math.abs(en[0] - saniyeOnce)) en = [sn, v]
      return en && Math.abs(en[0] - saniyeOnce) <= tolerans ? { seri: s, deger: en[1] } : null
    })
    .filter(Boolean)
    .sort((p, q) => q.deger - p.deger)
}

// "3 · 4" — brief §8 doğrudan etiket biçimi.
export const ciftEtiketi = (s) => `${s.a.id} · ${s.b.id}`
