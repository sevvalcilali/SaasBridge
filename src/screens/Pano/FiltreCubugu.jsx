// Kişi listesi arama kutusu + filtre düğmeleri. Yalnız görüntüler ve
// seçimi üst bileşene iletir; süzme mantığı api/filtre.js'te.
import { FILTRELER } from '../../api/filtre.js'

export default function FiltreCubugu({ arama, filtre, onArama, onFiltre }) {
  return (
    <div className="filtre-cubugu">
      <input
        type="search"
        className="filtre-arama"
        placeholder="Ara: ad, kurum, kart no"
        value={arama}
        onChange={(e) => onArama(e.target.value)}
        aria-label="Kişi ara"
      />
      <div className="filtre-dugmeler" role="group" aria-label="Filtre">
        {FILTRELER.map((f) => (
          <button
            key={f.deger}
            type="button"
            className={`filtre-dugme ${filtre === f.deger ? 'filtre-dugme--secili' : ''}`}
            aria-pressed={filtre === f.deger}
            onClick={() => onFiltre(f.deger)}
          >
            {f.etiket}
          </button>
        ))}
      </div>
    </div>
  )
}
