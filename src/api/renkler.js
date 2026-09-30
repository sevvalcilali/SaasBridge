// Sunucunun koyu-zemin kişi paleti (brief §10) → açık temanın doğrulanmış
// paleti. Renk kişiyi takip eder: eşleme sabittir, sıraya bakmaz.
// #199e70 özel durum: yeşil yalnız "birlikte" demek olduğundan petrole
// eşlenir (PLAN B.1 kararının sunucudan-gelen-renk ayağı).

export const ACIK_PALET = {
  mavi: '#2f6fc0',
  turuncu: '#c25022',
  hardal: '#9a6b00',
  pembe: '#bb3b68',
  mor: '#6a5cd0',
  mercan: '#bf4545',
  petrol: '#0f7b8a',
  gri: '#6d675e',
}

const ESLEME = new Map([
  ['#3987e5', ACIK_PALET.mavi],
  ['#d95926', ACIK_PALET.turuncu],
  ['#199e70', ACIK_PALET.petrol],
  ['#c98500', ACIK_PALET.hardal],
  ['#d55181', ACIK_PALET.pembe],
  ['#9085e9', ACIK_PALET.mor],
  ['#e66767', ACIK_PALET.mercan],
  ['#898781', ACIK_PALET.gri],
])

/** Sunucudan gelen kişi rengini açık temaya uyarlar; bilinmeyen renk aynen geçer. */
export function sunucuRengi(hex) {
  if (!hex) return ACIK_PALET.gri
  return ESLEME.get(hex.toLowerCase()) ?? hex
}

// Kayıt defterindeki katılımcının rengi (masa / rapor): panodakiyle aynı eşleme.
// Renk kişiyi takip eder ve yeşil yalnız "birlikte" demektir (brief §10).
export const katilimciRengiUyarla = (k) => ({ ...k, renk: sunucuRengi(k.renk) })
