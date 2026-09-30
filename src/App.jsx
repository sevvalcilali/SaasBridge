// Uygulama kökü + hafif yönlendirme. Pano ↔ Kart Ver ↔ Kurulum ↔ Rapor.
import { useRota } from './api/useRota.js'
import { useTema } from './api/useTema.js'
import TemaSecici from './components/TemaSecici.jsx'
import PanoEkrani from './screens/Pano/PanoEkrani.jsx'
import KartVerEkrani from './screens/KartVer/KartVerEkrani.jsx'
import KurulumEkrani from './screens/Kurulum/KurulumEkrani.jsx'
import RaporEkrani from './screens/Rapor/RaporEkrani.jsx'
import './App.css'

const SEKMELER = [
  { rota: 'pano', yol: '#/', etiket: 'Pano' },
  { rota: 'kart-ver', yol: '#/kart-ver', etiket: 'Kart Ver' },
  { rota: 'kurulum', yol: '#/kurulum', etiket: 'Kurulum' },
  { rota: 'rapor', yol: '#/rapor', etiket: 'Rapor' },
]

export default function App() {
  const rota = useRota()
  const [tema, setTema] = useTema()
  return (
    <div className="uygulama">
      <nav className="uyg-nav" aria-label="Ekranlar">
        {SEKMELER.map((s) => (
          <a
            key={s.rota}
            href={s.yol}
            className={`uyg-nav-bag ${rota === s.rota ? 'uyg-nav-bag--secili' : ''}`}
            aria-current={rota === s.rota ? 'page' : undefined}
          >
            {s.etiket}
          </a>
        ))}
        <span className="uyg-nav-sag"><TemaSecici tema={tema} onDegis={setTema} /></span>
      </nav>
      {rota === 'kart-ver' && <KartVerEkrani />}
      {rota === 'kurulum' && <KurulumEkrani />}
      {rota === 'rapor' && <RaporEkrani />}
      {rota === 'pano' && <PanoEkrani />}
    </div>
  )
}
