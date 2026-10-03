// Kart sağlığı tablosu (brief §8): her kart için son duyulma, pil, "sorunlu"
// etiketi. Ölçütler panoyla aynı: >30 sn duyulmayan kişi "görünmüyor" (§5.1
// status away), ≥60 sn "kayıp" (lost bildirimi). Paket hızı yok (Şevval kararı).

import { KAYIP_SN } from './masaYardim.js' // masadaki "Kartı kontrol et" ile aynı ölçüt

export const SESSIZ_SN = 30
export const DUSUK_PIL = 20

const SORUNLAR = {
  kayip: { tur: 'kayip', agirlik: 0, ikon: '⚠', etiket: 'duyulmuyor' },
  sessiz: { tur: 'sessiz', agirlik: 1, ikon: '◌', etiket: 'görünmüyor' },
  pil: { tur: 'pil', agirlik: 2, ikon: '⚠', etiket: 'pil düşük' },
}

export function kartSorunlari(k) {
  const s = []
  if (k.seenAgo >= KAYIP_SN) s.push(SORUNLAR.kayip)
  else if (k.seenAgo > SESSIZ_SN) s.push(SORUNLAR.sessiz)
  if (k.pil != null && k.pil < DUSUK_PIL) s.push(SORUNLAR.pil)
  return s
}

// kartlar (/api/cards) + people (/state, id = kart no) → satırlar.
// Sorunlular üstte (en ağırı önce), gerisi kart numarasına göre.
export function kartSagligi(kartlar, people) {
  const kisi = new Map(people.map((p) => [p.id, p]))
  return kartlar
    .map((k) => {
      const sorunlar = kartSorunlari(k)
      return {
        kart: k.kart, seenAgo: k.seenAgo, pil: k.pil,
        kisi: k.atanan ? kisi.get(k.kart) ?? null : null,
        atanmis: Boolean(k.atanan),
        sorunlar,
        agirlik: sorunlar.length ? Math.min(...sorunlar.map((s) => s.agirlik)) : 9,
      }
    })
    .sort((a, b) => a.agirlik - b.agirlik || Number(a.kart) - Number(b.kart))
}

export const sorunluSayisi = (satirlar) => satirlar.filter((r) => r.sorunlar.length).length
