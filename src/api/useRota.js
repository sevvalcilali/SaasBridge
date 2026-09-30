// Hafif hash yönlendirme (bağımlılık yok). #/ = Pano, #/kart-ver = Karşılama masası,
// #/kurulum = Kurulum / eşik ekranı (teknik).
// Aynı anda birden çok ekran açık olabilir (masa tableti + organizatör laptopu).
// #/kart-ver?kart=14 → masa "Kart 14 için kişi seçin" ile açılır (panodaki "Kişi ata").
import { useEffect, useState } from 'react'

const KART_VER = '#/kart-ver'
export const KURULUM_ADRESI = '#/kurulum'

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
  return 'pano'
}

// #/kart-ver?kart=N → "N" (yoksa null)
export function rotaKart(hash) {
  if (rotaAdi(hash) !== 'kart-ver') return null
  const kart = new URLSearchParams(hash.split('?')[1] ?? '').get('kart')
  return kart && /^\d+$/.test(kart) ? kart : null
}

export const kartVerAdresi = (kart) => (kart ? `${KART_VER}?kart=${encodeURIComponent(kart)}` : KART_VER)
