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

// Kart iadesi adayları: şu an kartı olan kişiler, kart numarasına göre sıralı.
// Arama ad/kurumda ya da kart numarasında (görevli çoğu zaman karttaki no'yu okur).
export function iadeAdaylari(liste, arama) {
  const q = tr(arama).trim()
  return liste
    .filter((k) => k.atananKart && (!q || tr(`${k.ad} ${k.kurum}`).includes(q) || k.atananKart.startsWith(q)))
    .sort((a, b) => Number(a.atananKart) - Number(b.atananKart))
}

// Brief §6 "Yanlış atama düzeltme": son birkaç dakikadaki atama geri alınabilir.
export const GERI_AL_DK = 5
export function geriAlinabilir(atama, simdi = Date.now(), pencereDk = GERI_AL_DK) {
  return Boolean(atama) && simdi - atama.zaman < pencereDk * 60_000
}

// "Yaklaştır ve tanı": alıcıya yaklaştırılan kart belirgin en güçlüdür.
// Tek güçlü kart → bulundu; iki+ → "birini uzaklaştırın"; hiç → beklemede.
export function baskinKart(kartlar, esik = -55) {
  const guclu = kartlar.filter((k) => k.rssiAlici > esik)
  if (guclu.length === 1) return { kart: guclu[0].kart, coklu: false }
  if (guclu.length >= 2) return { kart: null, coklu: true }
  return { kart: null, coklu: false }
}
