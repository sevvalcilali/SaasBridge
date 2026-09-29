// Kişi listesi: arama + filtre + rol gruplarıyla KisiSatiri'ları.
// Süzme api/filtre.js'te; filtre seçimi localStorage'da korunur (brief §11).
import { useMemo, useState } from 'react'
import { gruplaRol } from '../../api/durum.js'
import { filtreleKisiler } from '../../api/filtre.js'
import { useKalici } from '../../api/useKalici.js'
import FiltreCubugu from './FiltreCubugu.jsx'
import KisiSatiri from './KisiSatiri.jsx'
import './KisiListesi.css'

export default function KisiListesi({ people, onKisiAta }) {
  const [filtre, setFiltre] = useKalici('pano.filtre', 'tumu')
  const [arama, setArama] = useState('')

  const gruplar = useMemo(() => {
    const suzulmus = filtreleKisiler(people, { arama, filtre })
    return gruplaRol(suzulmus)
  }, [people, arama, filtre])

  const toplam = gruplar.reduce((n, g) => n + g.kisiler.length, 0)

  return (
    <div className="kisi-listesi">
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
