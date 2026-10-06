// Karşılama masası saf yardımcıları. Ekran bileşenleri bunları çağırır.

const tr = (s) => (s ?? '').toLocaleLowerCase('tr')

// Kayıtlı katılımcılarda ad/kurum araması (Türkçe büyük-küçük harf duyarsız).
export function katilimciAra(liste, arama) {
  const q = tr(arama).trim()
  if (!q) return liste
  return liste.filter((k) => tr(`${k.ad} ${k.kurum}`).includes(q))
}

// Kişinin masadaki durumu (brief §6.3): kartı var / "kart bekliyor" / "ayrıldı".
// Kartı kayıpsa (brief §6.3 "Kayıp kart") satırda "Kartı kontrol et" görünür.
export function kisiDurumu(k, kayip = false) {
  if (k.atananKart && kayip) return { tur: 'kayip', etiket: `Kart ${k.atananKart} · Kartı kontrol et` }
  if (k.atananKart) return { tur: 'kartli', etiket: `Kart ${k.atananKart}` }
  if (k.ayrildi) return { tur: 'ayrildi', etiket: 'ayrıldı' }
  return { tur: 'bekliyor', etiket: 'kart bekliyor' }
}
export const kartBekleyenler = (liste) => liste.filter((k) => kisiDurumu(k).tur === 'bekliyor')

// Yeni kişi formu geçerli mi: ad zorunlu, rol tanımlı olmalı.
export function formGecerli(form) {
  return Boolean(form?.ad?.trim()) && ['investor', 'founder', 'guest'].includes(form?.rol)
}

// Kişi düzenleme (brief §6): yalnız değişen alanlar gönderilir; renk hiç
// gönderilmez (değişmez). Yatırımcı değilse yıldız 0'dır, girişimci değilse aşama boş.
// Profil (rapor 2. adım): sektör, aşama, tanıtım, web, e-posta, paylaşım izni; eski kayıtta alan yoksa boş / hayır.
export const PROFIL_METINLERI = ['sektor', 'tanitim', 'web', 'eposta']
export function kisiGonderimi(form) {
  return {
    ...form,
    yildiz: form.rol === 'investor' ? form.yildiz : 0,
    asama: form.rol === 'founder' ? (form.asama ?? '') : '',
    ...Object.fromEntries(PROFIL_METINLERI.map((alan) => [alan, (form[alan] ?? '').trim()])),
    paylasim: Boolean(form.paylasim),
  }
}
export function duzenlemeFarki(kisi, form) {
  const g = kisiGonderimi(form)
  const yeni = {
    ad: form.ad.trim(), rol: g.rol, kurum: form.kurum.trim(), yildiz: g.yildiz, not: form.not,
    asama: g.asama, ...Object.fromEntries(PROFIL_METINLERI.map((alan) => [alan, g[alan]])), paylasim: g.paylasim,
  }
  return Object.fromEntries(Object.entries(yeni)
    .filter(([alan, deger]) => deger !== (kisi[alan] ?? (typeof deger === 'boolean' ? false : ''))))
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

// Boştaki kartlar (brief §6.4): açık (yakın zamanda duyulan) ama kimseye atanmamış
// kartlar — masadaki yedekler, stok takibi. Numaraya göre sıralı (zıplamaz).
export function bostakiKartlar(kartlar, esikSn = 8) {
  return kartlar
    .filter((k) => !k.atanan && k.seenAgo != null && k.seenAgo <= esikSn)
    .sort((a, b) => Number(a.kart) - Number(b.kart))
}

// Kayıp kart: kişiye atanmış ve `lost` bildirimiyle aynı ölçüte göre (brief §5.2:
// 60 sn duyulmuyor) susmuş kartlar. En uzun susan üstte.
export const KAYIP_SN = 60
export function kayipKartlar(kartlar, katilimcilar) {
  const kisi = new Map(katilimcilar.map((k) => [k.kisiId, k]))
  return kartlar
    .filter((k) => k.atanan && kisi.has(k.atanan) && k.seenAgo >= KAYIP_SN)
    .map((k) => ({ kisi: kisi.get(k.atanan), kart: k.kart, seenAgo: k.seenAgo }))
    .sort((a, b) => b.seenAgo - a.seenAgo)
}

// "Yaklaştır ve tanı": alıcıya yaklaştırılan kart belirgin en güçlüdür.
// Tek güçlü kart → bulundu; iki+ → "birini uzaklaştırın"; hiç → beklemede.
export function baskinKart(kartlar, esik = -55) {
  const guclu = kartlar.filter((k) => k.rssiAlici > esik)
  if (guclu.length === 1) return { kart: guclu[0].kart, coklu: false }
  if (guclu.length >= 2) return { kart: null, coklu: true }
  return { kart: null, coklu: false }
}
