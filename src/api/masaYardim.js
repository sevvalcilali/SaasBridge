// Karşılama masası saf yardımcıları. Ekran bileşenleri bunları çağırır.

const tr = (s) => (s ?? '').toLocaleLowerCase('tr')

// Kayıtlı katılımcılarda ad/kurum araması (Türkçe büyük-küçük harf duyarsız).
export function katilimciAra(liste, arama) {
  const q = tr(arama).trim()
  if (!q) return liste
  return liste.filter((k) => tr(`${k.ad} ${k.kurum}`).includes(q))
}

// Yeni kişi formu geçerli mi: ad zorunlu, rol tanımlı olmalı.
export function formGecerli(form) {
  return Boolean(form?.ad?.trim()) && ['investor', 'founder', 'guest'].includes(form?.rol)
}

// "Şu an açık" kartlar: yakın zamanda duyulanlar (brief §6.2 "yeşil nokta = açık"),
// güce göre azalan (yaklaştırılan/en güçlü üstte).
export function acikKartlar(kartlar, esikSn = 8) {
  return kartlar
    .filter((k) => k.seenAgo != null && k.seenAgo <= esikSn)
    .sort((a, b) => b.rssiAlici - a.rssiAlici)
}

// Numara ön ekine göre öneri süzme (boş girdi → hepsi).
export function kartOner(kartlar, girdi) {
  const q = String(girdi ?? '').trim()
  if (!q) return kartlar
  return kartlar.filter((k) => k.kart.startsWith(q))
}
