// Kurulum ekranı sinyal yardımcıları (brief §5.1 signals, §8). Saf fonksiyonlar.
//
// Çift durumu mevcut alanlardan türetilir (§9-7'deki `pending` alanına gerek yok):
//   above ∧ together   → birlikte
//   above ∧ ¬together  → başlıyor… (5 sn giriş gecikmesi bekleniyor)
//   ¬above ∧ together  → bitiyor…  (15 sn çıkış gecikmesi; hâlâ birlikte sayılıyor)
//   ¬above ∧ ¬together → eşik altı

export const YON_FARK_DB = 8 // iki yön arasında bu kadar fark → donanım farkı işareti
export const SEYREK_N = 5    // son 10 sn'de bundan az ölçüm → veri seyrek

const DURUMLAR = {
  birlikte: { tur: 'birlikte', ikon: '●', etiket: 'birlikte' },
  basliyor: { tur: 'basliyor', ikon: '◔', etiket: 'başlıyor…' },
  bitiyor: { tur: 'bitiyor', ikon: '◑', etiket: 'bitiyor…' },
  alti: { tur: 'alti', ikon: '○', etiket: 'eşik altı' },
}

export function ciftDurumu(s) {
  if (s.above && s.together) return DURUMLAR.birlikte
  if (s.above) return DURUMLAR.basliyor
  if (s.together) return DURUMLAR.bitiyor
  return DURUMLAR.alti
}

export function yonFarki(s) {
  return s.ab == null || s.ba == null ? null : Math.round(Math.abs(s.ab - s.ba) * 10) / 10
}

// Listede olmayan kart (ör. 100+ dinleyici) için yer tutucu kişi.
export const kartKisisi = (id) => ({ id, name: `Kart ${id}`, org: '', role: null, color: null })

// signals + people → tablo satırları. Sıra kart numarasına göre SABİT: durum
// değişse de satır yer değiştirmez (brief: sakin, zıplamayan arayüz).
export function ciftSatirlari(signals, people) {
  const kisi = new Map(people.map((p) => [p.id, p]))
  return signals
    .map((s) => {
      // Küçük kart no solda; kişiler yer değişirse yönler (ab/ba) de değişir:
      // ab her zaman "soldakinin sağdakini duyduğu güç".
      const ters = Number(s.a) > Number(s.b)
      const [x, y] = ters ? [s.b, s.a] : [s.a, s.b]
      const fark = yonFarki(s)
      return {
        anahtar: `${x}-${y}`,
        a: kisi.get(x) ?? kartKisisi(x),
        b: kisi.get(y) ?? kartKisisi(y),
        ab: ters ? s.ba : s.ab,
        ba: ters ? s.ab : s.ba,
        value: s.value, n: s.n,
        durum: ciftDurumu(s),
        yonFarki: fark,
        yonFarkli: fark != null && fark >= YON_FARK_DB,
        seyrek: s.n < SEYREK_N,
        sira: [Number(x), Number(y)],
      }
    })
    .sort((p, q) => p.sira[0] - q.sira[0] || p.sira[1] - q.sira[1])
}

// dBm yazısı: null → "—", aksi halde tek ondalık.
export const dbmYazisi = (v) => (v == null ? '—' : (Math.round(v * 10) / 10).toFixed(1))
