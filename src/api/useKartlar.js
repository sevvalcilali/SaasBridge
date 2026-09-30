// Alıcının duyduğu kartları (/api/cards) aralıklı yoklar: boştaki kartlar şeridi
// ve kayıp kart uyarısı bunu okur. Bir yoklama başarısız olursa son liste korunur.
import { useEffect, useState } from 'react'

export function useKartlar(api, aralikMs = 3000) {
  const [kartlar, setKartlar] = useState(null)
  useEffect(() => {
    let iptal = false
    const yokla = () => api.kartlariGetir().then((l) => { if (!iptal) setKartlar(l) }).catch(() => {})
    yokla()
    const z = setInterval(yokla, aralikMs)
    return () => { iptal = true; clearInterval(z) }
  }, [api, aralikMs])
  return kartlar
}
