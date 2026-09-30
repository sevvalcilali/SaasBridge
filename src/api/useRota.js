// Hafif hash yönlendirme (bağımlılık yok). #/ = Pano, #/kart-ver = Karşılama masası,
// #/kurulum = Kurulum / eşik ekranı (teknik), #/rapor = Etkinlik raporu.
// Aynı anda birden çok ekran açık olabilir (masa tableti + organizatör laptopu).
// #/kart-ver?kart=14 → masa "Kart 14 için kişi seçin" ile açılır (panodaki "Kişi ata").
// #/kart-ver?degistir=14 → Kart 14'ün sahibiyle kart değişimi; ?iade=14 → Kart 14'ün iadesi
// (kişi ayrıntı panelindeki kısayollar, brief §7).
import { useEffect, useState } from 'react'

const KART_VER = '#/kart-ver'
export const KURULUM_ADRESI = '#/kurulum'
export const RAPOR_ADRESI = '#/rapor'

export function useRota() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const dinle = () => setHash(window.location.hash)
    window.addEventListener('hashchange', dinle)
    return () => window.removeEventListener('hashchange', dinle)
  }, [])
  return rotaAdi(hash)
}

export function rotaAdi(hash) {
  if (hash === KART_VER || hash.startsWith(`${KART_VER}?`)) return 'kart-ver'
  if (hash === KURULUM_ADRESI) return 'kurulum'
  if (hash === RAPOR_ADRESI) return 'rapor'
  return 'pano'
}

// #/kart-ver?<ad>=N → "N" (yalnız sayısal; yoksa null)
export function rotaParametresi(hash, ad) {
  if (rotaAdi(hash) !== 'kart-ver') return null
  const v = new URLSearchParams(hash.split('?')[1] ?? '').get(ad)
  return v && /^\d+$/.test(v) ? v : null
}
export const rotaKart = (hash) => rotaParametresi(hash, 'kart')

export const kartVerAdresi = (kart) => (kart ? `${KART_VER}?kart=${encodeURIComponent(kart)}` : KART_VER)
export const kartDegistirAdresi = (kart) => `${KART_VER}?degistir=${encodeURIComponent(kart)}`
export const kartIadeAdresi = (kart) => `${KART_VER}?iade=${encodeURIComponent(kart)}`
