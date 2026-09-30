// Kişi ayrıntı paneli için ek veri (kayıt defteri, görüşme kayıtları, kartlar).
// Panel açıkken 5 sn'de bir yoklanır; yoklama başarısız olursa son veri korunur.
import { useEffect, useState } from 'react'

export function usePanelVerisi(api, aralikMs = 5000) {
  const [veri, setVeri] = useState(null) // { kisiler, oturumlar, kartlar }
  const [hata, setHata] = useState(false) // ör. gerçek sunucuda uçlar henüz yok → "alınamadı"
  useEffect(() => {
    let iptal = false
    const yokla = () => Promise.all([api.kisileriGetir(), api.oturumlariGetir(), api.kartlariGetir()])
      .then(([kisiler, oturumlar, kartlar]) => { if (!iptal) { setVeri({ kisiler, oturumlar, kartlar }); setHata(false) } })
      .catch(() => { if (!iptal) setHata(true) })
    yokla()
    const z = setInterval(yokla, aralikMs)
    return () => { iptal = true; clearInterval(z) }
  }, [api, aralikMs])
  return { veri, hata }
}
