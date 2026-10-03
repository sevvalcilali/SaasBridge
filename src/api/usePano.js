// React ile api/client.js arasındaki tek köprü. Bileşenler bağlantıyı
// kendileri kurmaz; bu kancadan { durum, baglandi, hata, baglanti } alır.
import { useEffect, useRef, useState } from 'react'
import { PanoBaglantisi, SUNUCU_ADRESI } from './client.js'

export function usePano(adres = SUNUCU_ADRESI) {
  const baglantiRef = useRef(null)
  const [anlik, setAnlik] = useState({ durum: null, baglandi: false, hata: null })

  if (baglantiRef.current === null) {
    baglantiRef.current = new PanoBaglantisi({ adres })
  }

  useEffect(() => {
    const baglanti = new PanoBaglantisi({ adres })
    baglantiRef.current = baglanti
    const birak = baglanti.dinle(setAnlik)
    baglanti.basla()
    return () => { birak(); baglanti.kapat() }
  }, [adres])

  return { ...anlik, baglanti: baglantiRef.current }
}
