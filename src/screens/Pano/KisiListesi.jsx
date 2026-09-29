// Kişi listesi: arama + filtre + rol grupları + kararlı (sakin) sıralama.
// Süzme api/filtre.js, sıralama api/durum.js, yumuşak dizilme useSakinSiralama.
import { useMemo, useRef, useState } from 'react'
import { gruplaRol, siralaKisiler } from '../../api/durum.js'
import { filtreleKisiler } from '../../api/filtre.js'
import { useKalici } from '../../api/useKalici.js'
import FiltreCubugu from './FiltreCubugu.jsx'
import KisiSatiri from './KisiSatiri.jsx'
import { useSakinSiralama } from './useSakinSiralama.js'
import './KisiListesi.css'

export default function KisiListesi({ people, onKisiAta }) {
  const [filtre, setFiltre] = useKalici('pano.filtre', 'tumu')
  const [arama, setArama] = useState('')
  const kapRef = useRef(null)

  const gruplar = useMemo(() => {
    const suzulmus = filtreleKisiler(people, { arama, filtre })
    return gruplaRol(suzulmus).map((g) => ({ ...g, kisiler: siralaKisiler(g.kisiler) }))
  }, [people, arama, filtre])

  const toplam = gruplar.reduce((n, g) => n + g.kisiler.length, 0)

  // Sıralama değişince (durum sırası) satırlar yumuşak kayar. Tetik: her
  // grubun sıralı id dizisi — yalnız gerçekten sıra değişince yeniden çalışır.
  const siraImzasi = gruplar.map((g) => g.kisiler.map((k) => k.id).join(',')).join('|')
  useSakinSiralama(kapRef, siraImzasi)

  return (
    <div className="kisi-listesi" ref={kapRef}>
      <FiltreCubugu arama={arama} filtre={filtre} onArama={setArama} onFiltre={setFiltre} />

      {toplam === 0 ? (
        <p className="kisi-bos">Bu süzgece uyan kişi yok.</p>
      ) : (
        gruplar.map((grup) => (
          <section key={grup.rol} className="kisi-grup">
            <h2 className="kisi-grup-baslik">
              {grup.baslik}
              <span className="kisi-grup-sayi sayi">{grup.kisiler.length}</span>
            </h2>
            <ul className="kisi-grup-liste">
              {grup.kisiler.map((kisi) => (
                <KisiSatiri key={kisi.id} kisi={kisi} onKisiAta={onKisiAta} />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
