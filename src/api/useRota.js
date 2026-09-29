// Hafif hash yönlendirme (bağımlılık yok). #/ = Pano, #/kart-ver = Karşılama masası.
// Aynı anda birden çok ekran açık olabilir (masa tableti + organizatör laptopu).
import { useEffect, useState } from 'react'

export function useRota() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const dinle = () => setHash(window.location.hash)
    window.addEventListener('hashchange', dinle)
    return () => window.removeEventListener('hashchange', dinle)
  }, [])
  return hash === '#/kart-ver' ? 'kart-ver' : 'pano'
}
