// Kalabalıkta yoğun bir görünümü seyrek tazelemek için: `etkin` iken değer en çok
// `aralikMs`'de bir yenilenir, arada son değer (aynı referans) döner → memo'lu bileşen
// yeniden çizilmez. Etkin değilse değer her zaman günceldir.
import { useRef } from 'react'

export function seyrekDeger(onceki, deger, simdi, aralikMs, etkin) {
  if (!etkin || onceki?.deger == null || simdi - onceki.zaman >= aralikMs) return { deger, zaman: simdi }
  return onceki
}

export function useSeyrek(deger, aralikMs, etkin) {
  const ref = useRef(null)
  ref.current = seyrekDeger(ref.current, deger, Date.now(), aralikMs, etkin)
  return ref.current.deger
}
