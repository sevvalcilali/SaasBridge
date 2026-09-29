// Kişi listesi: rol gruplarıyla (Yatırımcılar / Girişimciler / Misafirler),
// her grupta KisiSatiri'ları. Arama/filtre 1.5'te eklenecek.
import { gruplaRol } from '../../api/durum.js'
import KisiSatiri from './KisiSatiri.jsx'
import './KisiListesi.css'

export default function KisiListesi({ people }) {
  const gruplar = gruplaRol(people)

  return (
    <div className="kisi-listesi">
      {gruplar.map((grup) => (
        <section key={grup.rol} className="kisi-grup">
          <h2 className="kisi-grup-baslik">
            {grup.baslik}
            <span className="kisi-grup-sayi sayi">{grup.kisiler.length}</span>
          </h2>
          <ul className="kisi-grup-liste">
            {grup.kisiler.map((kisi) => (
              <KisiSatiri key={kisi.id} kisi={kisi} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
