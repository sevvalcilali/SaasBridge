// Durum nesnesinden türetilen küçük kararlar. Ekran bileşenleri bu
// yardımcıları çağırır, JSX içinde eşik/karşılaştırma/metin kurgusu yapmaz.
import { sureYazisi, onceYazisi } from './format.js'

// brief §5.1: receiverAge alıcıdan son satırın kaç SANİYE önce geldiği;
// >5 ise sorun var, null ise hiç veri gelmemiş.
export function aliciBagli(durum) {
  const yas = durum?.receiverAge
  return yas != null && yas <= 5
}

// Girişimcide kurum adı kişi adından önce gösterilir (brief §3).
export function gorunenAd(kisi) {
  if (kisi.role === 'founder' && kisi.org) return `${kisi.org} · ${kisi.name}`
  return kisi.name
}

// Satırdaki durum cümlesi (brief §7): "X ile · süre" / "boşta" / "görünmüyor · …".
export function durumCumlesi(kisi) {
  if (kisi.status === 'talking') return `${kisi.withName} ile · ${sureYazisi(kisi.live)}`
  if (kisi.status === 'away') return `görünmüyor · ${onceYazisi(kisi.seenAgo)}`
  return 'boşta'
}

// Sunucu, listede olmayan bir kart duyulunca onu "Kart N", role:"guest"
// olarak kendiliğinden ekler (brief §5.1). Bu satır "atanmamış kart" olarak
// öne çıkarılır ve "Kişi ata" düğmesi gösterilir.
export function atanmamisKartMi(kisi) {
  return kisi.role === 'guest' && /^Kart \d+$/.test(kisi.name)
}

// Kararlı sıralama: durum önceliği, eşitlikte sunucu sırası. Süre gibi her
// tik değişen değerlere göre sıralama YAPILMAZ — liste ancak durum değişince
// yeniden dizilir, saniyede 2 güncellemeyle zıplamaz (brief §10 sakin hareket).
const DURUM_ONCELIK = { talking: 0, idle: 1, away: 2 }
export function siralaKisiler(people) {
  return people
    .map((k, i) => ({ k, i }))
    .sort((a, b) => (DURUM_ONCELIK[a.k.status] - DURUM_ONCELIK[b.k.status]) || (a.i - b.i))
    .map((x) => x.k)
}

// Alt şerit özet kutuları (brief §5.1 stats). Biçimleme burada, JSX'te değil.
export function ozetKutulari(durum) {
  const s = durum.stats
  return [
    { ad: 'şu an birlikte', deger: String(s.livePairs) },
    { ad: 'biten görüşme', deger: String(s.done) },
    { ad: 'karma görüşme', deger: sureYazisi(s.mixedMin) },
    { ad: 'potansiyel anlaşma', deger: String(s.deals) },
    { ad: 'yatırımcıya ulaşan girişimci', deger: `${s.reached}/${s.founders}` },
  ]
}

// Etkinlik ilerlemesi yüzde (0..100). Tanımsızsa null (çubuk gizlenir).
export function etkinlikYuzde(durum) {
  const p = durum.event?.progress
  if (p == null || !Number.isFinite(p)) return null
  return Math.round(Math.min(1, Math.max(0, p)) * 100)
}

const ROL_SIRA = [
  { rol: 'investor', baslik: 'Yatırımcılar' },
  { rol: 'founder', baslik: 'Girişimciler' },
  { rol: 'guest', baslik: 'Misafirler' },
]

// Kişileri rol gruplarına ayırır. Sıra sabittir (yatırımcı→girişimci→misafir),
// grup içi sıra sunucudan geldiği gibi korunur (sakin sıralama). Boş grup atlanır.
export function gruplaRol(people) {
  return ROL_SIRA
    .map(({ rol, baslik }) => ({ rol, baslik, kisiler: people.filter((k) => k.role === rol) }))
    .filter((g) => g.kisiler.length > 0)
}
