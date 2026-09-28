// Birim/metin çevirileri — sunucu birimlerinden (dakika/saniye) insan
// diline. Brief §5.1: live/min/invMin/edges.min DAKİKA; seenAgo/
// receiverAge/elapsed SANİYE. Ekran bileşenleri hesap yapmaz, buradan okur.

/** Dakika (float) → "3 dk 20 sn" / "25 sn" / "1 sa 16 dk". Veri yoksa "—". */
export function sureYazisi(dakika) {
  if (dakika == null || !Number.isFinite(dakika)) return '—'
  const toplamSn = Math.round(Math.max(0, dakika) * 60)
  if (toplamSn >= 3600) {
    let sa = Math.floor(toplamSn / 3600)
    let dk = Math.round((toplamSn % 3600) / 60)
    if (dk === 60) { sa += 1; dk = 0 }
    return dk ? `${sa} sa ${dk} dk` : `${sa} sa`
  }
  const dk = Math.floor(toplamSn / 60)
  const sn = toplamSn % 60
  if (dk === 0) return `${sn} sn`
  return sn ? `${dk} dk ${sn} sn` : `${dk} dk`
}

/** Saniye → "az önce" / "25 sn önce" / "2 dk önce". null = hiç duyulmadı. */
export function onceYazisi(saniye) {
  if (saniye == null || !Number.isFinite(saniye)) return 'hiç duyulmadı'
  const sn = Math.round(Math.max(0, saniye))
  if (sn < 10) return 'az önce'
  if (sn < 60) return `${sn} sn önce`
  if (sn < 3600) return `${Math.floor(sn / 60)} dk önce`
  return `${Math.floor(sn / 3600)} sa önce`
}
